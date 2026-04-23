package com.smartcampus.backend.model;

import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "bookings")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Booking {
    @Id private String id;
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
    private BookingStatus status;
    private String rejectionReason;
    private String reviewedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
