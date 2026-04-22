package com.smartcampus.backend.dto;

import java.time.LocalDateTime;

import com.smartcampus.backend.model.ResourceStatus;
import com.smartcampus.backend.model.ResourceType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ResourceDTO(
    String id,
    
    @NotBlank(message = "Resource name is required")
    String name,
    
    @NotNull(message = "Resource type is required")
    ResourceType type,
    
    @NotNull(message = "Capacity is required")
    @Positive(message = "Capacity must be greater than 0")
    Integer capacity,
    
    @NotBlank(message = "Location is required")
    String location,
    
    @NotNull(message = "Status is required")
    ResourceStatus status,
    
    String description,
    
    String availabilityWindows,
    
    LocalDateTime createdAt,
    
    LocalDateTime updatedAt
) {
}
