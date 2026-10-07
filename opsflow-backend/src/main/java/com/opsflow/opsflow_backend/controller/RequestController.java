package com.opsflow.opsflow_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.opsflow.opsflow_backend.entity.Request;
import com.opsflow.opsflow_backend.service.RequestService;

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
}