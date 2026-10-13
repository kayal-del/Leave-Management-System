package com.leave.system.dto;

import jakarta.validation.constraints.NotBlank;

public class LeaveUpdateRequest {

    @NotBlank(message = "Please select a leave type.")
    private String leaveType;

    @NotBlank(message = "Please select a start date.")
    private String startDate;

    @NotBlank(message = "Please select an end date.")
    private String endDate;

    public LeaveUpdateRequest() {}

    public LeaveUpdateRequest(String leaveType, String startDate, String endDate) {
        this.leaveType = leaveType;
        this.startDate = startDate;
        this.endDate = endDate;
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
}
