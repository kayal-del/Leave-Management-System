package com.leave.system.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Document(collection = "decision_history")
public class DecisionHistory {

    @Id
    private String id;

    @Indexed
    @Field("requestReference")
    private String requestReference;

    @Indexed
    @Field("managerReference")
    private String managerReference;

    @Field("decision")
    private Decision decision;

    @Field("timestamp")
    private Instant timestamp = Instant.now();

    public DecisionHistory() {}

    public DecisionHistory(String requestReference, String managerReference, Decision decision) {
        this.requestReference = requestReference;
        this.managerReference = managerReference;
        this.decision = decision;
        this.timestamp = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRequestReference() {
        return requestReference;
    }

    public void setRequestReference(String requestReference) {
        this.requestReference = requestReference;
    }

    public String getManagerReference() {
        return managerReference;
    }

    public void setManagerReference(String managerReference) {
        this.managerReference = managerReference;
    }

    public Decision getDecision() {
        return decision;
    }

    public void setDecision(Decision decision) {
        this.decision = decision;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
