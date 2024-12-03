package com.beeja.api.employeemanagement.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.beeja.api.employeemanagement.client.AccountClient;
import com.beeja.api.employeemanagement.config.filters.AuthUrlProperties;
import com.beeja.api.employeemanagement.config.filters.JwtProperties;
import com.beeja.api.employeemanagement.model.Employee;
import com.beeja.api.employeemanagement.model.JobDetails;
import com.beeja.api.employeemanagement.requests.EmployeeUpdateRequest;
import com.beeja.api.employeemanagement.service.EmployeeService;
import com.beeja.api.employeemanagement.utils.UserContext;
import jakarta.servlet.http.HttpServletRequest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@WebMvcTest(EmployeeController.class)
class EmployeeControllerTest {

  @MockBean AuthUrlProperties authUrlProperties;

  @MockBean
  JwtProperties jwtProperties;

  @InjectMocks EmployeeController employeeController;

  @MockBean EmployeeService employeeService;

  @MockBean AccountClient accountClient;

  @MockBean UserContext userContext;

  @Autowired MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  Employee employee;

  @BeforeEach
  void setUp() {
    employee = new Employee();
    employee.setEmployeeId("12345");
    employee.setOrganizationId("tac");
    employee.setPosition("swe");

    MockitoAnnotations.openMocks(this);
    mockMvc = MockMvcBuilders.standaloneSetup(employeeController).build();
  }

  @AfterEach
  void tearDown() {}

  @Test
  void testGetAllEmployees() throws Exception {
    // Mocking the expected response
    List<Map<String, Object>> expectedResponse = new ArrayList<>();
    when(employeeService.getCombinedLimitedDataOfEmployees(
            anyString(), anyString(), anyString(), anyInt(), anyInt(), anyString()))
            .thenReturn(expectedResponse);

    // Performing the test with request parameters
    mockMvc.perform(MockMvcRequestBuilders.get("/v1/users")
                    .param("department", "HR")
                    .param("designation", "Manager")
                    .param("employmentType", "Full-time")
                    .param("status", "active")
                    .param("pageNumber", "1")
                    .param("pageSize", "10")
                    .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());

    // Optionally assert using the controller method directly
    ResponseEntity<List<Map<String, Object>>> response = employeeController.getAllEmployees(
            "HR", "Manager", "Full-time", "active", 1, 10);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertNotNull(response.getBody());
  }


  @Test
  void testCreateEmployee() throws Exception {
    Map<String, Object> user = new HashMap<>();
    user.put("id", "1");
    user.put("employeeId", "12345");
    Employee employee1 = new Employee();
    employee1.setBeejaAccountId(((String) user.get("id")));
    employee1.setEmployeeId(((String) user.get("employeeId")));

    when(employeeService.createEmployee(user)).thenReturn(employee1);

    String userJson = objectMapper.writeValueAsString(user);

    mockMvc.perform(
                    MockMvcRequestBuilders.post("/v1/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(userJson))
            .andExpect(status().isCreated());
  }

  @Test
  void testUpdateEmployee() throws Exception {
    String employeeId = "12345";
    EmployeeUpdateRequest employeeUpdateRequest = new EmployeeUpdateRequest();
    employeeUpdateRequest.setEmployeeId("12345");
    employeeUpdateRequest.setPosition("developer");
    Employee employee1 = new Employee();
    employee1.setEmployeeId("12345");
    employee1.setPosition("developer");

    when(employeeService.updateEmployee(employeeId, employeeUpdateRequest)).thenReturn(employee1);

    String employeeUpdateJson = objectMapper.writeValueAsString(employeeUpdateRequest);

    mockMvc.perform(
                    MockMvcRequestBuilders.put("/v1/users/{employeeId}", employeeId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(employeeUpdateJson))
            .andExpect(status().isOk());
  }

  @Test
  public void testGetEmployeeByEmployeeId() throws Exception {
    String employeeId = "123";

    // Create an Employee instance
    Employee emp = new Employee();
    emp.setPosition("manager");
    emp.setJobDetails(new JobDetails());

    // Convert the Employee instance to a Map<String, Object>
    Map<String, Object> employeeData = new HashMap<>();
    employeeData.put("position", emp.getPosition());
    employeeData.put("jobDetails", emp.getJobDetails());

    // Prepare a mock response from the employeeService
    when(employeeService.getEmployeeByEmployeeId(anyString())).thenReturn(employeeData);

    // Perform the request and verify the response
    mockMvc.perform(
                    MockMvcRequestBuilders.get("/v1/users/{employeeId}", employeeId)
                            .contentType(MediaType.APPLICATION_JSON)
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.position").value("manager"))  // Adjust based on expected JSON structure
            .andExpect(jsonPath("$.jobDetails").exists()); // Verify that jobDetails exists
  }


  @Test
  void testDeleteAllEmployeesByOrganizationId() throws Exception {
    String organizationId = "tac";
    HttpServletRequest httpServletRequest = mock(HttpServletRequest.class);

    // Test the controller directly
    assertEquals(
            employeeController
                    .deleteAllEmployeesByOrganizationId(organizationId, httpServletRequest)
                    .getStatusCode(),
            HttpStatus.NO_CONTENT
    );

    // Test with MockMvc to simulate the HTTP DELETE call
    mockMvc.perform(
                    MockMvcRequestBuilders.delete("/v1/users/organizations/{organizationId}", "tac")
                            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());  // Expect 204 NO_CONTENT
  }

}
