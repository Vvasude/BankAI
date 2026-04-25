package com.varnesh.fraud_detection_service.transaction.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateTransactionRequest(
        @NotNull @DecimalMin("0.01") BigDecimal amount,
        @NotBlank @Size(max = 100) String merchant,
        @NotBlank @Size(min = 2, max = 2) String countryCode
) {}