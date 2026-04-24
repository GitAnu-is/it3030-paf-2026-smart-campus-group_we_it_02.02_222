package com.smartcampus.backend.model;

import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {
    @Id
    private String id;

    private String resourceId;
    private String userId;
    private String category;
    private String description;
    private String priority;
    private String status;
    private String assignedTo;
    private List<String> images;
    private String resolutionNotes;
    private String contactDetails;
    private Instant createdAt;
    private Instant updatedAt;
}
