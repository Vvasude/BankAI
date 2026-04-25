package com.varnesh.fraud_detection_service.audit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByTransactionIdAndUserIdOrderByCreatedAtAsc(Long transactionId, Long userId);
}
