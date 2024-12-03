package com.beeja.api.filemanagement.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.beeja.api.filemanagement.config.authentication.AuthUserFilter;
import com.beeja.api.filemanagement.exceptions.*;
import com.beeja.api.filemanagement.model.File;
import com.beeja.api.filemanagement.requests.FileUploadRequest;
import com.beeja.api.filemanagement.service.FileService;
import com.beeja.api.filemanagement.serviceImpl.FileServiceImpl;
import com.beeja.api.filemanagement.utils.Constants;
import jakarta.ws.rs.core.MediaType;
import java.nio.file.AccessDeniedException;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@WebMvcTest(FileController.class)
class FileControllerTest {

  @Autowired private MockMvc mockMvc;
  @Mock private FileServiceImpl fileServiceImpl;

  @MockBean private AuthUserFilter authUserFilter;

  @MockBean private FileService fileService;
  @InjectMocks private FileController fileController;

  private static final String fileId = "file123";

  private static final String entityId = "TAC123";

  @BeforeEach
  public void setUp() {
    MockitoAnnotations.initMocks(this);
    this.mockMvc = MockMvcBuilders.standaloneSetup(fileController).build();
  }

  //    getall files by entity Id

  @Test
  public void testGetAllFilesByEntityId() throws Exception {
    // Arrange
    List<File> mockFiles = new ArrayList<File>();
    // Act
    when(fileService.listofFileByEntityId(anyString())).thenReturn(mockFiles);
    // Assert
    mockMvc.perform(MockMvcRequestBuilders.get("/api/v1/files/TACRAVI")).andExpect(status().isOk());
  }

  @Test
  void testgetAllFilesByEntitiIdBadrequest() throws Exception {
    // Arrange
    when(fileController.getAllFilesByEntityId("ABCD"))
        .thenThrow(new OrganizationMismatchException("Bad request"));
    // Act
    ResponseEntity<?> responseEntity = fileController.getAllFilesByEntityId("ABCD");
    // Assert
    assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
  }

  @Test
  void testgetAllFilesByEntitiydBadRequetUAC() throws Exception {
    // Arrange
    when(fileController.getAllFilesByEntityId("ABCD"))
        .thenThrow(new UnAuthorisedException("Bad request"));
    // Act
    ResponseEntity<?> responseEntity = fileController.getAllFilesByEntityId("ABCD");
    // Assert
    assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
  }

  @Test
  void testgetAllFilesByEntitiydForbidden() throws Exception {
    // Arrange
    when(fileController.getAllFilesByEntityId("ABCD"))
        .thenThrow(new AccessDeniedException("FORBIDDEN "));
    // Act
    ResponseEntity<?> responseEntity = fileController.getAllFilesByEntityId("ABCD");
    // Assert
    assertEquals(HttpStatus.FORBIDDEN, responseEntity.getStatusCode());
  }

  @Test
  void testgetAllFilesByEntitiydInternalServer() throws Exception {
    // Arrange
    when(fileController.getAllFilesByEntityId("ABCD"))
        .thenThrow(new Exception("INTERNAL SERVER ERROR"));
    // Act
    ResponseEntity<?> responseEntity = fileController.getAllFilesByEntityId("ABCD");
    // Assert
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, responseEntity.getStatusCode());
  }

  //    To create methods
  @Test
  void testHandleFileUploadSuccess() throws Exception {
    // Arrange
    MockMultipartFile file =
        new MockMultipartFile("file", "test.txt", MediaType.TEXT_PLAIN, "Hello, World!".getBytes());
    // Act
    MockMvc mockMvc = MockMvcBuilders.standaloneSetup(fileServiceImpl).build();
    // Assert
    mockMvc.perform(MockMvcRequestBuilders.multipart("/api/v1/files/upload").file(file));
  }

  @Test
  public void testUploadFileMissingFile() throws Exception {
    // Arrange
    FileUploadRequest fileUploadRequest = new FileUploadRequest();
    // Act
    ResponseEntity<?> responseEntity = fileController.uploadFile(fileUploadRequest);
    // Assert
    assertNotNull(responseEntity);
    assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
    assertEquals(Constants.FILE_MISSING_IN_REQUEST_ERROR, responseEntity.getBody());
  }

  @Test
  void testUploadFileGCSUploadFailed() throws Exception {
    // Arrange
    FileUploadRequest fileUploadRequest = new FileUploadRequest();
    fileUploadRequest.setFile(
        new MockMultipartFile("file", "test.txt", "text/plain", "Hello, World!".getBytes()));
    when(fileController.uploadFile(fileUploadRequest))
        .thenThrow(new GCSFileAccessException("GCS upload failed"));
    // Act
    ResponseEntity<?> responseEntity = fileController.uploadFile(fileUploadRequest);
    // Assert
    assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
  }

  @Test
  void testUploadFileMongoFileUploadEx() throws Exception {
    // Arrange
    FileUploadRequest fileUploadRequest = new FileUploadRequest();
    // Act
    fileUploadRequest.setFile(
        new MockMultipartFile("file", "test.txt", "text/plain", "Hello, World!".getBytes()));
    when(fileController.uploadFile(fileUploadRequest))
        .thenThrow(new MongoFileUploadException("Mongo File Upload Exception"));
    // Act
    ResponseEntity<?> responseEntity = fileController.uploadFile(fileUploadRequest);
    // Assert
    assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
  }

  @Test
  void testUploadFileAccessDeniedException() throws Exception {
    // Arrange
    FileUploadRequest fileUploadRequest = new FileUploadRequest();
    fileUploadRequest.setFile(
        new MockMultipartFile("file", "test.txt", "text/plain", "Hello, World!".getBytes()));
    when(fileController.uploadFile(fileUploadRequest))
        .thenThrow(new AccessDeniedException("Access Denied Exception"));
    // Act
    ResponseEntity<?> responseEntity = fileController.uploadFile(fileUploadRequest);
    // Assert
    assertEquals(HttpStatus.FORBIDDEN, responseEntity.getStatusCode());
  }

  @Test
  void testUploadFileFileMisMatchEx() throws Exception {
    // Arrange
    FileUploadRequest fileUploadRequest = new FileUploadRequest();
    fileUploadRequest.setFile(
        new MockMultipartFile("file", "test.txt", "text/plain", "Hello, World!".getBytes()));
    when(fileController.uploadFile(fileUploadRequest))
        .thenThrow(new FileTypeMismatchException("File Mismatch Exception"));
    // Act
    ResponseEntity<?> responseEntity = fileController.uploadFile(fileUploadRequest);
    // Assert
    assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
  }

  @Test
  void testUploadFileInternalServerError() throws Exception {
    // Arrange
    FileUploadRequest fileUploadRequest = new FileUploadRequest();
    fileUploadRequest.setFile(
        new MockMultipartFile("file", "test.txt", "text/plain", "Hello, World!".getBytes()));
    when(fileController.uploadFile(fileUploadRequest)).thenThrow(new Exception("Exception"));
    // Act
    ResponseEntity<?> responseEntity = fileController.uploadFile(fileUploadRequest);
    // Assert
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, responseEntity.getStatusCode());
  }

  @Test
  void testDownloadOrganizationMismatch() throws Exception {
    // Arrange
    when(fileController.downloadFile(anyString()))
        .thenThrow(new OrganizationMismatchException("Organization mismatch"));
    ResponseEntity<?> responseEntity = fileController.downloadFile(fileId);
    // Assert
    assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
  }

  @Test
  void testDownloadFileUnAuthorised() throws Exception {
    // Arrange
    when(fileController.downloadFile(anyString()))
        .thenThrow(new UnAuthorisedException("Unauthorized access"));
    // Act
    ResponseEntity<?> responseEntity = fileController.downloadFile(fileId);
    // Assert
    assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
    assertEquals("Unauthorized access", responseEntity.getBody());
  }

  @Test
  void testDownloadFileInternalServerError() throws Exception {
    // Arrange
    when(fileController.downloadFile(anyString()))
        .thenThrow(new RuntimeException("Unexpected error"));
    // Act
    ResponseEntity<?> responseEntity = fileController.downloadFile(fileId);
    // Assert
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, responseEntity.getStatusCode());
  }

  // delete file

  @Test
  void testDeleteFileOrganizationMismatch1() throws Exception {
    // Arrange
    when(fileController.deleteFile(anyString()))
        .thenThrow(new OrganizationMismatchException("Organization mismatch"));
    // Act
    ResponseEntity<?> responseEntity = fileController.deleteFile(fileId);
    // Assert
    assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
  }

  @Test
  void testDeleteFileUnAuthorised() throws Exception {
    // Arrange
    when(fileController.deleteFile(anyString()))
        .thenThrow(new UnAuthorisedException("Unauthorized access"));
    // Act
    ResponseEntity<?> responseEntity = fileController.deleteFile(fileId);
    // Assert
    assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
  }

  @Test
  void testDeleteFileForbidden() throws Exception {
    // Arrange
    when(fileController.deleteFile(anyString()))
        .thenThrow(new AccessDeniedException("Forbidden access"));
    // Act
    ResponseEntity<?> responseEntity = fileController.deleteFile(fileId);
    // Assert
    assertEquals(HttpStatus.FORBIDDEN, responseEntity.getStatusCode());
  }

  @Test
  void testDeleteFileInternalServerError() throws Exception {
    // Arrange
    when(fileController.deleteFile(anyString()))
        .thenThrow(new RuntimeException("Unexpected error"));
    // Act
    ResponseEntity<?> responseEntity = fileController.deleteFile(fileId);
    // Assert
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, responseEntity.getStatusCode());
  }
}
