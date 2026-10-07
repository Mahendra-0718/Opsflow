package com.opsflow.opsflow_backend.dto;

public class AdminStatsResponse {

    private long totalRequests;
    private long openRequests;
    private long inProgressRequests;
    private long resolvedRequests;

    private long totalUsers;
    private long activeUsers;
    private long inactiveUsers;
    private long employees;

    public AdminStatsResponse() {
    }

    public AdminStatsResponse(
            long totalRequests,
            long openRequests,
            long inProgressRequests,
            long resolvedRequests,
            long totalUsers,
            long activeUsers,
            long inactiveUsers,
            long employees) {

        this.totalRequests = totalRequests;
        this.openRequests = openRequests;
        this.inProgressRequests = inProgressRequests;
        this.resolvedRequests = resolvedRequests;
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.inactiveUsers = inactiveUsers;
        this.employees = employees;
    }

    public long getTotalRequests() {
        return totalRequests;
    }

    public long getOpenRequests() {
        return openRequests;
    }

    public long getInProgressRequests() {
        return inProgressRequests;
    }

    public long getResolvedRequests() {
        return resolvedRequests;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public long getInactiveUsers() {
        return inactiveUsers;
    }

    public long getEmployees() {
        return employees;
    }
}