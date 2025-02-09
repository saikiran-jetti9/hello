package com.beeja.api.employeemanagement.utils;

import com.beeja.api.employeemanagement.enums.ErrorCode;
import com.beeja.api.employeemanagement.enums.ErrorType;

public class BuildErrorMessage {
  public static String buildErrorMessage(ErrorType errorType, ErrorCode errorCode, String message) {
    return String.format("%s,%s,%s", errorType, errorCode, message);
  }
}
