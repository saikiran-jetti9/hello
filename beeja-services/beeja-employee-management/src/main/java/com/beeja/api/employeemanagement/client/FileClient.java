package com.beeja.api.employeemanagement.client;

import com.beeja.api.employeemanagement.requests.FileUploadRequest;
import com.beeja.api.employeemanagement.response.FileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@FeignClient(value = "file-service", url = "${client-urls.fileService}")
public interface FileClient {

  @PostMapping(value = "/v1/files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  ResponseEntity<?> uploadFile(FileUploadRequest fileRequest);

  @DeleteMapping("/v1/files/{fileId}")
  ResponseEntity<?> deleteFile(@PathVariable String fileId) throws Exception;

  @GetMapping("/v1/files/download/{fileId}")
  ResponseEntity<byte[]> downloadFile(@PathVariable String fileId);

  @GetMapping("/v1/files/{entityId}")
  ResponseEntity<FileResponse> getAllFilesByEntityId(
      @PathVariable String entityId, @RequestParam int page, @RequestParam int size);

  @PutMapping(value = "/v1/files/{fileId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  ResponseEntity<?> updateFile(@PathVariable String fileId, FileUploadRequest fileUploadRequest);

  @GetMapping("v1/files/find/{fileId}")
  ResponseEntity<?> getFileById(@PathVariable String fileId);

  @PostMapping(value = "/v1/files/dynamic", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  ResponseEntity<?> uploadOrUpdateFile(FileUploadRequest fileInput);
}
