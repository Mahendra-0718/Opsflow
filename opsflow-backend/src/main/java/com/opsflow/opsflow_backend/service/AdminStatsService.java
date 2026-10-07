package com.opsflow.opsflow_backend.service;

import com.opsflow.opsflow_backend.dto.AdminStatsResponse;
import com.opsflow.opsflow_backend.entity.Role;
import com.opsflow.opsflow_backend.repository.RequestRepository;
import com.opsflow.opsflow_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminStatsService {

    private final RequestRepository requestRepository;
    private final UserRepository userRepository;

    public AdminStatsService(
            RequestRepository requestRepository,
            UserRepository userRepository) {

        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
    }

    public AdminStatsResponse getStats() {

        long totalRequests = requestRepository.count();

        long openRequests =
                requestRepository.countByStatus("OPEN");

        long inProgressRequests =
                requestRepository.countByStatus("IN_PROGRESS");

        long resolvedRequests =
                requestRepository.countByStatus("RESOLVED");

        long totalUsers = userRepository.count();

        long activeUsers =
                userRepository.countByActive(true);

        long inactiveUsers =
                userRepository.countByActive(false);

        long employees =
                userRepository.countByRole(Role.EMPLOYEE);

        return new AdminStatsResponse(
                totalRequests,
                openRequests,
                inProgressRequests,
                resolvedRequests,
                totalUsers,
                activeUsers,
                inactiveUsers,
                employees
        );
    }
}
