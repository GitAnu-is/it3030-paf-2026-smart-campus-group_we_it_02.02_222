package com.smartcampus.backend.mapper;

import org.springframework.stereotype.Component;

import com.smartcampus.backend.dto.ResourceDTO;
import com.smartcampus.backend.model.Resource;

@Component
public class ResourceMapper {

    /**
     * Convert Resource entity to ResourceDTO
     */
    public ResourceDTO toDTO(Resource resource) {
        if (resource == null) {
            return null;
        }

        return new ResourceDTO(
            resource.getId(),
            resource.getName(),
            resource.getType(),
            resource.getCapacity(),
            resource.getLocation(),
            resource.getStatus(),
            resource.getDescription(),
            resource.getAvailabilityWindows(),
            resource.getCreatedAt(),
            resource.getUpdatedAt()
        );
    }

    /**
     * Convert ResourceDTO to Resource entity
     * Note: createdAt and updatedAt are managed by MongoDB, so they are ignored in this conversion
     */
    public Resource toEntity(ResourceDTO resourceDTO) {
        if (resourceDTO == null) {
            return null;
        }

        return Resource.builder()
            .id(resourceDTO.id())
            .name(resourceDTO.name())
            .type(resourceDTO.type())
            .capacity(resourceDTO.capacity())
            .location(resourceDTO.location())
            .status(resourceDTO.status())
            .description(resourceDTO.description())
            .availabilityWindows(resourceDTO.availabilityWindows())
            .createdAt(resourceDTO.createdAt())
            .updatedAt(resourceDTO.updatedAt())
            .build();
    }

    /**
     * Update an existing Resource entity with data from ResourceDTO
     * Preserves createdAt and only updates other fields
     */
    public Resource updateEntityFromDTO(ResourceDTO resourceDTO, Resource existingResource) {
        if (resourceDTO == null || existingResource == null) {
            return existingResource;
        }

        existingResource.setName(resourceDTO.name());
        existingResource.setType(resourceDTO.type());
        existingResource.setCapacity(resourceDTO.capacity());
        existingResource.setLocation(resourceDTO.location());
        existingResource.setStatus(resourceDTO.status());
        existingResource.setDescription(resourceDTO.description());
        existingResource.setAvailabilityWindows(resourceDTO.availabilityWindows());
        // Note: createdAt is preserved, updatedAt will be set by @UpdateTimestamp

        return existingResource;
    }
}
