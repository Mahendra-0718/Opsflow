package com.opsflow.opsflow_backend.dto;

import com.opsflow.opsflow_backend.entity.Role;

public class AdminUserUpdateRequest {

    private Role role;
    private boolean active;

    public AdminUserUpdateRequest() {
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}