package com.smartcampus.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.backend.dto.UserDTO;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("")
    public ResponseEntity<List<UserDTO>> listUsers(@RequestParam(required = false) String role) {
        List<User> users = (role != null && !role.isBlank())
                ? userRepository.findByRole(role)
                : userRepository.findAll();

        List<UserDTO> userDtos = users.stream()
                .map(user -> UserDTO.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .displayName(user.getDisplayName())
                        .avatarUrl(user.getAvatarUrl())
                        .build())
                .toList();

        return ResponseEntity.ok(userDtos);
    }
}
