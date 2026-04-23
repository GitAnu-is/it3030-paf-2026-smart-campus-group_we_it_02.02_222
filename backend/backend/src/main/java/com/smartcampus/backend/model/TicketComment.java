package com.smartcampus.backend.model;

import java.time.Instant;

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
@Document(collection = "ticket_comments")
public class TicketComment {
    @Id
    private String id;

    private String ticketId;
    private String userId;
    private String text;

    private Instant createdAt;
    private Instant editedAt;
}
