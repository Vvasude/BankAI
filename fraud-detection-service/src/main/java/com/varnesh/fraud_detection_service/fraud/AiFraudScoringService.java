package com.varnesh.fraud_detection_service.fraud;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.util.retry.Retry;

import java.math.BigDecimal;
import java.time.Duration;

@Service
public class AiFraudScoringService {
    private static final Logger log = LoggerFactory.getLogger(AiFraudScoringService.class);
    private static final Duration GEMINI_TIMEOUT = Duration.ofSeconds(10);
    private static final String DEFAULT_REASON = "Fallback: AI result unavailable";

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${ai.gemini.api-key}")
    private String apiKey;

    @Value("${ai.gemini.model}")
    private String model;

    public AiFraudScoringService(
            @Value("${ai.gemini.baseUrl:https://generativelanguage.googleapis.com}") String baseUrl) {
        this.webClient = WebClient.builder().baseUrl(baseUrl).build();
    }

    public FraudScoreResult score(String userEmail, BigDecimal amount, String merchant, String countryCode) {
        String prompt = """
            You are a fraud detection assistant.
            Return ONLY valid JSON with this exact schema:
            {"riskScore":0.0,"flagged":false,"reasons":["..."]}

            Inputs:
            userEmail: %s
            amount: %s
            merchant: %s
            countryCode: %s

            riskScore must be between 0 and 1.
            flagged = true if riskScore >= 0.7.
            Keep reasons short and specific.
            """.formatted(userEmail, amount, merchant, countryCode);

        try {
            String response = callGemini(prompt);
            return parseGeminiResponse(response);
        } catch (Exception ex) {
            log.warn("Gemini scoring failed, using fallback. model={}, reason={}", model, ex.getMessage());
            return FraudScoreResult.fallback(amount, countryCode);
        }
    }

    private String callGemini(String prompt) {
        String body = """
            {
              "contents": [{
                "parts": [{"text": %s}]
              }]
            }
            """.formatted(toJsonString(prompt));

        return webClient.post()
                .uri("/v1beta/models/" + model + ":generateContent?key=" + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(GEMINI_TIMEOUT)
                .retryWhen(Retry.backoff(1, Duration.ofMillis(250)))
                .block();
    }

    private FraudScoreResult parseGeminiResponse(String rawResponse) throws Exception {
        JsonNode root = objectMapper.readTree(rawResponse);
        JsonNode candidate = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
        if (candidate.isMissingNode() || candidate.asText().isBlank()) {
            return new FraudScoreResult(0.2, false, DEFAULT_REASON);
        }
        String text = candidate.asText().trim();

        String jsonPayload = extractJsonPayload(text);
        JsonNode scoreJson = objectMapper.readTree(jsonPayload);
        double riskScore = clamp(scoreJson.path("riskScore").asDouble(0.2));
        boolean flagged = scoreJson.has("flagged") ? scoreJson.path("flagged").asBoolean(false) : riskScore >= 0.7;

        String reason = "No reasons";
        if (scoreJson.path("reasons").isArray() && scoreJson.path("reasons").size() > 0) {
            reason = scoreJson.path("reasons").get(0).asText();
        } else if (scoreJson.path("reason").isTextual()) {
            reason = scoreJson.path("reason").asText();
        }

        return new FraudScoreResult(riskScore, flagged, reason);
    }

    private String extractJsonPayload(String text) {
        String normalized = text;
        if (normalized.startsWith("```")) {
            normalized = normalized.replaceFirst("^```(?:json)?\\s*", "");
            normalized = normalized.replaceFirst("\\s*```\\s*$", "");
        }
        int start = normalized.indexOf('{');
        int end = normalized.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return normalized.substring(start, end + 1);
        }
        return normalized;
    }

    private double clamp(double value) {
        if (value < 0.0) {
            return 0.0;
        }
        if (value > 1.0) {
            return 1.0;
        }
        return value;
    }

    private String toJsonString(String value) {
        return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") + "\"";
    }
}