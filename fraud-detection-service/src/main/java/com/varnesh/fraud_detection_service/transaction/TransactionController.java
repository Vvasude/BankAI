package com.varnesh.fraud_detection_service.transaction;

import com.varnesh.fraud_detection_service.audit.AuditLog;
import com.varnesh.fraud_detection_service.audit.AuditLogRepository;
import com.varnesh.fraud_detection_service.audit.AuditService;
import com.varnesh.fraud_detection_service.audit.dto.AuditLogResponse;
import com.varnesh.fraud_detection_service.auth.User;
import com.varnesh.fraud_detection_service.auth.UserRepository;
import com.varnesh.fraud_detection_service.fraud.AiFraudScoringService;
import com.varnesh.fraud_detection_service.fraud.FraudScoreResult;
import com.varnesh.fraud_detection_service.transaction.dto.CreateTransactionRequest;
import com.varnesh.fraud_detection_service.transaction.dto.TransactionResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final AiFraudScoringService aiFraudScoringService;
    private final AuditService auditService;
    private final AuditLogRepository auditLogRepository;

    public TransactionController(TransactionRepository transactionRepository,
                                 UserRepository userRepository,
                                 AiFraudScoringService aiFraudScoringService,
                                 AuditService auditService,
                                 AuditLogRepository auditLogRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.aiFraudScoringService = aiFraudScoringService;
        this.auditService = auditService;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    public List<TransactionResponse> listForCurrentUser(Authentication authentication) {
        String email = (String) authentication.getPrincipal();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return transactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(tx -> toResponse(tx, email))
                .toList();
    }

    @GetMapping("/{id}/audit")
    public List<AuditLogResponse> listAuditForTransaction(@PathVariable Long id, Authentication authentication) {
        String email = (String) authentication.getPrincipal();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

        return auditLogRepository.findByTransactionIdAndUserIdOrderByCreatedAtAsc(id, user.getId()).stream()
                .map(this::toAuditLogResponse)
                .toList();
    }

    @PostMapping
    public TransactionResponse create(@Valid @RequestBody CreateTransactionRequest request,
                                      Authentication authentication) {
        String email = (String) authentication.getPrincipal();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        FraudScoreResult score = aiFraudScoringService.score(
                user.getEmail(),
                request.amount(),
                request.merchant(),
                request.countryCode().toUpperCase()
        );

        BigDecimal riskScore = BigDecimal.valueOf(score.riskScore()).setScale(4, RoundingMode.HALF_UP);

        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setAmount(request.amount());
        tx.setMerchant(request.merchant());
        tx.setCountryCode(request.countryCode().toUpperCase());
        tx.setRiskScore(riskScore);
        tx.setFlagged(score.flagged());
        tx.setAiReason(score.reason());

        Transaction saved = transactionRepository.save(tx);
        auditService.recordGeminiDecision(user, saved, riskScore, score);

        return toResponse(saved, email);
    }

    private TransactionResponse toResponse(Transaction saved, String userEmail) {
        return new TransactionResponse(
                saved.getId(),
                userEmail,
                saved.getAmount(),
                saved.getMerchant(),
                saved.getCountryCode(),
                saved.getRiskScore(),
                saved.isFlagged(),
                saved.getAiReason()
        );
    }

    private AuditLogResponse toAuditLogResponse(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getModel(),
                log.getRuleName(),
                log.getMessage(),
                log.getRiskContribution(),
                log.getCreatedAt()
        );
    }
}