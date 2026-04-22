package com.smartcampus.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.ResourceStatus;
import com.smartcampus.backend.model.ResourceType;

public interface ResourceRepository extends MongoRepository<Resource, String> {

    /**
     * Find all resources by type
     */
    List<Resource> findByType(ResourceType type);

    /**
     * Find all resources by status
     */
    List<Resource> findByStatus(ResourceStatus status);

    /**
     * Find all resources by location
     */
    List<Resource> findByLocation(String location);

    /**
     * Find all resources with capacity greater than or equal to the given value
     */
    @Query("{ 'capacity': { $gte: ?0 } }")
    List<Resource> findByCapacityGreaterThanOrEqual(Integer capacity);

    /**
     * Find resources by type and status
     */
    @Query("{ 'type': ?0, 'status': ?1 }")
    List<Resource> findByTypeAndStatus(ResourceType type, ResourceStatus status);

    /**
     * Find resources by location and status
     */
    @Query("{ 'location': ?0, 'status': ?1 }")
    List<Resource> findByLocationAndStatus(String location, ResourceStatus status);

    /**
     * Find active resources by type and location
     */
    @Query("{ 'type': ?0, 'location': ?1, 'status': 'ACTIVE' }")
    List<Resource> findActiveResourcesByTypeAndLocation(ResourceType type, String location);

    /**
     * Find resources by type and minimum capacity
     */
    @Query("{ 'type': ?0, 'capacity': { $gte: ?1 } }")
    List<Resource> findByTypeAndCapacityGreaterThanOrEqual(ResourceType type, Integer minCapacity);
}
