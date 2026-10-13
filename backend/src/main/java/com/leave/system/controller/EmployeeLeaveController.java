package com.leave.system.controller;

import com.leave.system.dto.*;
import com.leave.system.security.UserPrincipal;
import com.leave.system.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employee/leave")
public class EmployeeLeaveController {

    private final LeaveService leaveService;

    public EmployeeLeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummary>> getSummary(@AuthenticationPrincipal UserPrincipal principal) {
        DashboardSummary summary = leaveService.getMyDashboardSummary(principal);
        return ResponseEntity.ok(ApiResponse.ok("Dashboard summary retrieved", summary));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<ApiResponse<List<LeaveRequestResponse>>> getMyRequests(@AuthenticationPrincipal UserPrincipal principal) {
        List<LeaveRequestResponse> requests = leaveService.getMyRequests(principal);
        return ResponseEntity.ok(ApiResponse.ok("Leave requests retrieved", requests));
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> applyForLeave(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody LeaveApplicationRequest request) {
        LeaveRequestResponse response = leaveService.createLeaveRequest(principal, request);
        return ResponseEntity.ok(ApiResponse.ok("Your leave request has been submitted. Its status is Pending.", response));
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> getRequestDetails(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String requestId) {
        LeaveRequestResponse response = leaveService.getRequestDetails(principal, requestId);
        return ResponseEntity.ok(ApiResponse.ok("Request details retrieved", response));
    }

    @PutMapping("/{requestId}")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> updateRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String requestId,
            @Valid @RequestBody LeaveUpdateRequest request) {
        LeaveRequestResponse response = leaveService.updateLeaveRequest(principal, requestId, request);
        return ResponseEntity.ok(ApiResponse.ok("Your leave request has been updated.", response));
    }

    @DeleteMapping("/{requestId}")
    public ResponseEntity<ApiResponse<Void>> deleteRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String requestId) {
        leaveService.deleteLeaveRequest(principal, requestId);
        return ResponseEntity.ok(ApiResponse.ok("Your leave request has been deleted."));
    }
}
