package com.opsflow.opsflow_backend.controller;

import com.opsflow.opsflow_backend.dto.AdminUserResponse;
import com.opsflow.opsflow_backend.dto.AdminUserUpdateRequest;
import com.opsflow.opsflow_backend.service.AdminUserService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        return ResponseEntity.ok(
                adminUserService.getAllUsers()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminUserResponse> updateUser(
            @PathVariable Long id,
            @RequestBody AdminUserUpdateRequest request) {

        return ResponseEntity.ok(
                adminUserService.updateUser(id, request)
        );
    }
}