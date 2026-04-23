package com.smartcampus.backend.config;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.ResourceStatus;
import com.smartcampus.backend.model.ResourceType;
import com.smartcampus.backend.model.Ticket;
import com.smartcampus.backend.model.TicketComment;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.ResourceRepository;
import com.smartcampus.backend.repository.UserRepository;

@Component
public class MongoCollectionInitializer implements CommandLineRunner {
    private static final String USERS_COLLECTION = "UniOpsUsers";
    private static final String LEGACY_USERS_COLLECTION = "users";
    private static final String RESOURCES_COLLECTION = "Uniresources";
    private static final String LEGACY_RESOURCES_COLLECTION = "resources";
    private static final Set<String> ALLOWED_COLLECTIONS = Set.of(
        USERS_COLLECTION,
        "tickets",
        "ticket_comments",
        RESOURCES_COLLECTION
    );

    private final MongoTemplate mongoTemplate;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final boolean cleanupForeignCollections;

    public MongoCollectionInitializer(
            MongoTemplate mongoTemplate,
            UserRepository userRepository,
            ResourceRepository resourceRepository,
            @Value("${app.mongodb.cleanup-foreign-collections:true}") boolean cleanupForeignCollections) {
        this.mongoTemplate = mongoTemplate;
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.cleanupForeignCollections = cleanupForeignCollections;
    }

    @Override
    public void run(String... args) {
        try {
            migrateLegacyUsersCollection();
            migrateLegacyResourcesCollection();

            if (cleanupForeignCollections) {
                dropForeignCollections();
            }

            if (!mongoTemplate.collectionExists(User.class)) {
                mongoTemplate.createCollection(User.class);
            }
            if (!mongoTemplate.collectionExists(Ticket.class)) {
                mongoTemplate.createCollection(Ticket.class);
            }
            if (!mongoTemplate.collectionExists(TicketComment.class)) {
                mongoTemplate.createCollection(TicketComment.class);
            }
            if (!mongoTemplate.collectionExists(Resource.class)) {
                mongoTemplate.createCollection(Resource.class);
            }

            // Spring Data will automatically create indexes from @Indexed annotations
            
            // Seed test users and resources
            seedTestUsers();
            seedTestResources();
        } catch (Exception e) {
            System.err.println("Warning: MongoCollectionInitializer failed: " + e.getMessage());
            // Continue anyway - collections will be created on first use
        }
    }

    private void migrateLegacyUsersCollection() {
        boolean legacyExists = mongoTemplate.collectionExists(LEGACY_USERS_COLLECTION);
        if (!legacyExists) {
            return;
        }

        if (!mongoTemplate.collectionExists(USERS_COLLECTION)) {
            mongoTemplate.createCollection(USERS_COLLECTION);
        }

        for (User legacyUser : mongoTemplate.findAll(User.class, LEGACY_USERS_COLLECTION)) {
            mongoTemplate.save(legacyUser, USERS_COLLECTION);
        }

        mongoTemplate.dropCollection(LEGACY_USERS_COLLECTION);
        System.out.println("Migrated legacy users collection to " + USERS_COLLECTION);
    }

    private void migrateLegacyResourcesCollection() {
        boolean legacyExists = mongoTemplate.collectionExists(LEGACY_RESOURCES_COLLECTION);
        if (!legacyExists) {
            return;
        }

        if (!mongoTemplate.collectionExists(RESOURCES_COLLECTION)) {
            mongoTemplate.createCollection(RESOURCES_COLLECTION);
        }

        for (Resource legacyResource : mongoTemplate.findAll(Resource.class, LEGACY_RESOURCES_COLLECTION)) {
            mongoTemplate.save(legacyResource, RESOURCES_COLLECTION);
        }

        mongoTemplate.dropCollection(LEGACY_RESOURCES_COLLECTION);
        System.out.println("Migrated legacy resources collection to " + RESOURCES_COLLECTION);
    }

    private void dropForeignCollections() {
        for (String collectionName : mongoTemplate.getCollectionNames()) {
            if (collectionName.startsWith("system.")) {
                continue;
            }

            if (!ALLOWED_COLLECTIONS.contains(collectionName)) {
                mongoTemplate.dropCollection(collectionName);
                System.out.println("Dropped foreign collection from UniOps: " + collectionName);
            }
        }
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
                mongoTemplate.insert(user);
                System.out.println("Seeded user: " + user.getUsername());
            } catch (Exception e) {
                System.out.println("Error seeding user " + user.getUsername() + ": " + e.getMessage());
                e.printStackTrace();
            }
        }
    }

    private void seedTestResources() {
        LocalDateTime now = LocalDateTime.now();

        // Create test resources
        Resource[] testResources = {
            Resource.builder()
                    .id("r1")
                    .name("Lecture Hall A")
                    .type(ResourceType.LECTURE_HALL)
                    .capacity(150)
                    .location("Building A, Floor 1")
                    .status(ResourceStatus.ACTIVE)
                    .description("Large lecture hall with projector and sound system")
                    .availabilityWindows("9 AM - 5 PM, Monday - Friday")
                    .createdAt(now)
                    .updatedAt(now)
                    .build(),
            Resource.builder()
                    .id("r2")
                    .name("Conference Room B")
                    .type(ResourceType.MEETING_ROOM)
                    .capacity(20)
                    .location("Building B, Floor 2")
                    .status(ResourceStatus.ACTIVE)
                    .description("Medium-sized conference room with video conferencing")
                    .availabilityWindows("8 AM - 6 PM, Monday - Friday")
                    .createdAt(now)
                    .updatedAt(now)
                    .build(),
            Resource.builder()
                    .id("r3")
                    .name("Study Area 1")
                    .type(ResourceType.MEETING_ROOM)
                    .capacity(50)
                    .location("Main Library, Ground Floor")
                    .status(ResourceStatus.ACTIVE)
                    .description("Quiet study area with tables and chairs")
                    .availabilityWindows("8 AM - 8 PM, Daily")
                    .createdAt(now)
                    .updatedAt(now)
                    .build(),
            Resource.builder()
                    .id("r4")
                    .name("Computer Lab 1")
                    .type(ResourceType.LAB)
                    .capacity(30)
                    .location("Science Building, Floor 3")
                    .status(ResourceStatus.ACTIVE)
                    .description("Computer lab with 30 workstations, Windows and Linux")
                    .availabilityWindows("9 AM - 5 PM, Monday - Friday")
                    .createdAt(now)
                    .updatedAt(now)
                    .build(),
            Resource.builder()
                    .id("r5")
                    .name("Physics Lab")
                    .type(ResourceType.LAB)
                    .capacity(25)
                    .location("Science Building, Floor 2")
                    .status(ResourceStatus.ACTIVE)
                    .description("Physics lab with advanced equipment")
                    .availabilityWindows("10 AM - 4 PM, Monday - Friday")
                    .createdAt(now)
                    .updatedAt(now)
                    .build(),
            Resource.builder()
                    .id("r6")
                    .name("Seminar Room C")
                    .type(ResourceType.MEETING_ROOM)
                    .capacity(15)
                    .location("Building C, Floor 1")
                    .status(ResourceStatus.OUT_OF_SERVICE)
                    .description("Small seminar room - currently under maintenance")
                    .availabilityWindows("Not available")
                    .createdAt(now)
                    .updatedAt(now)
                    .build(),
            Resource.builder()
                    .id("r7")
                    .name("Multimedia Equipment")
                    .type(ResourceType.EQUIPMENT)
                    .capacity(1)
                    .location("Building D, Room 105")
                    .status(ResourceStatus.ACTIVE)
                    .description("Projectors, screens, and audio equipment available for booking")
                    .availabilityWindows("9 AM - 5 PM, Monday - Friday")
                    .createdAt(now)
                    .updatedAt(now)
                    .build()
        };

        for (Resource resource : testResources) {
            try {
                // Delete any existing resource with same name
                mongoTemplate.remove(new Query(Criteria.where("name").is(resource.getName())), Resource.class);
                mongoTemplate.insert(resource);
                System.out.println("Seeded resource: " + resource.getName());
            } catch (Exception e) {
                System.out.println("Error seeding resource " + resource.getName() + ": " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
}
