package com.smartcampus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BookingRequestDTO {
    @NotBlank private String resourceId;
    @NotBlank private String bookingDate;
    @NotBlank private String startTime;
    @NotBlank private String endTime;
    @NotBlank private String purpose;
    private Integer expectedAttendees;
}
