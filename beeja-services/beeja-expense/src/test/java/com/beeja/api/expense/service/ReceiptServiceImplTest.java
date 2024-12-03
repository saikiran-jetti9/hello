package com.beeja.api.expense.service;
import com.beeja.api.expense.client.FileClient;
import com.beeja.api.expense.exceptions.FeignClientException;
import com.beeja.api.expense.response.FileResponse;
import com.beeja.api.expense.serviceImpl.ReceiptServiceImpl;
import com.beeja.api.expense.utils.Constants;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.LinkedHashMap;
import static com.mongodb.assertions.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;

class ReceiptServiceImplTest {

    @Mock
    private FileClient fileClient;

    @InjectMocks
    private ReceiptServiceImpl receiptService;

    private String fileId;
    private FileResponse fileResponse;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        fileId = "12345";
        fileResponse = new FileResponse();
        fileResponse.setEntityType("expense");
    }

    @Test
    void testGetFileById_Success() {
        String fileId = "sampleFileId";
        LinkedHashMap<String, Object> responseBody = new LinkedHashMap<>();
        responseBody.put("entityType", "expense");
        ResponseEntity<?> mockResponse = new ResponseEntity<>(responseBody, HttpStatus.OK);
        doReturn(mockResponse).when(fileClient).getFileById(fileId);
        ResponseEntity<?> response = fileClient.getFileById(fileId);
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseBody, response.getBody());
        verify(fileClient, times(1)).getFileById(fileId);
    }

    @Test
    void testDownloadFile_UnauthorisedAccess() throws Exception {
        LinkedHashMap<String, Object> body = new LinkedHashMap<>();
        body.put("entityType", "otherEntity");
        ResponseEntity<?> mockGetFileResponse = new ResponseEntity<>(body, HttpStatus.OK);
        doReturn(mockGetFileResponse).when(fileClient).getFileById(fileId);
        FeignClientException exception = assertThrows(FeignClientException.class, () -> {
            receiptService.downloadFile(fileId);
        });
        assertEquals(Constants.UNAUTHORISED_ACCESS, exception.getMessage());
        verify(fileClient, times(1)).getFileById(fileId);
        verify(fileClient, never()).downloadFile(fileId);
    }

    @Test
    void testDownloadFile_FeignClientException() throws Exception {
        when(fileClient.getFileById(fileId)).thenThrow(new RuntimeException("Feign client error"));
        FeignClientException exception = assertThrows(FeignClientException.class, () -> {
            receiptService.downloadFile(fileId);
        });
        assertEquals("Feign client error", exception.getMessage());
        verify(fileClient, times(1)).getFileById(fileId);
        verify(fileClient, never()).downloadFile(fileId);
    }
}
