package com.smartcampus.backend.controller;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.backend.dto.CreateTicketCommentRequest;
import com.smartcampus.backend.dto.UpdateTicketRequest;
import com.smartcampus.backend.dto.UpdateTicketCommentRequest;
import com.smartcampus.backend.model.TicketComment;
import com.smartcampus.backend.model.Ticket;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.TicketCommentRepository;
import com.smartcampus.backend.repository.TicketRepository;
import com.smartcampus.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketCommentRepository ticketCommentRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("")
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket) {
        // basic validation
        if (ticket.getResourceId() == null || ticket.getResourceId().isBlank())
            return ResponseEntity.badRequest().build();
        if (ticket.getUserId() == null || ticket.getUserId().isBlank())
            return ResponseEntity.badRequest().build();
        if (ticket.getDescription() == null || ticket.getDescription().isBlank())
            return ResponseEntity.badRequest().build();

        Instant now = Instant.now();
        ticket.setCreatedAt(now);
        ticket.setUpdatedAt(now);
        ticket.setStatus(ticket.getStatus() == null ? "OPEN" : ticket.getStatus());

        Ticket saved = ticketRepository.save(ticket);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("")
    public ResponseEntity<List<Ticket>> listTickets(@RequestParam(required = false) String userId,
            @RequestParam(required = false) String assignedTo, @RequestParam(required = false) String status) {
        if (userId != null && !userId.isBlank()) {
            return ResponseEntity.ok(ticketRepository.findByUserId(userId));
        }
        if (assignedTo != null && !assignedTo.isBlank()) {
            return ResponseEntity.ok(ticketRepository.findByAssignedTo(assignedTo));
        }
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(ticketRepository.findByStatus(status));
        }

        return ResponseEntity.ok(ticketRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicket(@PathVariable String id) {
        return ticketRepository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable String id, @RequestBody UpdateTicketRequest request) {
        return ticketRepository.findById(id).map(existing -> {
            if (request.getStatus() != null && !request.getStatus().isBlank()) {
                existing.setStatus(request.getStatus());
            }
            if (request.getResolutionNotes() != null) {
                existing.setResolutionNotes(request.getResolutionNotes());
            }
            if (request.getAssignedTo() != null) {
                existing.setAssignedTo(request.getAssignedTo());
            }
            if (request.getImages() != null) {
                existing.setImages(request.getImages());
            }
            existing.setUpdatedAt(Instant.now());
            return ResponseEntity.ok(ticketRepository.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<Ticket> assignTicket(@PathVariable String id, @RequestBody UpdateTicketRequest request) {
        return ticketRepository.findById(id).map(existing -> {
            if (request.getAssignedTo() != null && !request.getAssignedTo().isBlank()) {
                existing.setAssignedTo(request.getAssignedTo());
            }
            if (request.getStatus() != null && !request.getStatus().isBlank()) {
                existing.setStatus(request.getStatus());
            } else if (existing.getStatus() != null && existing.getStatus().equals("OPEN")) {
                existing.setStatus("IN_PROGRESS");
            }
            existing.setUpdatedAt(Instant.now());
            return ResponseEntity.ok(ticketRepository.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // --- Comments ---
    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<List<TicketComment>> listComments(@PathVariable String ticketId) {
        return ResponseEntity.ok(ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId));
    }

    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<TicketComment> addComment(
            @PathVariable String ticketId,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) CreateTicketCommentRequest request) {

        String userId = extractUserId(authorization);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String text = request == null ? null : request.getText();
        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        TicketComment comment = TicketComment.builder()
                .ticketId(ticketId)
                .userId(userId)
                .text(text.trim())
                .createdAt(Instant.now())
                .build();

        return ResponseEntity.ok(ticketCommentRepository.save(comment));
    }

    @PutMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<TicketComment> updateComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) UpdateTicketCommentRequest request) {

        String userId = extractUserId(authorization);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String text = request == null ? null : request.getText();
        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Optional<TicketComment> commentOpt = ticketCommentRepository.findByIdAndTicketId(commentId, ticketId);
        if (commentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        TicketComment comment = commentOpt.get();
        if (!canModifyComment(userId, comment)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        comment.setText(text.trim());
        comment.setEditedAt(Instant.now());
        return ResponseEntity.ok(ticketCommentRepository.save(comment));
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {

        String userId = extractUserId(authorization);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<TicketComment> commentOpt = ticketCommentRepository.findByIdAndTicketId(commentId, ticketId);
        if (commentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        TicketComment comment = commentOpt.get();
        if (!canModifyComment(userId, comment)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        ticketCommentRepository.deleteById(commentId);
        return ResponseEntity.noContent().build();
    }

    private String extractUserId(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return null;
        }

        String token = authorization.substring("Bearer ".length()).trim();
        if (!token.startsWith("jwt-token-")) {
            return null;
        }

        String userId = token.substring("jwt-token-".length()).trim();
        return userId.isEmpty() ? null : userId;
    }

    private boolean canModifyComment(String requesterUserId, TicketComment comment) {
        if (requesterUserId == null || comment == null) {
            return false;
        }

        if (requesterUserId.equals(comment.getUserId())) {
            return true;
        }

        Optional<User> userOpt = userRepository.findById(requesterUserId);
        return userOpt.isPresent() && "ADMIN".equals(userOpt.get().getRole());
    }
}
