package com.varnesh.fraud_detection_service.auth;

import com.varnesh.fraud_detection_service.auth.dto.AuthResponse;
import com.varnesh.fraud_detection_service.auth.dto.LoginRequest;
import com.varnesh.fraud_detection_service.auth.dto.RegisterRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtService);
    }

    @Test
    void register_success_hashesPasswordAndReturnsToken() {
        RegisterRequest req = new RegisterRequest("new@example.com", "Password123!");
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("hashed-pass");
        when(jwtService.generateToken("new@example.com")).thenReturn("jwt-token");

        AuthResponse result = authService.register(req);

        assertEquals("new@example.com", result.email());
        assertEquals("jwt-token", result.token());

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertEquals("new@example.com", saved.getEmail());
        assertEquals("hashed-pass", saved.getPasswordHash());
    }

    @Test
    void register_duplicateEmail_throws() {
        RegisterRequest req = new RegisterRequest("dup@example.com", "Password123!");
        when(userRepository.existsByEmail("dup@example.com")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.register(req));
        assertEquals("Email already in use", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_badPassword_throws() {
        LoginRequest req = new LoginRequest("user@example.com", "wrong-pass");
        User user = new User();
        user.setEmail("user@example.com");
        user.setPasswordHash("stored-hash");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-pass", "stored-hash")).thenReturn(false);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.login(req));
        assertEquals("Invalid credentials", ex.getMessage());
        verify(jwtService, never()).generateToken(anyString());
    }
}