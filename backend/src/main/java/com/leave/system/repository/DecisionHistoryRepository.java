package com.leave.system.repository;

import com.leave.system.model.DecisionHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DecisionHistoryRepository extends MongoRepository<DecisionHistory, String> {
    List<DecisionHistory> findByRequestReferenceOrderByTimestampDesc(String requestReference);
    boolean existsByRequestReference(String requestReference);
}
