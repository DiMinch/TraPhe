package com.example.traphe_backend.exception;

public class BranchNotActiveException extends RuntimeException {
    public BranchNotActiveException(String message) {
        super(message);
    }
}
