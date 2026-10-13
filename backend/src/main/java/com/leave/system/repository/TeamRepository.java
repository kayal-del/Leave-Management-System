package com.leave.system.repository;

import com.leave.system.model.Team;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends MongoRepository<Team, String> {
    Optional<Team> findByTeamId(String teamId);
    List<Team> findAllByManagerReference(String managerReference);
    Optional<Team> findByEmployeeReferencesContaining(String employeeReference);
}
