package com.smartcampus.backend.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BookingResponseDTO {
    private String id;
    private String resourceId;
    private String resourceName;
    private String userId;
    private String userEmail;
    private String userName;
    private String bookingDate;
    private String startTime;
    private String endTime;
    private String purpose;
    private Integer expectedAttendees;
    private String status;
    private String rejectionReason;
    private String reviewedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
