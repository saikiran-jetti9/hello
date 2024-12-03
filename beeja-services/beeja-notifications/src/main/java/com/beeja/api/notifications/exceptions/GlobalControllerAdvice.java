package com.beeja.api.notifications.exceptions;

import com.beeja.api.notifications.response.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

/**
 * Global controller advice to handle exceptions thrown by controllers. This class is annotated with
 * {@code @ControllerAdvice}, indicating that it is intended to provide centralized exception
 * handling for all controllers in the application. <br>
 * <br>
 * Any method within this class annotated with {@code @ExceptionHandler} will handle exceptions of
 * the specified type thrown by controllers. These methods can return a variety of types, such as a
 * ResponseEntity for customized error responses or texts. <br>
 * <br>
 * <b>NOTE:</b>It is recommended to define exception handling methods in this class to avoid
 * duplication and maintain consistency in error handling across the application.
 */
@ControllerAdvice
public class GlobalControllerAdvice {

  @ExceptionHandler(CustomExceptionHandler.class)
  public ResponseEntity<ErrorResponse> handleCustomExceptionHandler(CustomExceptionHandler e) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(new ErrorResponse(HttpStatus.BAD_REQUEST.toString(), e.getMessage()));
  }

  @ExceptionHandler(UnAuthorisedException.class)
  public ResponseEntity<ErrorResponse> handleUnAuthorisedException(UnAuthorisedException e) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(new ErrorResponse(HttpStatus.FORBIDDEN.toString(), e.getMessage()));
  }

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
      ResourceNotFoundException e) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(new ErrorResponse(HttpStatus.NOT_FOUND.toString(), e.getMessage()));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleException(Exception e) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.toString(), e.getMessage()));
  }
}
