package com.opsflow.opsflow_backend.controller;

import com.opsflow.opsflow_backend.entity.Request;
import com.opsflow.opsflow_backend.service.RequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/requests")
@CrossOrigin(origins = "*")
public class RequestController {

    private final RequestService requestService;

    public RequestController(RequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping
    public ResponseEntity<Request> createRequest(
            @RequestBody Request request,
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                requestService.createRequest(email, request)
        );
    }

    @GetMapping
    public ResponseEntity<List<Request>> getMyRequests(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                requestService.getMyRequests(email)
        );
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<Request>> getAssignedRequests(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                requestService.getAssignedRequests(email)
        );
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Request> updateAssignedRequestStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                requestService.updateAssignedRequestStatus(
                        id,
                        status,
                        email
                )
        );
    }
}