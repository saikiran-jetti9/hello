package com.beeja.api.filemanagement.serviceImpl;

import static com.beeja.api.filemanagement.utils.Constants.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageException;
import com.mongodb.MongoWriteException;
import com.beeja.api.filemanagement.config.properties.AllowedContentTypes;
import com.beeja.api.filemanagement.config.properties.GCSProperties;
import com.beeja.api.filemanagement.exceptions.FileTypeMismatchException;
import com.beeja.api.filemanagement.exceptions.GCSFileAccessException;
import com.beeja.api.filemanagement.exceptions.MongoFileUploadException;
import com.beeja.api.filemanagement.model.File;
import com.beeja.api.filemanagement.repository.FileRepository;
import com.beeja.api.filemanagement.requests.FileUploadRequest;
import com.beeja.api.filemanagement.utils.UserContext;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ContextConfiguration(
    classes = {FileServiceImpl.class, AllowedContentTypes.class, GCSProperties.class})
@ExtendWith(SpringExtension.class)
public class FileServiceImplTest {

  private static final String MONGO_FILE_DELETE_ERROR = "Something went wrong in our system";
  private static final String GCS_FILE_DELETE_ERROR = "Something went wrong in our system";

  private static final String READ_EMPLOYEE = "READ_EMPLOYEE";
  @Autowired private AllowedContentTypes allowedContentTypes;
  @MockBean private FileRepository fileRepository;
  @Autowired private FileServiceImpl fileServiceImpl;
  @Autowired private GCSProperties gcsProperties;
  @MockBean private Storage storage;

  @Test
  public void testFileTypeMismatchException() {
    // Arrange
    MockMultipartFile mockFile =
        new MockMultipartFile("file", "filename.txt", "invalid/type", "content".getBytes());
    FileUploadRequest fileUploadRequest = new FileUploadRequest();
    fileUploadRequest.setFile(mockFile);
    String[] allowedTypes = {"valid/type"};
    allowedContentTypes.setAllowedTypes(allowedTypes);
    // Act
    FileTypeMismatchException exception =
        assertThrows(
            FileTypeMismatchException.class,
            () -> {
              fileServiceImpl.uploadFile(fileUploadRequest);
            });
    // Assert
    assertEquals(exception.getMessage(), INVALID_FILE_FORMATS + " " + SUPPORTED_FILE_TYPES);
  }

  @Test
  public void testServerDownException() {
    // Arrange
    MockMultipartFile mockFile =
        new MockMultipartFile(
            "file",
            "filename.txt",
            "invalid/type", // Set an invalid content type here
            "content".getBytes());
    FileUploadRequest fileUploadRequest = new FileUploadRequest();
    fileUploadRequest.setFile(mockFile);
    // Act
    Exception exception =
        assertThrows(
            Exception.class,
            () -> {
              fileServiceImpl.uploadFile(fileUploadRequest);
            });
    // Assert
    assertEquals(exception.getMessage(), SERVICE_DOWN_ERROR);
  }

  @Test
  public void testMongoDBException() throws Exception {
    // Arrange
    MockMultipartFile mockFile =
        new MockMultipartFile("file", "filename.txt", "valid/type", "content".getBytes());
    FileUploadRequest fileUploadRequest = new FileUploadRequest();
    fileUploadRequest.setFile(mockFile);
    fileUploadRequest.setDescription("");
    fileUploadRequest.setEntityId("id");
    String[] allowedTypes = {"valid/type"};
    allowedContentTypes.setAllowedTypes(allowedTypes);
    Set<String> stringSet = new HashSet<>();
    stringSet.add(READ_EMPLOYEE);
    stringSet.add("Test");
    UserContext.setLoggedInUserPermissions(stringSet);
    Map<String, Object> loggedInUserOrganization = new HashMap<>();
    loggedInUserOrganization.put("id", 123);
    UserContext.setLoggedInUserOrganization(loggedInUserOrganization);
    File file = new File();
    // Act
    Mockito.when(fileRepository.save(Mockito.any(File.class))).thenThrow(MongoWriteException.class);
    Exception writeException =
        assertThrows(
            Exception.class,
            () -> {
              fileServiceImpl.uploadFile(fileUploadRequest);
            });
    // Assert
    assertEquals(writeException.getMessage(), MONGO_UPLOAD_FAILED);
  }

  @Test
  public void testGCSException() throws Exception {
    // Arrange
    MockMultipartFile mockFile =
        new MockMultipartFile("file", "filename.txt", "valid/type", "content".getBytes());
    FileUploadRequest fileUploadRequest = new FileUploadRequest();
    fileUploadRequest.setFile(mockFile);
    fileUploadRequest.setDescription("");
    fileUploadRequest.setEntityId("id");
    String[] allowedTypes = {"valid/type"};
    allowedContentTypes.setAllowedTypes(allowedTypes);
    Set<String> stringSet = new HashSet<>();
    stringSet.add(READ_EMPLOYEE);
    UserContext.setLoggedInUserPermissions(stringSet);
    Map<String, Object> loggedInUserOrganization = new HashMap<>();
    loggedInUserOrganization.put("id", 123);
    UserContext.setLoggedInUserOrganization(loggedInUserOrganization);
    File fileEntity = new File();
    fileEntity.setName("SampleFile.txt");
    fileEntity.setFileType("Text");
    fileEntity.setFileFormat("TXT");
    fileEntity.setId("id");
    fileEntity.setFileSize("Size");
    fileEntity.setEntityId("testId");
    fileEntity.setEntityType("dummyType");
    fileEntity.setDescription("test description");
    Mockito.when(fileRepository.save(Mockito.any(File.class))).thenReturn(fileEntity);
    GCSProperties.Bucket bucket = new GCSProperties.Bucket();
    bucket.setName("Test");
    gcsProperties.setBucket(bucket);
    // Act
    doThrow(StorageException.class).when(storage).create(any(BlobInfo.class), any(byte[].class));
    Exception writeException =
        assertThrows(
            Exception.class,
            () -> {
              fileServiceImpl.uploadFile(fileUploadRequest);
            });
    System.out.println("Exception " + writeException.getMessage());
    // Assert
    assertEquals(writeException.getMessage(), GCS_UPLOAD_FAILED);
  }

  @Test
  void testReturnWhenListOfFileByEntityId() throws Exception {
    // Arrange
    Map<String, Object> loggedInUserOrganization = new HashMap<>();
    loggedInUserOrganization.put("id", 123);
    UserContext.setLoggedInUserOrganization(loggedInUserOrganization);
    UserContext.setLoggedInEmployeeId("id");
    List<File> files = new ArrayList<>();
    // Act
    when(fileRepository.findByEntityId("id")).thenReturn(files);
    List<File> result = fileServiceImpl.listofFileByEntityId("id");
    // Assert
    assertEquals(result, files);
  }

  @Test
  void testExceptionWhenListOfFileByEntityId() {
    // Arrange
    UserContext.setLoggedInUserPermissions(null);
    // Act
    Exception exception =
        assertThrows(
            Exception.class,
            () -> {
              fileServiceImpl.listofFileByEntityId("");
            });
    // Assert
    assertEquals(SERVICE_DOWN_ERROR, exception.getMessage());
  }

  @Test
  void testReturnByteArrayResourceWhenDownloadFile() throws Exception {
    // Arrange
    Map<String, Object> loggedInUserOrganization = new HashMap<>();
    loggedInUserOrganization.put("id", "123");
    UserContext.setLoggedInUserOrganization(loggedInUserOrganization);
    File file = new File();
    file.setOrganizationId("123");
    file.setCreatedBy("test-employee");
    file.setId("id");
    file.setEntityId("id");
    file.setEntityType("type");
    file.setFileType("fieldType");
    UserContext.setLoggedInUserEmail("test-employee");
    when(fileRepository.findById(anyString())).thenReturn(Optional.of(file));
    GCSProperties.Bucket bucket = new GCSProperties.Bucket();
    bucket.setName("Test");
    gcsProperties.setBucket(bucket);
    Blob mockBlob = mock(Blob.class);
    File mockFile = new File();
    mockFile.setId("id");
    byte[] mockContent = "Sample content".getBytes();
    // Act
    when(mockBlob.getContent()).thenReturn(mockContent);
    when(storage.get(anyString(), anyString())).thenReturn(mockBlob);
    ByteArrayResource result = fileServiceImpl.downloadFile("fileId").getResource();
    result.getFilename();
    // Assert
    assertEquals("Sample content", new String(result.getByteArray()));
  }

  @Test
  void testUnAuthorisedExceptionWhenDownloadFile() throws Exception {
    // Arrange
    Map<String, Object> loggedInUserOrganization = new HashMap<>();
    loggedInUserOrganization.put("id", "123");
    UserContext.setLoggedInUserOrganization(loggedInUserOrganization);
    UserContext.setLoggedInUserEmail("test@gmail.com");
    File file = new File();
    file.setOrganizationId("123");
    UserContext.setLoggedInUserEmail("null");
    UserContext.setLoggedInUserPermissions(Collections.singleton("null"));
    // Act
    when(fileRepository.findById(anyString())).thenReturn(Optional.of(file));
    Exception exception =
        assertThrows(
            Exception.class,
            () -> {
              fileServiceImpl.downloadFile("file");
            });
    System.out.println("exception " + exception.getMessage());
    // Assert
    assertEquals(UNAUTHORISED_ACCESS_ERROR, exception.getMessage());
  }

  @Test
  void testGeneralExceptionWhenDownloadFile() throws Exception {
    // Act
    when(fileRepository.findById(anyString())).thenReturn(Optional.empty());
    Exception exception =
        assertThrows(
            Exception.class,
            () -> {
              fileServiceImpl.downloadFile("file");
            });
    // Assert
    System.out.println("exception " + exception.getMessage());
    // Assert
    assertEquals(SERVICE_DOWN_ERROR, exception.getMessage());
  }

  @Test
  void testGeneralExceptionWhenDeleteFile() {
    // Arrange
    when(fileRepository.findById(anyString())).thenReturn(Optional.empty());
    // Act
    Exception exception =
        assertThrows(
            Exception.class,
            () -> {
              fileServiceImpl.deleteFile("file");
            });
    System.out.println("exception " + exception.getMessage());
    // Assert
    assertEquals(SERVICE_DOWN_ERROR, exception.getMessage());
  }

  @Test
  void testGCSFileAccessExceptionWhenDeleteFile() throws Exception {
    // Arrange
    Map<String, Object> loggedInUserOrganization = new HashMap<>();
    loggedInUserOrganization.put("id", "123");
    UserContext.setLoggedInUserOrganization(loggedInUserOrganization);
    File file = new File();
    file.setOrganizationId("123");
    file.setCreatedBy("test-employee@gmail.com");
    file.setId("id");
    file.setEntityId("id");
    file.setEntityType("type");
    file.setFileType("fieldType");
    UserContext.setLoggedInUserEmail("test-employee@gmail.com");
    when(fileRepository.findById(anyString())).thenReturn(Optional.of(file));
    GCSProperties.Bucket bucket = new GCSProperties.Bucket();
    bucket.setName("Test");
    gcsProperties.setBucket(bucket);
    Blob mockBlob = mock(Blob.class);
    when(storage.get(anyString(), anyString())).thenReturn(mockBlob);
    // Act
    doThrow(new GCSFileAccessException(GCS_FILE_DELETE_ERROR)).when(mockBlob).delete();
    Exception exception =
        assertThrows(
            Exception.class,
            () -> {
              fileServiceImpl.deleteFile("file");
            });
    // Assert
    assertEquals(SERVICE_DOWN_ERROR, exception.getMessage());
  }

  @Test
  void testMongoFileUploadExceptionWhenDeleteFile() throws Exception {
    // Arrange
    Map<String, Object> loggedInUserOrganization = new HashMap<>();
    loggedInUserOrganization.put("id", "123");
    UserContext.setLoggedInUserOrganization(loggedInUserOrganization);
    File file = new File();
    file.setOrganizationId("123");
    file.setCreatedBy("test-employee@gmail.com");
    file.setId("id");
    file.setEntityId("id");
    file.setEntityType("type");
    file.setFileType("fieldType");
    UserContext.setLoggedInUserEmail("test-employee@gmail.com");
    when(fileRepository.findById(anyString())).thenReturn(Optional.of(file));
    GCSProperties.Bucket bucket = new GCSProperties.Bucket();
    bucket.setName("Test");
    gcsProperties.setBucket(bucket);
    Blob mockBlob = mock(Blob.class);
    when(storage.get(anyString(), anyString())).thenReturn(mockBlob);
    // Act
    doThrow(new MongoFileUploadException(MONGO_FILE_DELETE_ERROR))
        .when(fileRepository)
        .delete(any());
    Exception exception =
        assertThrows(
            Exception.class,
            () -> {
              fileServiceImpl.deleteFile("file");
            });
    // Assert
    assertEquals(SERVICE_DOWN_ERROR, exception.getMessage());
  }

  @Test
  void testReturnWhenDeleteFile() throws Exception {
    // Arrange
    Map<String, Object> loggedInUserOrganization = new HashMap<>();
    loggedInUserOrganization.put("id", "123");
    UserContext.setLoggedInUserOrganization(loggedInUserOrganization);
    File file = new File();
    file.setOrganizationId("123");
    file.setCreatedBy("test-employee@gmail.com");
    file.setId("id");
    file.setEntityId("id");
    file.setEntityType("type");
    file.setFileType("fieldType");
    UserContext.setLoggedInUserEmail("test-employee@gmail.com");
    when(fileRepository.findById(anyString())).thenReturn(Optional.of(file));
    GCSProperties.Bucket bucket = new GCSProperties.Bucket();
    bucket.setName("Test");
    gcsProperties.setBucket(bucket);
    Blob mockBlob = mock(Blob.class);
    // Act
    when(storage.get(anyString(), anyString())).thenReturn(mockBlob);
    File result = fileServiceImpl.deleteFile("file");
    // Assert
    assertEquals(file, result);
  }

  @Test
  void testUnAuthorisedExceptionWhenDeleteFile() throws Exception {
    // Arrange
    Map<String, Object> loggedInUserOrganization = new HashMap<>();
    loggedInUserOrganization.put("id", "123");
    UserContext.setLoggedInUserOrganization(loggedInUserOrganization);
    Set<String> stringSet = new HashSet<>();
    UserContext.setLoggedInUserPermissions(stringSet);
    File file = new File();
    file.setOrganizationId("123");
    file.setCreatedBy("test-employee@gmail.com");
    UserContext.setLoggedInUserEmail("test-employee2@gmail.com");
    // Act
    when(fileRepository.findById(anyString())).thenReturn(Optional.of(file));
    Exception exception =
        assertThrows(
            Exception.class,
            () -> {
              fileServiceImpl.deleteFile("file");
            });
    // Assert
    assertEquals(UNAUTHORISED_ACCESS_ERROR, exception.getMessage());
  }
}
