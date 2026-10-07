package com.opsflow.opsflow_backend.service;

import com.opsflow.opsflow_backend.dto.AdminUserResponse;
import com.opsflow.opsflow_backend.dto.AdminUserUpdateRequest;
import com.opsflow.opsflow_backend.entity.Role;
import com.opsflow.opsflow_backend.entity.User;
import com.opsflow.opsflow_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminUserService {

    private final UserRepository userRepository;

    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<AdminUserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public AdminUserResponse updateUser(
            Long userId,
            AdminUserUpdateRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (request.getRole() == null) {
            throw new RuntimeException("Role is required");
        }

        user.setRole(request.getRole());
        user.setActive(request.isActive());

        User savedUser = userRepository.save(user);

        return convertToResponse(savedUser);
    }

    private AdminUserResponse convertToResponse(User user) {

        return new AdminUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.isActive()
        );
    }
}