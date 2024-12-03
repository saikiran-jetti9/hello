package com.beeja.api.employeemanagement.serviceImpl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.beeja.api.employeemanagement.client.AccountClient;
import com.beeja.api.employeemanagement.constants.PermissionConstants;
import com.beeja.api.employeemanagement.model.clients.accounts.OrganizationDTO;
import com.beeja.api.employeemanagement.repository.EmployeeRepository;
import com.beeja.api.employeemanagement.requests.EmployeeOrgRequest;
import com.beeja.api.employeemanagement.requests.EmployeeUpdateRequest;
import com.beeja.api.employeemanagement.response.GetLimitedEmployee;
import com.beeja.api.employeemanagement.service.EmployeeService;
import com.beeja.api.employeemanagement.utils.UserContext;
import com.beeja.api.employeemanagement.model.*;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

import com.beeja.api.employeemanagement.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;


@SpringBootTest
@ActiveProfiles("local")
public class EmployeeServiceImplTest {

  @InjectMocks private EmployeeServiceImpl employeeServiceImpl;
  @Mock private EmployeeRepository employeeRepository;

  @Mock
  AccountClient accountClient;
  @Mock MongoTemplate mongoTemplate;
  @Mock
  EmployeeService employeeService;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this); // Initialize the mocks
  }

  public Employee createEmployee() {
    Employee employee = new Employee();
    employee.setId("testId");
    employee.setEmployeeId("testEmployeeId");
    employee.setBeejaAccountId("testBeejaId");
    employee.setPosition("position");
    return employee;
  }

  public void createUserContext() {
    OrganizationDTO loggedInUserOrganization = new OrganizationDTO();
    loggedInUserOrganization.setId("testId");
    UserContext.setLoggedInUserOrganization(loggedInUserOrganization);
    Set<String> loggedInUserPermissions = new HashSet<>();
    loggedInUserPermissions.add(PermissionConstants.CREATE_EMPLOYEE);
    loggedInUserPermissions.add(PermissionConstants.UPDATE_ALL_EMPLOYEES);
    UserContext.setLoggedInUserPermissions(loggedInUserPermissions);
    UserContext.setLoggedInEmployeeId("existingId");
  }

  public EmployeeUpdateRequest createEmployeeUpdateRequest() {
    EmployeeUpdateRequest updateEmployee = new EmployeeUpdateRequest();
    updateEmployee.setEmail("test-accounts@test.com");

    Address address = new Address();
    address.setHouseNumber("house No.");
    address.setLandMark("landMark");
    address.setVillage("village");
    address.setCity("city");
    address.setCountry("country");
    address.setState("state");
    address.setPinCode("pincode");
    updateEmployee.setAddress(address);

    PersonalInformation personalInfo = new PersonalInformation();
    personalInfo.setNationality("Country");
    SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
    try {
      Date dateOfBirth = formatter.parse("2000-01-01");
      personalInfo.setDateOfBirth(dateOfBirth);
    } catch (ParseException e) {
      e.printStackTrace();
    }
    personalInfo.setGender("Gender");
    personalInfo.setMaritalStatus("Status");
    updateEmployee.setPersonalInformation(personalInfo);

    JobDetails jobDetails = new JobDetails();
    jobDetails.setDesignation("Developer");
    jobDetails.setEmployementType("Full-time");
    jobDetails.setDepartment("IT");
    jobDetails.setJoiningDate(new Date());
    jobDetails.setResignationDate(new Date());
    updateEmployee.setJobDetails(jobDetails);

    Contact contact = new Contact();
    contact.setAlternativeEmail("test@example.com");
    contact.setPhone("123-456-7890");
    contact.setAlternativePhone("987-654-3210");
    updateEmployee.setContact(contact);

    PFDetails pfDetails = new PFDetails();
    pfDetails.setPFNumber("PF12345");
    pfDetails.setUAN("UAN6789");
    pfDetails.setJoiningData("2023-01-01");
    pfDetails.setAccountNumber("1234567890");
    pfDetails.setState("YourState");
    pfDetails.setLocation("YourLocation");
    updateEmployee.setPfDetails(pfDetails);

    return updateEmployee;
  }

  private Map<String, Object> convertEmployeeToMap(Employee employee) {
    Map<String, Object> employeeMap = new HashMap<>();
    employeeMap.put("id", employee.getId());
    employeeMap.put("employeeId", employee.getEmployeeId());
    employeeMap.put("beejaAccountId", employee.getBeejaAccountId());
    employeeMap.put("position", employee.getPosition());
    return employeeMap;
  }

  @Test
  void testCreateEmployee() throws Exception {
    Employee employee = createEmployee();
    when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

    Employee result = employeeServiceImpl.createEmployee(convertEmployeeToMap(employee));

    assertNotNull(result);
    assertEquals(result.getId(), employee.getId());
  }


  @Test
  public void testGetEmployeeByEmployeeId() throws Exception {
    Employee mockEmployee = new Employee();
    mockEmployee.setId("1");

    OrganizationDTO organizationDTO = new OrganizationDTO();
    organizationDTO.setId("orgId");

    Set<String> mockPermissions = Set.of(PermissionConstants.READ_COMPLETE_EMPLOYEE_DETAILS);

    UserContext.setLoggedInUser(
            "test@example.com",
            "Test User",
            "1",
            organizationDTO,
            mockPermissions,
            null,
            "mockAccessToken"
    );

    when(employeeRepository.findByEmployeeIdAndOrganizationId("1", "orgId")).thenReturn(mockEmployee);

    Map<String, Object> mockAccountData = new HashMap<>();
    mockAccountData.put("accountId", "accountId123");

    ResponseEntity mockAccountResponse = ResponseEntity.ok(mockAccountData);

    when(accountClient.getUserByEmployeeId("1")).thenReturn(mockAccountResponse);

    Map<String, Object> result = employeeServiceImpl.getEmployeeByEmployeeId("1");

    assertNotNull(result);
    assertEquals("1", ((Employee) result.get("employee")).getId());
    assertNotNull(result.get("account"));
    assertEquals("accountId123", ((Map<String, Object>) result.get("account")).get("accountId"));
  }

  @Test
  void testEmployeeNotFoundExceptionWhenUpdateEmployee() {

    EmployeeUpdateRequest updateEmployee = createEmployeeUpdateRequest();
    when(accountClient.isUserPresentWithMail(updateEmployee.getEmail())).thenReturn(true);

    Exception exception = assertThrows(
            Exception.class,
            () -> employeeServiceImpl.updateEmployee("id", updateEmployee)
    );

    assertEquals("RESOURCE_EXISTS_ERROR,RESOURCE_CREATING_ERROR,Email is already registered", exception.getMessage());
  }


  @Test
  void testUpdateEmployeeWhenUserHasPermissionOfCreateEmployee() throws Exception {
    createUserContext();
    EmployeeUpdateRequest updateEmployee = createEmployeeUpdateRequest();

    Employee existingEmployee = createEmployee();
    when(employeeRepository.findByEmployeeIdAndOrganizationId("id", UserContext.getLoggedInUserOrganization().getId()))
            .thenReturn(existingEmployee);

    ResponseEntity<Map<String, Object>> accountsResponse = mock(ResponseEntity.class);
    Map<String, Object> accountDetails = new HashMap<>();
    accountDetails.put("organizations", Collections.singletonMap("id", "testId"));

    when(accountsResponse.getStatusCode()).thenReturn(HttpStatus.OK);
    when(accountsResponse.getBody()).thenReturn(accountDetails);
    doReturn(accountsResponse).when(accountClient).getUserByEmployeeId(any(String.class));

    when(employeeRepository.save(any())).thenReturn(existingEmployee);

    Employee result = employeeServiceImpl.updateEmployee("id", updateEmployee);

    assertEquals(existingEmployee, result);
  }

  @Test
  void testGetLimitedDataOfEmployees() {
    createUserContext();
    GetLimitedEmployee limitedEmployee = new GetLimitedEmployee();
    limitedEmployee.setEmployeeId("id");
    List<GetLimitedEmployee> limitedEmployeeList = new ArrayList<>();
    limitedEmployeeList.add(limitedEmployee);

    // Create a mock AggregationResults
    AggregationResults<GetLimitedEmployee> mockResults = mock(AggregationResults.class);
    when(mockResults.getMappedResults()).thenReturn(limitedEmployeeList);

    // Mock the aggregate method of mongoTemplate to return the mockResults
    when(mongoTemplate.aggregate(any(Aggregation.class), eq("employees"), eq(GetLimitedEmployee.class)))
            .thenReturn(mockResults);

    // Define default input parameters for the service method
    String department = "HR";
    String designation = "Manager";
    String employmentType = "Full-time";
    String status = "active";
    int pageNumber = 1; // assuming valid page number
    int pageSize = 10; // assuming valid page size

    // Act - Call the method under test
    List<GetLimitedEmployee> result = employeeServiceImpl.getLimitedDataOfEmployees(
            department, designation, employmentType, pageNumber, pageSize, status);

    // Assert - Validate the results
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(limitedEmployee, result.get(0));
  }

  @Test
  void testExceptionWhenDeleteAllEmployeesByOrganizationId() {

    doThrow(new RuntimeException("API_ERROR,SERVER_ERROR,Something went wrong!"))
            .when(employeeRepository)
            .deleteByOrganizationId(anyString());

    Exception exception =
            assertThrows(
                    Exception.class, () -> employeeServiceImpl.deleteAllEmployeesByOrganizationId("id"));

    assertEquals("API_ERROR,SERVER_ERROR,Something went wrong!", exception.getMessage());
  }

  @Test
  void testDeleteAllEmployeesByOrganizationIdSuccessfulDeletionMessage() throws Exception {
    // Arrange
    doNothing().when(employeeRepository).deleteByOrganizationId(anyString());
    // Act
    employeeServiceImpl.deleteAllEmployeesByOrganizationId(anyString());
    // Assert
    verify(employeeRepository, times(1)).deleteByOrganizationId(anyString());
  }

  @Test
  public void testGetCombinedLimitedDataOfEmployees() throws Exception {
    createUserContext();

    // Arrange
    String department = "IT";
    String designation = "Developer";
    String employmentType = "Full-time";
    int pageNumber = 1;
    int pageSize = 10;
    String status = "active";

    GetLimitedEmployee employee1 = new GetLimitedEmployee();
    employee1.setEmployeeId("1");
    GetLimitedEmployee employee2 = new GetLimitedEmployee();
    employee2.setEmployeeId("2");

    List<GetLimitedEmployee> employeesWithLimitedData = Arrays.asList(employee1, employee2);


    // Create a mock AggregationResults
    AggregationResults<GetLimitedEmployee> mockResults = mock(AggregationResults.class);
    when(mockResults.getMappedResults()).thenReturn(employeesWithLimitedData);

    // Mock the aggregate method of mongoTemplate to return the mockResults
    when(mongoTemplate.aggregate(any(Aggregation.class), eq("employees"), eq(GetLimitedEmployee.class)))
            .thenReturn(mockResults);

    when(employeeService.getLimitedDataOfEmployees(department, designation, employmentType, pageNumber, pageSize, status))
            .thenReturn(employeesWithLimitedData);

    List<String> employeeIds = employeesWithLimitedData.stream()
            .map(GetLimitedEmployee::getEmployeeId)
            .collect(Collectors.toList());

    List<Map<String, Object>> accountDataList = new ArrayList<>();
    Map<String, Object> accountData = new HashMap<>();
    accountData.put("employeeId", "1");
    accountData.put("active", true);
    accountDataList.add(accountData);

    ResponseEntity<?> accountResponse = new ResponseEntity<>(accountDataList, HttpStatus.OK);

    when(accountClient.getUsersByEmployeeIds(new EmployeeOrgRequest(employeeIds))).thenReturn((ResponseEntity<Object>) accountResponse);


    // Act
    List<Map<String, Object>> result = employeeServiceImpl.getCombinedLimitedDataOfEmployees(department, designation, employmentType, pageNumber, pageSize, status);

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(1, result.size());
    assertEquals(employeesWithLimitedData.get(0), result.get(0).get("employee"));
    assertEquals(accountData, result.get(0).get("account"));
  }
}
