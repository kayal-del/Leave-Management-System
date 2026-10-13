package com.leave.system.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Document(collection = "leave_requests")
public class LeaveRequest {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("requestId")
    private String requestId;

    @Indexed
    @Field("employeeReference")
    private String employeeReference;

    @Field("leaveType")
    private String leaveType;

    @Field("startDate")
    private String startDate;

    @Field("endDate")
    private String endDate;

    @Field("status")
    private LeaveStatus status = LeaveStatus.Pending;

    @Field("createdAt")
    private Instant createdAt = Instant.now();

    @Field("updatedAt")
    private Instant updatedAt = Instant.now();

    public LeaveRequest() {}

    public LeaveRequest(String requestId, String employeeReference, String leaveType, String startDate, String endDate, LeaveStatus status) {
        this.requestId = requestId;
        this.employeeReference = employeeReference;
        this.leaveType = leaveType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
