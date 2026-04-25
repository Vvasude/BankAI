package com.varnesh.fraud_detection_service.auth;

import com.varnesh.fraud_detection_service.auth.dto.AuthResponse;
import com.varnesh.fraud_detection_service.auth.dto.LoginRequest;
import com.varnesh.fraud_detection_service.auth.dto.MeResponse;
import com.varnesh.fraud_detection_service.auth.dto.RegisterRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public MeResponse me(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        return new MeResponse(email);
    }
}