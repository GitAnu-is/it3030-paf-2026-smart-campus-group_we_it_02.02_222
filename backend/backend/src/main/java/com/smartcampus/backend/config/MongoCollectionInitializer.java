package com.smartcampus.backend.config;

import java.time.Instant;

import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.UserRepository;

@Component
public class MongoCollectionInitializer implements CommandLineRunner {

    private final MongoTemplate mongoTemplate;
    private final UserRepository userRepository;

    public MongoCollectionInitializer(MongoTemplate mongoTemplate, UserRepository userRepository) {
        this.mongoTemplate = mongoTemplate;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        if (!mongoTemplate.collectionExists(User.class)) {
            mongoTemplate.createCollection(User.class);
        }

        // Spring Data will automatically create indexes from @Indexed annotations
        
        // Seed test users
        seedTestUsers();
    }

    private void seedTestUsers() {
        Instant now = Instant.now();

        // Create test users
        User[] testUsers = {
            User.builder()
                    .id("u1")
                    .username("student")
                    .email("student@university.edu")
                    .displayName("John Student")
                    .passwordHash("password123")
                    .role("USER")
                    .createdAt(now)
                    .updatedAt(now)
                    .build(),
            User.builder()
                    .id("u2")
                    .username("admin")
                    .email("admin@university.edu")
                    .displayName("Admin User")
                    .passwordHash("admin123")
                    .role("ADMIN")
                    .createdAt(now)
                    .updatedAt(now)
                    .build(),
            User.builder()
                    .id("u3")
                    .username("technician")
                    .email("tech@university.edu")
                    .displayName("Tech Support")
                    .passwordHash("tech123")
                    .role("TECHNICIAN")
                    .createdAt(now)
                    .updatedAt(now)
                    .build(),
            User.builder()
                    .id("u4")
                    .username("faculty")
                    .email("faculty@university.edu")
                    .displayName("Dr. Faculty")
                    .passwordHash("faculty123")
                    .role("USER")
                    .createdAt(now)
                    .updatedAt(now)
                    .build()
        };

        for (User user : testUsers) {
            try {
                // Delete any existing user with same username OR email
                mongoTemplate.remove(new Query(Criteria.where("username").is(user.getUsername())), User.class);
                mongoTemplate.remove(new Query(Criteria.where("email").is(user.getEmail())), User.class);
                userRepository.save(user);
                System.out.println("Seeded user: " + user.getUsername());
            } catch (Exception e) {
                System.out.println("Error seeding user " + user.getUsername() + ": " + e.getMessage());
            }
        }
    }
}
