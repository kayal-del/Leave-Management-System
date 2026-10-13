package com.leave.system.service;

import com.leave.system.dto.AuthResponse;
import com.leave.system.dto.LoginRequest;
import com.leave.system.dto.SignUpRequest;
import com.leave.system.exception.BadRequestException;
import com.leave.system.model.Role;
import com.leave.system.model.Team;
import com.leave.system.model.User;
import com.leave.system.repository.TeamRepository;
import com.leave.system.repository.UserRepository;
import com.leave.system.security.JwtTokenProvider;
import com.leave.system.security.UserPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       TeamRepository teamRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse register(SignUpRequest request) {
        if (request.getPassword() == null || request.getConfirmPassword() == null ||
                !request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match.");
        }

        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("An account with this email address already exists.");
        }

        String userId = "USR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String passwordHash = passwordEncoder.encode(request.getPassword());

        User user = new User(
                userId,
                request.getFullName().trim(),
                request.getEmail().trim().toLowerCase(),
                passwordHash,
                Role.Employee, // Public signup always gets Employee role
                true
        );

        userRepository.save(user);

        // Assign new employee to a default team if one exists so manager can see them
        List<Team> teams = teamRepository.findAll();
        if (!teams.isEmpty()) {
            Team primaryTeam = teams.get(0);
            if (!primaryTeam.getEmployeeReferences().contains(userId)) {
                primaryTeam.getEmployeeReferences().add(userId);
                teamRepository.save(primaryTeam);
            }
        }

        UserPrincipal principal = UserPrincipal.create(user);
        String token = tokenProvider.generateToken(principal);

        return new AuthResponse(token, user.getUserId(), user.getName(), user.getEmail(), user.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Incorrect email or password. Please try again."));

        if (!user.isActiveStatus()) {
            throw new BadRequestException("Incorrect email or password. Please try again.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Incorrect email or password. Please try again.");
        }

        UserPrincipal principal = UserPrincipal.create(user);
        String token = tokenProvider.generateToken(principal);

        return new AuthResponse(token, user.getUserId(), user.getName(), user.getEmail(), user.getRole());
    }

    public User getCurrentUser(UserPrincipal principal) {
        return userRepository.findByUserId(principal.getUserId())
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
