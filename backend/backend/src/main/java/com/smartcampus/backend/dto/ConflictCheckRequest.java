package com.smartcampus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ConflictCheckRequest {
    private String resourceId;
    private String date;
    private String startTime;
    private String endTime;
}
