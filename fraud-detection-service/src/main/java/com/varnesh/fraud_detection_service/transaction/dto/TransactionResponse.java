package com.varnesh.fraud_detection_service.transaction.dto;

import java.math.BigDecimal;

public record TransactionResponse(
        Long id,
        String userEmail,
        BigDecimal amount,
        String merchant,
        String countryCode,
        BigDecimal riskScore,
        boolean flagged,
        String aiReason
) {}