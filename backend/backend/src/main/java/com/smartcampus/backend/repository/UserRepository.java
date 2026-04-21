package com.smartcampus.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.smartcampus.backend.model.User;

public interface UserRepository extends MongoRepository<User, String> {

    List<User> findByRole(String role);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}
