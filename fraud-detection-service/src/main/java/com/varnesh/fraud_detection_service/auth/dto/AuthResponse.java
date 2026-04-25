package com.varnesh.fraud_detection_service.auth.dto;

public record AuthResponse(
        String token,
        String email
) {}