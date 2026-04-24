package com.smartcampus.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.smartcampus.backend.dto.ResourceDTO;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.mapper.ResourceMapper;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.ResourceStatus;
import com.smartcampus.backend.model.ResourceType;
import com.smartcampus.backend.repository.ResourceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final ResourceMapper resourceMapper;

    /**
     * Get all resources
     */
    public List<ResourceDTO> getAllResources() {
        return resourceRepository.findAll().stream()
                .map(resourceMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a resource by id
     */
    public ResourceDTO getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.forId(id));
        return resourceMapper.toDTO(resource);
    }

    /**
     * Create a new resource from ResourceDTO
     */
    public ResourceDTO createResource(ResourceDTO resourceDTO) {
        Resource resource = resourceMapper.toEntity(resourceDTO);
        resource.setCreatedAt(LocalDateTime.now());
        resource.setUpdatedAt(LocalDateTime.now());
        Resource savedResource = resourceRepository.save(resource);
        return resourceMapper.toDTO(savedResource);
    }

    /**
     * Update an existing resource
     */
    public ResourceDTO updateResource(String id, ResourceDTO resourceDTO) {
        Resource existingResource = resourceRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.forId(id));

        Resource updatedResource = resourceMapper.updateEntityFromDTO(resourceDTO, existingResource);
        updatedResource.setUpdatedAt(LocalDateTime.now());
        Resource savedResource = resourceRepository.save(updatedResource);
        return resourceMapper.toDTO(savedResource);
    }

    /**
     * Delete a resource by id
     */
    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw ResourceNotFoundException.forId(id);
        }
        resourceRepository.deleteById(id);
    }

    /**
     * Search resources with optional filters
     * Parameters are optional - null values are ignored in the search
     */
    public List<ResourceDTO> searchResources(String type, Integer minCapacity, 
                                            String location, String status) {
        List<Resource> resources = resourceRepository.findAll();

        return resources.stream()
                .filter(resource -> type == null || 
                        resource.getType().toString().equals(type.toUpperCase()))
                .filter(resource -> minCapacity == null || 
                        resource.getCapacity() >= minCapacity)
                .filter(resource -> location == null || 
                        resource.getLocation().equalsIgnoreCase(location))
                .filter(resource -> status == null || 
                        resource.getStatus().toString().equals(status.toUpperCase()))
                .map(resourceMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Find resources by type
     */
    public List<ResourceDTO> findByType(ResourceType type) {
        return resourceRepository.findByType(type).stream()
                .map(resourceMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Find resources by status
     */
    public List<ResourceDTO> findByStatus(ResourceStatus status) {
        return resourceRepository.findByStatus(status).stream()
                .map(resourceMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Find resources by location
     */
    public List<ResourceDTO> findByLocation(String location) {
        return resourceRepository.findByLocation(location).stream()
                .map(resourceMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Find resources with capacity greater than or equal to the given value
     */
    public List<ResourceDTO> findByCapacityGreaterThanOrEqual(Integer capacity) {
        if (capacity < 0) {
            throw new IllegalArgumentException("Capacity must be non-negative");
        }
        return resourceRepository.findByCapacityGreaterThanOrEqual(capacity).stream()
                .map(resourceMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Find resources by type and status
     */
    public List<ResourceDTO> findByTypeAndStatus(ResourceType type, ResourceStatus status) {
        return resourceRepository.findByTypeAndStatus(type, status).stream()
                .map(resourceMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Find resources by location and status
     */
    public List<ResourceDTO> findByLocationAndStatus(String location, ResourceStatus status) {
        return resourceRepository.findByLocationAndStatus(location, status).stream()
                .map(resourceMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Find active resources by type and location
     */
    public List<ResourceDTO> findActiveResourcesByTypeAndLocation(ResourceType type, String location) {
        return resourceRepository.findActiveResourcesByTypeAndLocation(type, location).stream()
                .map(resourceMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Find resources by type and minimum capacity
     */
    public List<ResourceDTO> findByTypeAndCapacityGreaterThanOrEqual(ResourceType type, Integer minCapacity) {
        if (minCapacity < 0) {
            throw new IllegalArgumentException("Minimum capacity must be non-negative");
        }
        return resourceRepository.findByTypeAndCapacityGreaterThanOrEqual(type, minCapacity).stream()
                .map(resourceMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Check if a resource exists by id
     */
    public boolean existsById(String id) {
        return resourceRepository.existsById(id);
    }

    /**
     * Get count of all resources
     */
    public long countAllResources() {
        return resourceRepository.count();
    }

    /**
     * Get count of resources by status
     */
    public long countByStatus(ResourceStatus status) {
        return resourceRepository.findByStatus(status).size();
    }

    /**
     * Get count of resources by type
     */
    public long countByType(ResourceType type) {
        return resourceRepository.findByType(type).size();
    }
}
