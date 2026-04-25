package com.varnesh.fraud_detection_service.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String token = null;
        if (authHeader != null) {
            String h = authHeader.trim();
            // Be permissive: leading spaces, "bearer" vs "Bearer" (servlet header value is not normalized)
            if (h.length() > 7 && h.substring(0, 7).equalsIgnoreCase("bearer ")) {
                token = h.substring(7).trim();
            }
        }

        if (token != null && !token.isEmpty() && jwtService.isTokenValid(token)) {
            try {
                String email = jwtService.extractSubject(token);
                var authentication = new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        AuthorityUtils.NO_AUTHORITIES
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception ex) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}