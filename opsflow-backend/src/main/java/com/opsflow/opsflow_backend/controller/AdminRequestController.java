package com.opsflow.opsflow_backend.controller;

import com.opsflow.opsflow_backend.entity.Request;
import com.opsflow.opsflow_backend.repository.RequestRepository;
import com.opsflow.opsflow_backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/requests")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SUPER_ADMIN')")
public class AdminRequestController {

    private final RequestRepository requestRepository;
    private final UserRepository userRepository;

    public AdminRequestController(
            RequestRepository requestRepository,
            UserRepository userRepository) {

        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Request>> getAllRequests() {

        return ResponseEntity.ok(
                requestRepository.findAll()
        );
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Request> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        if (!status.equals("OPEN") &&
                !status.equals("IN_PROGRESS") &&
                !status.equals("RESOLVED")) {

            throw new RuntimeException("Invalid status");
        }

        Request request = requestRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Request not found"));

        request.setStatus(status);

        return ResponseEntity.ok(
                requestRepository.save(request)
        );
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<Request> assignRequest(
            @PathVariable Long id,
            @RequestParam String email) {

        Request request = requestRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Request not found"));

        /*
         * Only active EMPLOYEE users can be assigned
         * to requests.
         */
        var assignedUser = userRepository
                .findByRoleAndActive(
                        com.opsflow.opsflow_backend.entity.Role.EMPLOYEE,
                        true
                )
                .stream()
                .filter(user ->
                        user.getEmail().equalsIgnoreCase(email)
                )
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException(
                                "Only active employees can be assigned"
                        )
                );

        request.setAssignedTo(assignedUser);

        return ResponseEntity.ok(
                requestRepository.save(request)
        );
    }
}