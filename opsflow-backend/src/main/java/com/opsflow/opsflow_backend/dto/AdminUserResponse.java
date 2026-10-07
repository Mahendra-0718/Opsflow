package com.opsflow.opsflow_backend.dto;

public class AdminUserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String role;
    private boolean active;

    public AdminUserResponse() {
    }

    public AdminUserResponse(
            Long id,
            String fullName,
            String email,
            String role,
            boolean active) {

        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public boolean isActive() {
        return active;
    }
}