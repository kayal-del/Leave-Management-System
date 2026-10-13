package com.leave.system.controller;

import com.leave.system.dto.ApiResponse;
import com.leave.system.dto.DashboardSummary;
import com.leave.system.dto.LeaveDecisionRequest;
import com.leave.system.dto.LeaveRequestResponse;
import com.leave.system.security.UserPrincipal;
import com.leave.system.service.ManagerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager/leave")
public class ManagerLeaveController {

    private final ManagerService managerService;

    public ManagerLeaveController(ManagerService managerService) {
        this.managerService = managerService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummary>> getTeamSummary(@AuthenticationPrincipal UserPrincipal principal) {
        DashboardSummary summary = managerService.getTeamDashboardSummary(principal);
        return ResponseEntity.ok(ApiResponse.ok("Team dashboard summary retrieved", summary));
    }

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<LeaveRequestResponse>>> getTeamRequests(@AuthenticationPrincipal UserPrincipal principal) {
        List<LeaveRequestResponse> requests = managerService.getTeamRequests(principal);
        return ResponseEntity.ok(ApiResponse.ok("Team leave requests retrieved", requests));
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> getRequestDetails(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String requestId) {
        LeaveRequestResponse response = managerService.getTeamRequestDetails(principal, requestId);
        return ResponseEntity.ok(ApiResponse.ok("Team leave request details retrieved", response));
    }

    @PostMapping("/{requestId}/decision")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> processDecision(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String requestId,
            @Valid @RequestBody LeaveDecisionRequest request) {
        LeaveRequestResponse response = managerService.processDecision(principal, requestId, request);
        String message = "Approved".equalsIgnoreCase(request.getDecision())
                ? "Leave request approved. The employee can now view the updated status."
                : "Leave request rejected. The employee can now view the updated status.";
        return ResponseEntity.ok(ApiResponse.ok(message, response));
    }
}
