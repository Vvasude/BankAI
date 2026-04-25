package com.varnesh.fraud_detection_service.fraud;

import java.math.BigDecimal;

public record FraudScoreResult(
        double riskScore,
        boolean flagged,
        String reason
) {
    public static FraudScoreResult fallback(BigDecimal amount, String countryCode) {
        boolean suspicious = amount.compareTo(new BigDecimal("10000")) > 0 && "NG".equalsIgnoreCase(countryCode);
        return new FraudScoreResult(
                suspicious ? 0.8 : 0.2,
                suspicious,
                suspicious ? "Fallback rule: high amount + high-risk country" : "Fallback rule: low risk"
        );
    }
}