package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.BookingRequestDTO;
import com.smartcampus.backend.dto.BookingResponseDTO;
import com.smartcampus.backend.dto.BookingStatusUpdateDTO;
import com.smartcampus.backend.dto.ConflictCheckRequest;
import com.smartcampus.backend.dto.ErrorResponse;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.BookingRepository;
import com.smartcampus.backend.repository.UserRepository;
import com.smartcampus.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/bookings")
@CrossOrigin
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    /**
     * Helper method to extract userId from JWT token
     */
    private String extractUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7).trim();
        if (token.startsWith("jwt-token-")) {
            return token.substring("jwt-token-".length()).trim();
        }
        return null;
    }

    /**
     * Helper method to get user info from userId
     */
    private User getUserFromToken(String authHeader) {
        String userId = extractUserIdFromToken(authHeader);
        if (userId == null || userId.isEmpty()) {
            return null;
        }
        Optional<User> userOpt = userRepository.findById(userId);
        return userOpt.orElse(null);
    }

    /**
     * POST /api/v1/bookings - Create a new booking
     */
    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestBody BookingRequestDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User user = getUserFromToken(authHeader);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ErrorResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(401)
                        .message("Unauthorized")
                        .build()
                );
            }

            BookingResponseDTO response = bookingService.createBooking(
                dto,
                user.getId(),
                user.getEmail(),
                user.getDisplayName() != null ? user.getDisplayName() : user.getUsername()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ErrorResponse.builder()
                    .timestamp(LocalDateTime.now())
                    .status(400)
                    .message(e.getMessage())
                    .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ErrorResponse.builder()
                    .timestamp(LocalDateTime.now())
                    .status(500)
                    .message("Internal server error")
                    .build()
            );
        }
    }

    /**
     * GET /api/v1/bookings/my - Get current user's bookings
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyBookings(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User user = getUserFromToken(authHeader);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ErrorResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(401)
                        .message("Unauthorized")
                        .build()
                );
            }

            return ResponseEntity.ok(bookingService.getBookingsByUserId(user.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ErrorResponse.builder()
                    .timestamp(LocalDateTime.now())
                    .status(500)
                    .message("Internal server error")
                    .build()
            );
        }
    }

    /**
     * GET /api/v1/bookings - Get all bookings with optional filters
     */
    @GetMapping
    public ResponseEntity<?> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) String userId) {
        try {
            return ResponseEntity.ok(bookingService.getAllBookings(status, resourceId, userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ErrorResponse.builder()
                    .timestamp(LocalDateTime.now())
                    .status(500)
                    .message("Internal server error")
                    .build()
            );
        }
    }

    /**
     * GET /api/v1/bookings/{id} - Get booking by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(bookingService.getBookingById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ErrorResponse.builder()
                    .timestamp(LocalDateTime.now())
                    .status(400)
                    .message(e.getMessage())
                    .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ErrorResponse.builder()
                    .timestamp(LocalDateTime.now())
                    .status(500)
                    .message("Internal server error")
                    .build()
            );
        }
    }

    /**
     * PUT /api/v1/bookings/{id}/status - Update booking status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable String id,
            @RequestBody BookingStatusUpdateDTO dto) {
        try {
            BookingResponseDTO response = bookingService.updateBookingStatus(id, dto);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ErrorResponse.builder()
                    .timestamp(LocalDateTime.now())
                    .status(400)
                    .message(e.getMessage())
                    .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ErrorResponse.builder()
                    .timestamp(LocalDateTime.now())
                    .status(500)
                    .message("Internal server error")
                    .build()
            );
        }
    }

    /**
     * PUT /api/v1/bookings/{id}/cancel - Cancel a booking
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User user = getUserFromToken(authHeader);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ErrorResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(401)
                        .message("Unauthorized")
                        .build()
                );
            }

            BookingResponseDTO response = bookingService.cancelBooking(id, user.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ErrorResponse.builder()
                    .timestamp(LocalDateTime.now())
                    .status(400)
                    .message(e.getMessage())
                    .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ErrorResponse.builder()
                    .timestamp(LocalDateTime.now())
                    .status(500)
                    .message("Internal server error")
                    .build()
            );
        }
    }

    /**
     * POST /api/v1/bookings/check-conflict - Check for booking conflicts
     */
    @PostMapping("/check-conflict")
    public ResponseEntity<?> checkConflict(@RequestBody ConflictCheckRequest request) {
        try {
            boolean hasConflict = bookingService.checkConflict(request);
            return ResponseEntity.ok(Map.of("hasConflict", hasConflict));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ErrorResponse.builder()
                    .timestamp(LocalDateTime.now())
                    .status(500)
                    .message("Internal server error")
                    .build()
            );
        }
    }

    /**
     * DELETE /api/v1/bookings/{id} - Delete a booking
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable String id) {
        try {
            bookingRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Booking deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ErrorResponse.builder()
                    .timestamp(LocalDateTime.now())
                    .status(500)
                    .message("Internal server error")
                    .build()
            );
        }
    }
}
