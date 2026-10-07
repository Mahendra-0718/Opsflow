package com.opsflow.opsflow_backend.repository;

import com.opsflow.opsflow_backend.entity.Request;
import com.opsflow.opsflow_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RequestRepository extends JpaRepository<Request, Long> {

    List<Request> findByUserOrderByCreatedAtDesc(User user);

    List<Request> findByAssignedToOrderByCreatedAtDesc(User assignedTo);

    long countByStatus(String status);
}