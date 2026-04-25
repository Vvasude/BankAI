package com.varnesh.fraud_detection_service.audit;

import com.varnesh.fraud_detection_service.auth.User;
import com.varnesh.fraud_detection_service.fraud.FraudScoreResult;
import com.varnesh.fraud_detection_service.transaction.Transaction;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Value("${ai.gemini.model}")
    private String geminiModel;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void recordGeminiDecision(User user, Transaction tx, BigDecimal riskScore, FraudScoreResult result) {
        AuditLog log = new AuditLog();
        log.setUser(user);
        log.setTransaction(tx);
        log.setModel(geminiModel);
        log.setRuleName("AI_GEMINI");
        log.setMessage(result.reason());
        log.setRiskContribution(riskScore);
        auditLogRepository.save(log);
    }
}
