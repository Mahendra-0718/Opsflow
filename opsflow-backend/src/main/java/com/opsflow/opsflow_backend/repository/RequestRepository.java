package com.opsflow.opsflow_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.opsflow.opsflow_backend.entity.Request;
import com.opsflow.opsflow_backend.entity.User;

public interface RequestRepository extends JpaRepository<Request, Long> {

    List<Request> findByUserOrderByCreatedAtDesc(User user);
}