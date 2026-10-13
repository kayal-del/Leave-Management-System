package com.leave.system.dto;

import jakarta.validation.constraints.NotBlank;

public class LeaveDecisionRequest {

    @NotBlank(message = "Decision is required.")
    private String decision; // "Approved" or "Rejected"

    public LeaveDecisionRequest() {}

    public LeaveDecisionRequest(String decision) {
        this.decision = decision;
    }

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }
}
