package com.varnesh.fraud_detection_service.auth;

import com.varnesh.fraud_detection_service.auth.dto.AuthResponse;
import com.varnesh.fraud_detection_service.auth.dto.LoginRequest;
import com.varnesh.fraud_detection_service.auth.dto.RegisterRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = new User();
        user.setEmail(request.email().toLowerCase().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail());
    }
}