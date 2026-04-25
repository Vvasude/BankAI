package com.varnesh.fraud_detection_service.transaction;

import com.varnesh.fraud_detection_service.auth.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String merchant;

    @Column(name = "country_code", nullable = false, length = 2)
    private String countryCode;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "risk_score", nullable = false, precision = 5, scale = 4)
    private BigDecimal riskScore;

    @Column(name = "flagged", nullable = false)
    private boolean flagged;

    @Column(name = "ai_reason", nullable = false, length = 2000)
    private String aiReason;


    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public BigDecimal getAmount() { return amount; }
    public String getMerchant() { return merchant; }
    public String getCountryCode() { return countryCode; }
    public Instant getCreatedAt() { return createdAt; }
    public BigDecimal getRiskScore() { return riskScore; }
    public boolean isFlagged() { return flagged; }
    public boolean getFlagged() { return flagged; }
    public String getAiReason() { return aiReason; }

    public void setUser(User user) { this.user = user; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setMerchant(String merchant) { this.merchant = merchant; }
    public void setCountryCode(String countryCode) { this.countryCode = countryCode; }
    public void setRiskScore(BigDecimal riskScore) { this.riskScore = riskScore; }
    public void setFlagged(boolean flagged) { this.flagged = flagged; }
    public void setAiReason(String aiReason) { this.aiReason = aiReason; }
}