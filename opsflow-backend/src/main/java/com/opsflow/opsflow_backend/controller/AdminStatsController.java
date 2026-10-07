package com.opsflow.opsflow_backend.controller;

import com.opsflow.opsflow_backend.dto.AdminStatsResponse;
import com.opsflow.opsflow_backend.service.AdminStatsService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/stats")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SUPER_ADMIN')")
public class AdminStatsController {

    private final AdminStatsService adminStatsService;

    public AdminStatsController(
            AdminStatsService adminStatsService) {

        this.adminStatsService = adminStatsService;
    }

    @GetMapping
    public ResponseEntity<AdminStatsResponse> getStats() {

        return ResponseEntity.ok(
                adminStatsService.getStats()
        );
    }
}