
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

    // Create a new request with backend validation
    public Request createRequest(String email, Request request) {

        // Validate title
        if (request.getTitle() == null ||
                request.getTitle().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Title is required"
            );
        }

        // Validate description
        if (request.getDescription() == null ||
                request.getDescription().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Description is required"
            );
        }

        // Validate priority
        String priority = request.getPriority();

        if (priority == null ||
                (!priority.equals("LOW") &&
                 !priority.equals("MEDIUM") &&
                 !priority.equals("HIGH") &&
                 !priority.equals("URGENT"))) {

            throw new IllegalArgumentException(
                    "Priority must be LOW, MEDIUM, HIGH, or URGENT"
            );
        }

        // Find the logged-in user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Set validated values and trusted server-side fields
        request.setTitle(request.getTitle().trim());
        request.setDescription(request.getDescription().trim());
        request.setUser(user);
        request.setStatus("OPEN");

        // Save the request
        return requestRepository.save(request);
    }

    // Get requests created by the logged-in user
    public List<Request> getMyRequests(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return requestRepository
                .findByUserOrderByCreatedAtDesc(user);
    }

    // Get requests assigned to the logged-in user
    public List<Request> getAssignedRequests(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return requestRepository
                .findByAssignedToOrderByCreatedAtDesc(user);
    }

    // Update the status of a request assigned to an employee
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

        // Ensure this employee is assigned to the request
        if (request.getAssignedTo() == null ||
                !request.getAssignedTo().getId()
                        .equals(employee.getId())) {

            throw new RuntimeException(
                    "You are not assigned to this request"
            );
        }

        // Allow only valid statuses
        if (!"OPEN".equals(status) &&
                !"IN_PROGRESS".equals(status) &&
                !"RESOLVED".equals(status)) {

            throw new IllegalArgumentException(
                    "Invalid status"
            );
        }

        request.setStatus(status);

        return requestRepository.save(request);
    }
}
