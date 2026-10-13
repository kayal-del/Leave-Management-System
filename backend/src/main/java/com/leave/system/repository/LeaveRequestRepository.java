package com.leave.system.repository;

import com.leave.system.model.LeaveRequest;
import com.leave.system.model.LeaveStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveRequestRepository extends MongoRepository<LeaveRequest, String> {
    Optional<LeaveRequest> findByRequestId(String requestId);
    List<LeaveRequest> findByEmployeeReferenceOrderByCreatedAtDesc(String employeeReference);
    List<LeaveRequest> findByEmployeeReferenceInOrderByCreatedAtDesc(List<String> employeeReferences);
    List<LeaveRequest> findAllByOrderByCreatedAtDesc();

    long countByEmployeeReference(String employeeReference);
    long countByEmployeeReferenceAndStatus(String employeeReference, LeaveStatus status);

    long countByEmployeeReferenceIn(List<String> employeeReferences);
    long countByEmployeeReferenceInAndStatus(List<String> employeeReferences, LeaveStatus status);

    void deleteByRequestId(String requestId);
}
