package com.opsflow.opsflow_backend.service;

import com.opsflow.opsflow_backend.entity.Request;
import com.opsflow.opsflow_backend.entity.User;
import com.opsflow.opsflow_backend.repository.RequestRepository;
import com.opsflow.opsflow_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RequestService {

    private final RequestRepository requestRepository;
    private final UserRepository userRepository;

    public RequestService(
            RequestRepository requestRepository,
            UserRepository userRepository) {

        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
    }

    public Request createRequest(String email, Request request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        request.setUser(user);
        request.setStatus("OPEN");

        return requestRepository.save(request);
    }

    public List<Request> getMyRequests(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return requestRepository
                .findByUserOrderByCreatedAtDesc(user);
    }

    public List<Request> getAssignedRequests(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return requestRepository
                .findByAssignedToOrderByCreatedAtDesc(user);
    }

    public Request updateAssignedRequestStatus(
            Long requestId,
            String status,
            String employeeEmail) {

        Request request = requestRepository.findById(requestId)
                .orElseThrow(() ->
                        new RuntimeException("Request not found"));

        User employee = userRepository.findByEmail(employeeEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Make sure this employee is actually assigned to the request
        if (request.getAssignedTo() == null ||
                !request.getAssignedTo().getId().equals(employee.getId())) {

            throw new RuntimeException(
                    "You are not assigned to this request"
            );
        }

        // Allow only these statuses
        if (!status.equals("OPEN") &&
                !status.equals("IN_PROGRESS") &&
                !status.equals("RESOLVED")) {

            throw new RuntimeException(
                    "Invalid status"
            );
        }

        request.setStatus(status);

        return requestRepository.save(request);
    }
}