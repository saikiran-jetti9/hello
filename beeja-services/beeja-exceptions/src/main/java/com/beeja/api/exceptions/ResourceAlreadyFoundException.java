package com.beeja.api.exceptions;

public class ResourceAlreadyFoundException extends RuntimeException {
  public ResourceAlreadyFoundException(String message) {
    super(message);
  }
}
