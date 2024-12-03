package com.beeja.api.exceptions;

public class CustomAccessDenied extends RuntimeException {
  public CustomAccessDenied(String message) {
    super(message);
  }
}
