package com.beeja.api.notifications.exceptions;

public class CustomExceptionHandler extends RuntimeException {
  public CustomExceptionHandler(String message) {
    super(message);
  }
}
