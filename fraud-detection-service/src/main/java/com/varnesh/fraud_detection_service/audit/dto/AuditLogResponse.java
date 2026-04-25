package com.varnesh.fraud_detection_service.audit.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record AuditLogResponse(
        Long id,
        String model,
        String ruleName,
        String message,
        BigDecimal riskContribution,
        Instant createdAt
) {}
