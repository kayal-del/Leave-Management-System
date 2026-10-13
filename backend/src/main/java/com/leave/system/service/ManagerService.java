package com.leave.system.service;

import com.leave.system.dto.DashboardSummary;
import com.leave.system.dto.LeaveDecisionRequest;
import com.leave.system.dto.LeaveRequestResponse;
import com.leave.system.exception.BadRequestException;
import com.leave.system.exception.ResourceNotFoundException;
import com.leave.system.exception.UnauthorizedException;
import com.leave.system.model.*;
import com.leave.system.repository.DecisionHistoryRepository;
import com.leave.system.repository.LeaveRequestRepository;
import com.leave.system.repository.TeamRepository;
import com.leave.system.repository.UserRepository;
import com.leave.system.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ManagerService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final TeamRepository teamRepository;
    private final DecisionHistoryRepository decisionHistoryRepository;
    private final UserRepository userRepository;

    public ManagerService(LeaveRequestRepository leaveRequestRepository,
                          TeamRepository teamRepository,
                          DecisionHistoryRepository decisionHistoryRepository,
                          UserRepository userRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.teamRepository = teamRepository;
        this.decisionHistoryRepository = decisionHistoryRepository;
        this.userRepository = userRepository;
    }

    private List<String> getTeamEmployeeIds(String managerId) {
        List<Team> teams = teamRepository.findAllByManagerReference(managerId);
        if (teams.isEmpty()) {
            teams = teamRepository.findAll();
        }
        Set<String> employeeIds = new HashSet<>();
        for (Team team : teams) {
            if (team.getEmployeeReferences() != null) {
                employeeIds.addAll(team.getEmployeeReferences());
            }
        }
        return new ArrayList<>(employeeIds);
    }

    public DashboardSummary getTeamDashboardSummary(UserPrincipal principal) {
        List<String> employeeIds = getTeamEmployeeIds(principal.getUserId());
        if (employeeIds.isEmpty()) {
            return new DashboardSummary(0, 0, 0, 0);
        }

        long total = leaveRequestRepository.countByEmployeeReferenceIn(employeeIds);
        long pending = leaveRequestRepository.countByEmployeeReferenceInAndStatus(employeeIds, LeaveStatus.Pending);
        long approved = leaveRequestRepository.countByEmployeeReferenceInAndStatus(employeeIds, LeaveStatus.Approved);
        long rejected = leaveRequestRepository.countByEmployeeReferenceInAndStatus(employeeIds, LeaveStatus.Rejected);

        return new DashboardSummary(total, pending, approved, rejected);
    }

    public List<LeaveRequestResponse> getTeamRequests(UserPrincipal principal) {
        List<String> employeeIds = getTeamEmployeeIds(principal.getUserId());
        if (employeeIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<LeaveRequest> requests = leaveRequestRepository.findByEmployeeReferenceInOrderByCreatedAtDesc(employeeIds);

        // Sort: Pending requests first, then by date descending
        requests.sort((a, b) -> {
            if (a.getStatus() == LeaveStatus.Pending && b.getStatus() != LeaveStatus.Pending) return -1;
            if (a.getStatus() != LeaveStatus.Pending && b.getStatus() == LeaveStatus.Pending) return 1;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        // Pre-fetch employee names
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

    public LeaveRequestResponse getTeamRequestDetails(UserPrincipal principal, String requestId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findByRequestId(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with ID: " + requestId));

        List<String> managedEmployees = getTeamEmployeeIds(principal.getUserId());
        if (!managedEmployees.contains(leaveRequest.getEmployeeReference())) {
            throw new UnauthorizedException("You are not authorized to review leave requests for this employee.");
        }

        User emp = userRepository.findByUserId(leaveRequest.getEmployeeReference()).orElse(null);
        String employeeName = emp != null ? emp.getName() : "Unknown Employee";

        return new LeaveRequestResponse(
                leaveRequest.getRequestId(),
                leaveRequest.getEmployeeReference(),
                employeeName,
                leaveRequest.getLeaveType(),
                leaveRequest.getStartDate(),
                leaveRequest.getEndDate(),
                leaveRequest.getStatus(),
                leaveRequest.getCreatedAt()
        );
    }

    @Transactional
    public synchronized LeaveRequestResponse processDecision(UserPrincipal principal, String requestId, LeaveDecisionRequest request) {
        LeaveRequest leaveRequest = leaveRequestRepository.findByRequestId(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with ID: " + requestId));

        List<String> managedEmployees = getTeamEmployeeIds(principal.getUserId());
        if (!managedEmployees.contains(leaveRequest.getEmployeeReference())) {
            throw new UnauthorizedException("You are not authorized to review leave requests for this employee.");
        }

        if (leaveRequest.getStatus() != LeaveStatus.Pending) {
            throw new BadRequestException("This leave request is no longer pending.");
        }

        if (decisionHistoryRepository.existsByRequestReference(requestId)) {
            throw new BadRequestException("A decision has already been recorded for this leave request.");
        }

        Decision decisionEnum;
        try {
            decisionEnum = Decision.valueOf(request.getDecision());
        } catch (Exception e) {
            throw new BadRequestException("Invalid decision. Must be Approved or Rejected.");
        }

        leaveRequest.setStatus(decisionEnum == Decision.Approved ? LeaveStatus.Approved : LeaveStatus.Rejected);
        leaveRequest.setUpdatedAt(Instant.now());
        leaveRequestRepository.save(leaveRequest);

        DecisionHistory history = new DecisionHistory(requestId, principal.getUserId(), decisionEnum);
        decisionHistoryRepository.save(history);

        User emp = userRepository.findByUserId(leaveRequest.getEmployeeReference()).orElse(null);
        String employeeName = emp != null ? emp.getName() : "Unknown Employee";

        return new LeaveRequestResponse(
                leaveRequest.getRequestId(),
                leaveRequest.getEmployeeReference(),
                employeeName,
                leaveRequest.getLeaveType(),
                leaveRequest.getStartDate(),
                leaveRequest.getEndDate(),
                leaveRequest.getStatus(),
                leaveRequest.getCreatedAt()
        );
    }
}
