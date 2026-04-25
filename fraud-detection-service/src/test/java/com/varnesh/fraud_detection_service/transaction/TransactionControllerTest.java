package com.varnesh.fraud_detection_service.transaction;

import com.varnesh.fraud_detection_service.audit.AuditLogRepository;
import com.varnesh.fraud_detection_service.audit.AuditService;
import com.varnesh.fraud_detection_service.auth.User;
import com.varnesh.fraud_detection_service.auth.UserRepository;
import com.varnesh.fraud_detection_service.fraud.AiFraudScoringService;
import com.varnesh.fraud_detection_service.fraud.FraudScoreResult;
import com.varnesh.fraud_detection_service.transaction.dto.CreateTransactionRequest;
import com.varnesh.fraud_detection_service.transaction.dto.TransactionResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TransactionControllerTest {

    private TransactionRepository transactionRepository;
    private UserRepository userRepository;
    private AiFraudScoringService aiFraudScoringService;
    private AuditService auditService;
    private AuditLogRepository auditLogRepository;

    private TransactionController controller;

    @BeforeEach
    void setUp() {
        transactionRepository = mock(TransactionRepository.class);
        userRepository = mock(UserRepository.class);
        aiFraudScoringService = mock(AiFraudScoringService.class);
        auditService = mock(AuditService.class);
        auditLogRepository = mock(AuditLogRepository.class);

        controller = new TransactionController(
                transactionRepository,
                userRepository,
                aiFraudScoringService,
                auditService,
                auditLogRepository
        );
    }

    @Test
    void create_success_savesTransactionWritesAuditAndReturnsResponse() {
        User user = new User();
        user.setEmail("test1@example.com");

        CreateTransactionRequest req = new CreateTransactionRequest(
                new BigDecimal("125.50"),
                "Amazon",
                "us"
        );

        Authentication auth = new UsernamePasswordAuthenticationToken("test1@example.com", null);

        when(userRepository.findByEmail("test1@example.com")).thenReturn(Optional.of(user));
        when(aiFraudScoringService.score("test1@example.com", new BigDecimal("125.50"), "Amazon", "US"))
                .thenReturn(new FraudScoreResult(0.81, true, "High amount anomaly"));

        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction tx = invocation.getArgument(0);
            var idField = Transaction.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(tx, 99L);
            return tx;
        });

        TransactionResponse res = controller.create(req, auth);

        assertEquals(99L, res.id());
        assertEquals("test1@example.com", res.userEmail());
        assertEquals(new BigDecimal("125.50"), res.amount());
        assertEquals("Amazon", res.merchant());
        assertEquals("US", res.countryCode());
        assertEquals(new BigDecimal("0.8100"), res.riskScore());
        assertTrue(res.flagged());
        assertEquals("High amount anomaly", res.aiReason());

        ArgumentCaptor<Transaction> txCaptor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository).save(txCaptor.capture());
        assertEquals("US", txCaptor.getValue().getCountryCode());

        verify(auditService).recordGeminiDecision(eq(user), any(Transaction.class), eq(new BigDecimal("0.8100")), any(FraudScoreResult.class));
    }
}