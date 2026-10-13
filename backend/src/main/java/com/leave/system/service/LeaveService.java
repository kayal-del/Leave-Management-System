package com.leave.system.service;

import com.leave.system.dto.DashboardSummary;
import com.leave.system.dto.LeaveApplicationRequest;
import com.leave.system.dto.LeaveRequestResponse;
import com.leave.system.dto.LeaveUpdateRequest;
import com.leave.system.exception.BadRequestException;
import com.leave.system.exception.ResourceNotFoundException;
import com.leave.system.exception.UnauthorizedException;
import com.leave.system.model.LeaveRequest;
import com.leave.system.model.LeaveStatus;
import com.leave.system.model.User;
import com.leave.system.repository.LeaveRequestRepository;
import com.leave.system.repository.UserRepository;
import com.leave.system.security.UserPrincipal;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;

    public LeaveService(LeaveRequestRepository leaveRequestRepository, UserRepository userRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.userRepository = userRepository;
    }

    public LeaveRequestResponse createLeaveRequest(UserPrincipal principal, LeaveApplicationRequest request) {
        if (request.getEndDate().compareTo(request.getStartDate()) < 0) {
            throw new BadRequestException("The end date must be on or after the start date.");
        }

        String requestId = "REQ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        LeaveRequest leaveRequest = new LeaveRequest(
                requestId,
                principal.getUserId(),
                request.getLeaveType(),
                request.getStartDate(),
                request.getEndDate(),
                LeaveStatus.Pending
        );

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return mapToResponse(saved, principal.getName());
    }

    public List<LeaveRequestResponse> getMyRequests(UserPrincipal principal) {
        List<LeaveRequest> requests = leaveRequestRepository.findByEmployeeReferenceOrderByCreatedAtDesc(principal.getUserId());
        return requests.stream()
                .map(r -> mapToResponse(r, principal.getName()))
                .collect(Collectors.toList());
    }

    public DashboardSummary getMyDashboardSummary(UserPrincipal principal) {
        String employeeId = principal.getUserId();
        long total = leaveRequestRepository.countByEmployeeReference(employeeId);
        long pending = leaveRequestRepository.countByEmployeeReferenceAndStatus(employeeId, LeaveStatus.Pending);
        long approved = leaveRequestRepository.countByEmployeeReferenceAndStatus(employeeId, LeaveStatus.Approved);
        long rejected = leaveRequestRepository.countByEmployeeReferenceAndStatus(employeeId, LeaveStatus.Rejected);

        return new DashboardSummary(total, pending, approved, rejected);
    }

    public LeaveRequestResponse getRequestDetails(UserPrincipal principal, String requestId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findByRequestId(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with ID: " + requestId));

        if (!leaveRequest.getEmployeeReference().equals(principal.getUserId())) {
            throw new UnauthorizedException("You are not authorized to view this leave request.");
        }

        return mapToResponse(leaveRequest, principal.getName());
    }

    public LeaveRequestResponse updateLeaveRequest(UserPrincipal principal, String requestId, LeaveUpdateRequest request) {
        LeaveRequest leaveRequest = leaveRequestRepository.findByRequestId(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with ID: " + requestId));

        if (!leaveRequest.getEmployeeReference().equals(principal.getUserId())) {
            throw new UnauthorizedException("You are not authorized to modify this leave request.");
        }

        if (leaveRequest.getStatus() != LeaveStatus.Pending) {
            throw new BadRequestException("Only pending leave requests can be updated.");
        }

        if (request.getEndDate().compareTo(request.getStartDate()) < 0) {
            throw new BadRequestException("The end date must be on or after the start date.");
        }

        leaveRequest.setLeaveType(request.getLeaveType());
        leaveRequest.setStartDate(request.getStartDate());
        leaveRequest.setEndDate(request.getEndDate());
        leaveRequest.setUpdatedAt(Instant.now());

        LeaveRequest updated = leaveRequestRepository.save(leaveRequest);
        return mapToResponse(updated, principal.getName());
    }

    public void deleteLeaveRequest(UserPrincipal principal, String requestId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findByRequestId(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with ID: " + requestId));

        if (!leaveRequest.getEmployeeReference().equals(principal.getUserId())) {
            throw new UnauthorizedException("You are not authorized to delete this leave request.");
        }

        if (leaveRequest.getStatus() != LeaveStatus.Pending) {
            throw new BadRequestException("Only pending leave requests can be deleted.");
        }

        leaveRequestRepository.delete(leaveRequest);
    }

    private LeaveRequestResponse mapToResponse(LeaveRequest request, String employeeName) {
        if (employeeName == null) {
            User emp = userRepository.findByUserId(request.getEmployeeReference()).orElse(null);
            employeeName = emp != null ? emp.getName() : "Unknown Employee";
        }
        return new LeaveRequestResponse(
                request.getRequestId(),
                request.getEmployeeReference(),
                employeeName,
                request.getLeaveType(),
                request.getStartDate(),
                request.getEndDate(),
                request.getStatus(),
                request.getCreatedAt()
        );
    }
}
