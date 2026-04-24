package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.BookingRequestDTO;
import com.smartcampus.backend.dto.BookingResponseDTO;
import com.smartcampus.backend.dto.BookingStatusUpdateDTO;
import com.smartcampus.backend.dto.ConflictCheckRequest;
import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.BookingStatus;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.repository.BookingRepository;
import com.smartcampus.backend.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    public BookingResponseDTO createBooking(BookingRequestDTO dto, String userId, String userEmail, String userName) {
        // Find resource by resourceId
        Optional<Resource> resourceOpt = resourceRepository.findById(dto.getResourceId());
        if (resourceOpt.isEmpty()) {
            throw new RuntimeException("Resource not found");
        }
        Resource resource = resourceOpt.get();

        // Check for conflicts
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            dto.getResourceId(),
            dto.getBookingDate(),
            dto.getStartTime(),
            dto.getEndTime()
        );
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("This time slot is already booked for this resource");
        }

        // Build Booking object
        Booking booking = Booking.builder()
            .resourceId(dto.getResourceId())
            .resourceName(resource.getName())
            .userId(userId)
            .userEmail(userEmail)
            .userName(userName)
            .bookingDate(dto.getBookingDate())
            .startTime(dto.getStartTime())
            .endTime(dto.getEndTime())
            .purpose(dto.getPurpose())
            .expectedAttendees(dto.getExpectedAttendees())
            .status(BookingStatus.PENDING)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        Booking savedBooking = bookingRepository.save(booking);
        return mapToResponseDTO(savedBooking);
    }

    public List<BookingResponseDTO> getBookingsByUserId(String userId) {
        return bookingRepository.findByUserId(userId)
            .stream()
            .map(this::mapToResponseDTO)
            .collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getAllBookings(String status, String resourceId, String userId) {
        List<Booking> bookings;

        if (status == null && resourceId == null && userId == null) {
            // Return all bookings
            bookings = bookingRepository.findAll();
        } else if (status != null && resourceId == null && userId == null) {
            // Filter by status
            BookingStatus bookingStatus = BookingStatus.valueOf(status);
            bookings = bookingRepository.findByStatus(bookingStatus);
        } else if (userId != null && status == null && resourceId == null) {
            // Filter by userId
            bookings = bookingRepository.findByUserId(userId);
        } else if (userId != null && status != null) {
            // Filter by userId and status
            BookingStatus bookingStatus = BookingStatus.valueOf(status);
            bookings = bookingRepository.findByUserIdAndStatus(userId, bookingStatus);
        } else if (resourceId != null) {
            // Filter by resourceId
            bookings = bookingRepository.findByResourceId(resourceId);
        } else {
            bookings = bookingRepository.findAll();
        }

        return bookings.stream()
            .map(this::mapToResponseDTO)
            .collect(Collectors.toList());
    }

    public BookingResponseDTO getBookingById(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        return mapToResponseDTO(booking);
    }

    public BookingResponseDTO updateBookingStatus(String bookingId, BookingStatusUpdateDTO dto) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Only allow if current status is PENDING
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be updated");
        }

        // If new status is REJECTED and reason is blank, throw error
        BookingStatus newStatus = BookingStatus.valueOf(dto.getStatus());
        if (newStatus == BookingStatus.REJECTED && (dto.getReason() == null || dto.getReason().isBlank())) {
            throw new RuntimeException("Rejection reason is required");
        }

        booking.setStatus(newStatus);
        booking.setRejectionReason(dto.getReason());
        booking.setReviewedBy(dto.getReviewedBy());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);
        return mapToResponseDTO(updatedBooking);
    }

    public BookingResponseDTO cancelBooking(String bookingId, String userId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Check if user owns this booking
        if (!booking.getUserId().equals(userId)) {
            throw new RuntimeException("You can only cancel your own bookings");
        }

        // Only PENDING or APPROVED bookings can be cancelled
        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new RuntimeException("Only PENDING or APPROVED bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking cancelledBooking = bookingRepository.save(booking);
        return mapToResponseDTO(cancelledBooking);
    }

    public boolean checkConflict(ConflictCheckRequest request) {
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            request.getResourceId(),
            request.getDate(),
            request.getStartTime(),
            request.getEndTime()
        );
        return !conflicts.isEmpty();
    }

    private BookingResponseDTO mapToResponseDTO(Booking booking) {
        return BookingResponseDTO.builder()
            .id(booking.getId())
            .resourceId(booking.getResourceId())
            .resourceName(booking.getResourceName())
            .userId(booking.getUserId())
            .userEmail(booking.getUserEmail())
            .userName(booking.getUserName())
            .bookingDate(booking.getBookingDate())
            .startTime(booking.getStartTime())
            .endTime(booking.getEndTime())
            .purpose(booking.getPurpose())
            .expectedAttendees(booking.getExpectedAttendees())
            .status(booking.getStatus().name())
            .rejectionReason(booking.getRejectionReason())
            .reviewedBy(booking.getReviewedBy())
            .createdAt(booking.getCreatedAt())
            .updatedAt(booking.getUpdatedAt())
            .build();
    }
}
