package com.smartcampus.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.backend.dto.GoogleAuthRequest;
import com.smartcampus.backend.dto.LoginRequest;
import com.smartcampus.backend.dto.LoginResponse;
import com.smartcampus.backend.dto.UserDTO;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            User user = userRepository.findByUsername(request.getUsername())
                    .orElse(null);

            if (user == null || !validatePassword(request.getPassword(), user.getPasswordHash())) {
                return ResponseEntity.ok(LoginResponse.builder()
                        .success(false)
                        .message("Invalid username or password")
                        .build());
            }

            UserDTO userDTO = UserDTO.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .displayName(user.getDisplayName())
                    .build();

            return ResponseEntity.ok(LoginResponse.builder()
                    .success(true)
                    .message("Login successful")
                    .token("jwt-token-" + user.getId())
                    .user(userDTO)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.ok(LoginResponse.builder()
                    .success(false)
                    .message("Login failed: " + e.getMessage())
                    .build());
        }
    }

    @PostMapping("/google")
    public ResponseEntity<LoginResponse> googleLogin(@RequestBody GoogleAuthRequest request) {
        try {
            if (request.getIdToken() == null || request.getIdToken().isEmpty()) {
                return ResponseEntity.ok(LoginResponse.builder()
                        .success(false)
                        .message("Invalid ID token")
                        .build());
            }

            // For development: use a demo user for Google OAuth
            // In production, you should verify the ID token with Google's API
            User user = userRepository.findByUsername("google-user")
                    .orElseGet(() -> {
                        User newUser = User.builder()
                                .username("google-user")
                                .email("google@example.com")
                                .displayName("Google User")
                                .role("USER")
                                .passwordHash("")
                                .build();
                        return userRepository.save(newUser);
                    });

            UserDTO userDTO = UserDTO.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .displayName(user.getDisplayName())
                    .build();

            return ResponseEntity.ok(LoginResponse.builder()
                    .success(true)
                    .message("Google login successful")
                    .token("jwt-token-" + user.getId())
                    .user(userDTO)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.ok(LoginResponse.builder()
                    .success(false)
                    .message("Google login failed: " + e.getMessage())
                    .build());
        }
    }

    private boolean validatePassword(String rawPassword, String hashedPassword) {
        return hashedPassword.equals(hashPassword(rawPassword));
    }

    private String hashPassword(String password) {
        return password;
    }
}
