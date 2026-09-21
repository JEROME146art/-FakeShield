package com.fakeshield.service;

import com.fakeshield.dto.AuthResponse;
import com.fakeshield.dto.LoginRequest;
import com.fakeshield.dto.RegisterRequest;
import com.fakeshield.model.User;
import com.fakeshield.repository.UserRepository;
import com.fakeshield.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    // Register new user
    public AuthResponse register(RegisterRequest request) {
        // Check if username exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken!");
        }

        // Check if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered!");
        }

        // Create user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // Hash password!
        user.setFullName(request.getFullName());
        user.setRole(User.Role.USER);
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // Generate token
        String token = jwtUtil.generateToken(savedUser.getUsername());

        System.out.println("✅ New user registered: " + savedUser.getUsername());

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole().name()
        );
    }

    // Login user
    public AuthResponse login(LoginRequest request) {
        try {
            // Find user by username or email
            User user = userRepository.findByUsername(request.getUsernameOrEmail())
                    .orElseGet(() -> userRepository.findByEmail(request.getUsernameOrEmail())
                            .orElseThrow(() -> new BadCredentialsException("Invalid credentials")));

            // Authenticate
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            user.getUsername(),
                            request.getPassword()
                    )
            );

            // Update last login
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            // Generate token
            String token = jwtUtil.generateToken(user.getUsername());

            System.out.println("✅ User logged in: " + user.getUsername());

            return new AuthResponse(
                    token,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole().name()
            );

        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid username/email or password");
        }
    }
}