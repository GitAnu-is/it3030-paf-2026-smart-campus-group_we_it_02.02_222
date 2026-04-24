package com.smartcampus.backend.exception;

public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public static ResourceNotFoundException forId(String id) {
        return new ResourceNotFoundException("Resource not found with id: " + id);
    }
}
