package com.beeja.api.financemanagementservice.serviceImpl;

import static com.beeja.api.financemanagementservice.Utils.Constants.*;
import static com.ctc.wstx.shaded.msv_core.datatype.xsd.NumberType.save;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

import com.beeja.api.financemanagementservice.Utils.Constants;
import com.beeja.api.financemanagementservice.Utils.UserContext;
import com.beeja.api.financemanagementservice.enums.Availability;
import com.beeja.api.financemanagementservice.enums.Devices;
import com.beeja.api.financemanagementservice.exceptions.DuplicateProductIdException;
import com.beeja.api.financemanagementservice.exceptions.ResourceNotFoundException;
import com.beeja.api.financemanagementservice.modals.DeviceSequence;
import com.beeja.api.financemanagementservice.modals.Inventory;
import com.beeja.api.financemanagementservice.repository.InventoryRepository;
import com.beeja.api.financemanagementservice.requests.DeviceDetails;
import java.util.*;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.function.Executable;
import org.mockito.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@SpringBootTest
@ActiveProfiles("local")
public class InventoryServiceImplTest {

  @InjectMocks
  InventoryServiceImpl inventoryService;

  @Mock
  InventoryRepository inventoryRepository;

  @Mock
  private MongoTemplate mongoTemplate;

  private MockMvc mockMvc;

  @BeforeEach
  public void setUp() {
    MockitoAnnotations.openMocks(this);
    mockMvc = MockMvcBuilders.standaloneSetup(inventoryService).build();
    Map<String, Object> organizationMap = Collections.singletonMap("id", "tac");
    UserContext.setLoggedInUserOrganization(organizationMap);
  }

  @Test
  public void testAddDevice_Success() throws Exception {
    DeviceDetails deviceDetails = new DeviceDetails();
    when(inventoryRepository.findByProductId(deviceDetails.getProductId())).thenReturn(Optional.empty());
    Inventory savedInventory = new Inventory();
    savedInventory.setProductId(deviceDetails.getProductId());
    when(inventoryRepository.save(any(Inventory.class))).thenReturn(savedInventory);
    Inventory result = inventoryService.addDevice(deviceDetails);
    assertNotNull(result);
    assertEquals(deviceDetails.getProductId(), result.getProductId());
    verify(inventoryRepository, times(1)).save(any(Inventory.class));
  }

  @Test
  public void testFilterInventory_Success() throws Exception {
    Inventory inventory = new Inventory();
    inventory.setDevice(Devices.MOBILE);
    inventory.setProvider("Google");
    inventory.setAvailability(Availability.NO);
    inventory.setOs("NA");
    List<Inventory> expectedInventories = new ArrayList<>();
    expectedInventories.add(inventory);

    Query query = new Query();
    query.addCriteria(Criteria.where("device").regex("Mobile", "i"));
    query.addCriteria(Criteria.where("provider").regex("Google", "i"));
    query.addCriteria(Criteria.where("availability").is("NO"));
    query.addCriteria(Criteria.where("os").regex("NA", "i"));
    query.skip(0).limit(10);

    when(mongoTemplate.find(any(Query.class), eq(Inventory.class)))
            .thenReturn(expectedInventories);
    List<Inventory> result = inventoryService.filterInventory(1, 10, "Mobile", "Google", "NO", "NA");
    verify(mongoTemplate).find(any(Query.class), eq(Inventory.class));
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(expectedInventories.get(0), result.get(0));
  }

  @Test
  public void testUpdateDeviceDetails_Success() throws Exception {
    String deviceId = "TAC-0001";
    String uniqueProductId = "unique-product-id";
    DeviceDetails updatedDeviceDetails = new DeviceDetails();
    updatedDeviceDetails.setProductId(uniqueProductId);
    Inventory existingInventory = new Inventory();
    existingInventory.setId(deviceId);
    existingInventory.setProductId("old-product-id");
    when(inventoryRepository.findByProductId(uniqueProductId)).thenReturn(Optional.empty());
    when(inventoryRepository.findByIdAndOrganizationId(eq(deviceId), anyString())).thenReturn(Optional.of(existingInventory));
    when(inventoryRepository.save(any(Inventory.class))).thenReturn(existingInventory);
    Inventory result = inventoryService.updateDeviceDetails(updatedDeviceDetails, deviceId);
    assertNotNull(result);
    assertEquals(uniqueProductId, result.getProductId());
    verify(inventoryRepository, times(1)).findByProductId(uniqueProductId);
    verify(inventoryRepository, times(1)).findByIdAndOrganizationId(eq(deviceId), anyString());
    verify(inventoryRepository, times(1)).save(any(Inventory.class)); // Verify save operation
  }

  @Test
  public void testDeleteExistingDeviceDetails_Success() throws Exception {
    String deviceId = "TAC-0001";
    String organizationId = "org-id";
    Inventory inventory = new Inventory();
    Map<String, Object> mockOrganization = Map.of("id", organizationId);
    mockStatic(UserContext.class);
    when(UserContext.getLoggedInUserOrganization()).thenReturn(mockOrganization);
    when(inventoryRepository.findByIdAndOrganizationId(deviceId, organizationId)).thenReturn(Optional.of(inventory));
    ResponseEntity<Inventory> response = inventoryService.deleteExistingDeviceDetails(deviceId);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(inventory, response.getBody());
    verify(inventoryRepository, times(1)).delete(inventory);  // Verify delete operation
  }


  @Test
  public void testGetAllDevicesByOrganizationId() {
    // Arrange
    String organizationId = "tac";
    List<Inventory> expectedDevices = Arrays.asList(new Inventory(), new Inventory());
    when(inventoryRepository.findByOrganizationId(organizationId)).thenReturn(expectedDevices);

    // Act
    List<Inventory> actualDevices = inventoryService.getAllDevicesByOrganizationId(organizationId);

    // Assert
    assertEquals(expectedDevices, actualDevices);
    verify(inventoryRepository, times(1)).findByOrganizationId(organizationId);
  }
}
