package com.beeja.api.filemanagement.utils;

public class Constants {
  public static final String ACCESS_TOKEN_HEADER = "authorization";
  public static final String NO_ACCESS_TOKEN_ERROR = "NO AUTH_TOK_403";
  public static final String TOKEN_VERIFICATION_SUCCESSFULLY_FAILED_ERROR =
      "Your authentication has been failed, please try login again";
  public static final String TOKEN_VERIFICATION_FAILED = "Token Verification Failed ";

  //    File Entity Types;
  public static final String EMPLOYEE_ENTITY_TYPE = "employee";
  public static final String PROJECT_ENTITY_TYPE = "project";
  public static final String ORGANIZATION_ENTITY_TYPE = "organization";
  public static final String CLIENT_ENTITY_TYPE = "client";

  //    ERRORS
  public static final String MONGO_UPLOAD_FAILED = "Failed to upload file to Beeja DB";
  public static final String GCS_UPLOAD_FAILED = "Failed to upload file to Beeja Cloud";
  public static final String GCS_FILE_DELETE_ERROR = "Failed to delete file from Beeja Cloud";
  public static final String MONGO_FILE_DELETE_ERROR = "Failed to delete file from Beeja DB";
  public static final String SERVICE_DOWN_ERROR = "Something went wrong in our system ";
  public static final String UNAUTHORISED_ACCESS_ERROR = "You have no permission to access";
  public static final String FAILED_TO_UPDATE_BLOB = "Failed to Update the File with new Path, ";
  public static final String NO_FILE_FOUND_WITH_GIVEN_ID = "No file found with given Id";

  public static final String FILE_MISSING_IN_REQUEST_ERROR = "File is mandatory";
  public static final String INVALID_FILE_FORMATS = "Invalid file type.";
  public static final String SUPPORTED_FILE_TYPES = "Supported types are PDF, DOCX, DOC, PNG, JPEG";
  public static final String NOT_PERMITTED_TO_UPLOAD_OF_TYPE = "Not Permitted To Upload ";
  public static final String FAILED_TO_UPLOAD = "Failed to upload the File  ";
}
