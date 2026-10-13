package com.leave.system.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "teams")
public class Team {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("teamId")
    private String teamId;

    @Field("teamName")
    private String teamName;

    @Indexed
    @Field("managerReference")
    private String managerReference;

    @Field("employeeReferences")
    private List<String> employeeReferences = new ArrayList<>();

    public Team() {}

    public Team(String teamId, String teamName, String managerReference, List<String> employeeReferences) {
        this.teamId = teamId;
        this.teamName = teamName;
        this.managerReference = managerReference;
        this.employeeReferences = employeeReferences != null ? employeeReferences : new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTeamId() {
        return teamId;
    }

    public void setTeamId(String teamId) {
        this.teamId = teamId;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public String getManagerReference() {
        return managerReference;
    }

    public void setManagerReference(String managerReference) {
        this.managerReference = managerReference;
    }

    public List<String> getEmployeeReferences() {
        return employeeReferences;
    }

    public void setEmployeeReferences(List<String> employeeReferences) {
        this.employeeReferences = employeeReferences;
    }
}
