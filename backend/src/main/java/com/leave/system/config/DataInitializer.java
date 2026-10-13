package com.leave.system.config;

import com.leave.system.model.*;
import com.leave.system.repository.DecisionHistoryRepository;
import com.leave.system.repository.LeaveRequestRepository;
import com.leave.system.repository.TeamRepository;
import com.leave.system.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final DecisionHistoryRepository decisionHistoryRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           TeamRepository teamRepository,
                           LeaveRequestRepository leaveRequestRepository,
                           DecisionHistoryRepository decisionHistoryRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.decisionHistoryRepository = decisionHistoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            // Seed Admin
            User admin = new User(
                    "USR-ADMIN01",
                    "Admin User",
                    "admin@company.com",
                    passwordEncoder.encode("Admin@123"),
                    Role.Admin,
                    true
            );
            userRepository.save(admin);

            // Seed Manager
            User manager = new User(
                    "USR-MGR001",
                    "Sarah Jenkins",
                    "manager@company.com",
                    passwordEncoder.encode("Manager@123"),
                    Role.Manager,
                    true
            );
            userRepository.save(manager);

            // Seed Employee
            User employee = new User(
                    "USR-EMP001",
                    "Alex Morgan",
                    "employee@company.com",
                    passwordEncoder.encode("Employee@123"),
                    Role.Employee,
                    true
            );
            userRepository.save(employee);

            // Seed Team
            List<String> teamMembers = new ArrayList<>();
            teamMembers.add(employee.getUserId());
            Team team = new Team(
                    "TEAM-ENG01",
                    "Engineering Team",
                    manager.getUserId(),
                    teamMembers
            );
            teamRepository.save(team);

            // Seed sample leave requests
            LocalDate today = LocalDate.now();

            LeaveRequest pendingReq = new LeaveRequest(
                    "REQ-10001",
                    employee.getUserId(),
                    "Annual Leave",
                    today.plusDays(7).toString(),
                    today.plusDays(10).toString(),
                    LeaveStatus.Pending
            );
            leaveRequestRepository.save(pendingReq);

            LeaveRequest approvedReq = new LeaveRequest(
                    "REQ-10002",
                    employee.getUserId(),
                    "Sick Leave",
                    today.minusDays(14).toString(),
                    today.minusDays(12).toString(),
                    LeaveStatus.Approved
            );
            leaveRequestRepository.save(approvedReq);
            decisionHistoryRepository.save(new DecisionHistory(approvedReq.getRequestId(), manager.getUserId(), Decision.Approved));

            LeaveRequest rejectedReq = new LeaveRequest(
                    "REQ-10003",
                    employee.getUserId(),
                    "Casual Leave",
                    today.minusDays(5).toString(),
                    today.minusDays(4).toString(),
                    LeaveStatus.Rejected
            );
            leaveRequestRepository.save(rejectedReq);
            decisionHistoryRepository.save(new DecisionHistory(rejectedReq.getRequestId(), manager.getUserId(), Decision.Rejected));
        }
    }
}
