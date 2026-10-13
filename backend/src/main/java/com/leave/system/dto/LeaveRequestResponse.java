package com.leave.system.dto;

import com.leave.system.model.LeaveStatus;

import java.time.Instant;

public class LeaveRequestResponse {
    private String requestId;
    private String employeeReference;
    private String employeeName;
    private String leaveType;
    private String startDate;
    private String endDate;
    private LeaveStatus status;
    private Instant createdAt;

    public LeaveRequestResponse() {}

    public LeaveRequestResponse(String requestId, String employeeReference, String employeeName, String leaveType, String startDate, String endDate, LeaveStatus status, Instant createdAt) {
        this.requestId = requestId;
        this.employeeReference = employeeReference;
        this.employeeName = employeeName;
        this.leaveType = leaveType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public String getEmployeeReference() {
        return employeeReference;
    }

    public void setEmployeeReference(String employeeReference) {
        this.employeeReference = employeeReference;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getLeaveType() {
        return leaveType;
    }

    public void setLeaveType(String leaveType) {
        this.leaveType = leaveType;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public LeaveStatus getStatus() {
        return status;
    }

    public void setStatus(LeaveStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
