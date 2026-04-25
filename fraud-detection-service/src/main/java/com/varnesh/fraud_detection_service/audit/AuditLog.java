package com.varnesh.fraud_detection_service.audit;

import com.varnesh.fraud_detection_service.auth.User;
import com.varnesh.fraud_detection_service.transaction.Transaction;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "model", nullable = false, length = 128)
    private String model;

    @Column(name = "rule_name", nullable = false, length = 64)
    private String ruleName;

    @Column(name = "message", nullable = false, length = 2000)
    private String message;

    @Column(name = "risk_contribution", precision = 5, scale = 4)
    private BigDecimal riskContribution;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Transaction getTransaction() {
        return transaction;
    }

    public User getUser() {
        return user;
    }

    public String getModel() {
        return model;
    }

    public String getRuleName() {
        return ruleName;
    }

    public String getMessage() {
        return message;
    }

    public BigDecimal getRiskContribution() {
        return riskContribution;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setTransaction(Transaction transaction) {
        this.transaction = transaction;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public void setRuleName(String ruleName) {
        this.ruleName = ruleName;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setRiskContribution(BigDecimal riskContribution) {
        this.riskContribution = riskContribution;
    }
}
