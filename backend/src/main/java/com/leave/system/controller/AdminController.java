package com.leave.system.controller;

import com.leave.system.dto.*;
import com.leave.system.model.User;
import com.leave.system.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummary>> getSummary() {
        DashboardSummary summary = adminService.getAdminDashboardSummary();
        return ResponseEntity.ok(ApiResponse.ok("Admin dashboard summary retrieved", summary));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok("Users retrieved successfully", users));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<User>> createUser(@Valid @RequestBody UserCreateRequest request) {
        User user = adminService.createUser(request);
        return ResponseEntity.ok(ApiResponse.ok("User details saved successfully.", user));
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<User>> updateUser(
            @PathVariable String userId,
            @Valid @RequestBody UserUpdateRequest request) {
        User user = adminService.updateUser(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("User details saved successfully.", user));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable String userId) {
        adminService.deactivateOrRemoveUser(userId);
        return ResponseEntity.ok(ApiResponse.ok("User removed successfully."));
    }

    @GetMapping("/leave/all")
    public ResponseEntity<ApiResponse<List<LeaveRequestResponse>>> getAllLeaveRequests() {
        List<LeaveRequestResponse> requests = adminService.getAllLeaveRequests();
        return ResponseEntity.ok(ApiResponse.ok("All leave requests retrieved", requests));
    }
}
