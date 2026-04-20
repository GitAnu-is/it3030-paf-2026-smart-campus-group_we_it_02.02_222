package com.smartcampus.backend.controller;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

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

    @Value("${google.oauth.client-id:}")
    private String googleClientId;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            User user = userRepository.findByUsername(request.getUsername())
                    .orElse(null);

            if (user == null || !validatePassword(request.getPassword(), user.getPasswordHash())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(LoginResponse.builder()
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(LoginResponse.builder()
                    .success(false)
                    .message("Login failed: " + e.getMessage())
                    .build());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> me(@RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authorization.substring("Bearer ".length()).trim();
        if (!token.startsWith("jwt-token-")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userId = token.substring("jwt-token-".length()).trim();
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userOpt.get();
        return ResponseEntity.ok(UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .displayName(user.getDisplayName())
                .build());
    }

    @PostMapping("/google")
    public ResponseEntity<LoginResponse> googleLogin(@RequestBody GoogleAuthRequest request) {
        try {
            if (request.getIdToken() == null || request.getIdToken().isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(LoginResponse.builder()
                        .success(false)
                        .message("Invalid ID token")
                        .build());
            }

            // Verify the ID token using Google's tokeninfo endpoint
            Map tokenInfo;
            try {
                tokenInfo = RestClient.create()
                        .get()
                        .uri("https://oauth2.googleapis.com/tokeninfo?id_token={idToken}", request.getIdToken())
                        .retrieve()
                        .body(Map.class);
            } catch (RestClientResponseException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(LoginResponse.builder()
                        .success(false)
                        .message("Google token verification failed")
                        .build());
            }

            String aud = tokenInfo == null ? null : String.valueOf(tokenInfo.get("aud"));
            if (googleClientId != null && !googleClientId.isBlank()) {
                if (aud == null || !googleClientId.equals(aud)) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(LoginResponse.builder()
                            .success(false)
                            .message("Google token audience mismatch")
                            .build());
                }
            }

            String email = tokenInfo == null ? null : (String) tokenInfo.get("email");
            String name = tokenInfo == null ? null : (String) tokenInfo.get("name");

            if (email == null || email.isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(LoginResponse.builder()
                        .success(false)
                        .message("Google token missing email")
                        .build());
            }

            String username = email;
            Instant now = Instant.now();

            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> User.builder()
                            .username(username)
                            .email(email)
                            .displayName((name == null || name.isBlank()) ? email : name)
                            .role("USER")
                            .passwordHash("")
                            .createdAt(now)
                            .updatedAt(now)
                            .build());

            // If user existed, refresh display name / timestamps
            user.setDisplayName((name == null || name.isBlank()) ? user.getDisplayName() : name);
            user.setUpdatedAt(now);
            user = userRepository.save(user);

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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(LoginResponse.builder()
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
