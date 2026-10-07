package com.opsflow.opsflow_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.opsflow.opsflow_backend.entity.Request;
import com.opsflow.opsflow_backend.entity.User;
import com.opsflow.opsflow_backend.repository.RequestRepository;
import com.opsflow.opsflow_backend.repository.UserRepository;

@Service
public class RequestService {

    private final RequestRepository requestRepository;
    private final UserRepository userRepository;

    public RequestService(RequestRepository requestRepository,
                          UserRepository userRepository) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
    }

    public Request createRequest(String email, Request request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        request.setUser(user);
        request.setStatus("OPEN");

        return requestRepository.save(request);
    }

    public List<Request> getMyRequests(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return requestRepository.findByUserOrderByCreatedAtDesc(user);
    }
}