package com.opsflow.opsflow_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.opsflow.opsflow_backend.entity.Request;
import com.opsflow.opsflow_backend.repository.RequestRepository;

@RestController
@RequestMapping("/admin/requests")
@CrossOrigin(origins = "*")
public class AdminRequestController {

    private final RequestRepository requestRepository;

    public AdminRequestController(RequestRepository requestRepository) {
        this.requestRepository = requestRepository;
    }

    @GetMapping
    public ResponseEntity<List<Request>> getAllRequests() {
        return ResponseEntity.ok(requestRepository.findAll());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Request> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        Request request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(status);

        return ResponseEntity.ok(requestRepository.save(request));
    }
}
