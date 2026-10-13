package com.leave.system.service;

import com.leave.system.dto.*;
import com.leave.system.exception.BadRequestException;
import com.leave.system.exception.ResourceNotFoundException;
import com.leave.system.model.LeaveRequest;
import com.leave.system.model.Role;
import com.leave.system.model.Team;
import com.leave.system.model.User;
import com.leave.system.repository.LeaveRequestRepository;
import com.leave.system.repository.TeamRepository;
import com.leave.system.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final TeamRepository teamRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository,
                        LeaveRequestRepository leaveRequestRepository,
                        TeamRepository teamRepository,
                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.teamRepository = teamRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        // Clear password hashes before returning
        for (User u : users) {
            u.setPasswordHash(null);
        }
        return users;
    }

    public User createUser(UserCreateRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new BadRequestException("Please enter a valid name.");
        }
        if (request.getEmail() == null || !request.getEmail().contains("@")) {
            throw new BadRequestException("Please enter a valid email address.");
        }
        if (request.getRole() == null) {
            throw new BadRequestException("Please select a role.");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("This email address is already registered.");
        }

        String userId = "USR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String rawPassword = (request.getPassword() != null && !request.getPassword().trim().isEmpty())
                ? request.getPassword() : "Default@123";
        String passwordHash = passwordEncoder.encode(rawPassword);

        User user = new User(
                userId,
                request.getName().trim(),
                email,
                passwordHash,
                request.getRole(),
                true
        );

        User saved = userRepository.save(user);

        // If employee, add to primary team if exists
        if (saved.getRole() == Role.Employee) {
            List<Team> teams = teamRepository.findAll();
            if (!teams.isEmpty()) {
                Team team = teams.get(0);
                if (!team.getEmployeeReferences().contains(saved.getUserId())) {
                    team.getEmployeeReferences().add(saved.getUserId());
                    teamRepository.save(team);
                }
            }
        }

        saved.setPasswordHash(null);
        return saved;
    }

    public User updateUser(String userId, UserUpdateRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new BadRequestException("Please enter a valid name.");
        }
        if (request.getEmail() == null || !request.getEmail().contains("@")) {
            throw new BadRequestException("Please enter a valid email address.");
        }
        if (request.getRole() == null) {
            throw new BadRequestException("Please select a role.");
        }

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        String email = request.getEmail().trim().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(email) && userRepository.existsByEmail(email)) {
            throw new BadRequestException("This email address is already registered.");
        }

        // Check last active Admin protection
        boolean isDemotingAdmin = user.getRole() == Role.Admin && request.getRole() != Role.Admin;
        boolean isDeactivatingAdmin = user.getRole() == Role.Admin && Boolean.FALSE.equals(request.getActiveStatus());

        if (isDemotingAdmin || isDeactivatingAdmin) {
            long activeAdminCount = userRepository.countByRoleAndActiveStatus(Role.Admin, true);
            if (activeAdminCount <= 1) {
                throw new BadRequestException("Cannot demote or deactivate the last active Admin.");
            }
        }

        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setRole(request.getRole());
        if (request.getActiveStatus() != null) {
            user.setActiveStatus(request.getActiveStatus());
        }

        User updated = userRepository.save(user);
        updated.setPasswordHash(null);
        return updated;
    }

    public void deactivateOrRemoveUser(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (user.getRole() == Role.Admin) {
            long activeAdminCount = userRepository.countByRoleAndActiveStatus(Role.Admin, true);
            if (activeAdminCount <= 1) {
                throw new BadRequestException("Cannot remove the last active Admin.");
            }
        }

        // Preserve historical leave records by setting activeStatus = false
        user.setActiveStatus(false);
        userRepository.save(user);
    }

    public List<LeaveRequestResponse> getAllLeaveRequests() {
        List<LeaveRequest> requests = leaveRequestRepository.findAllByOrderByCreatedAtDesc();

        Map<String, String> userNames = new HashMap<>();
        for (User u : userRepository.findAll()) {
            userNames.put(u.getUserId(), u.getName());
        }

        return requests.stream()
                .map(r -> new LeaveRequestResponse(
                        r.getRequestId(),
                        r.getEmployeeReference(),
                        userNames.getOrDefault(r.getEmployeeReference(), "Unknown Employee"),
                        r.getLeaveType(),
                        r.getStartDate(),
                        r.getEndDate(),
                        r.getStatus(),
                        r.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    public DashboardSummary getAdminDashboardSummary() {
        long total = leaveRequestRepository.count();
        long pending = leaveRequestRepository.findAll().stream().filter(r -> r.getStatus() == com.leave.system.model.LeaveStatus.Pending).count();
        long approved = leaveRequestRepository.findAll().stream().filter(r -> r.getStatus() == com.leave.system.model.LeaveStatus.Approved).count();
        long rejected = leaveRequestRepository.findAll().stream().filter(r -> r.getStatus() == com.leave.system.model.LeaveStatus.Rejected).count();

        return new DashboardSummary(total, pending, approved, rejected);
    }
}
