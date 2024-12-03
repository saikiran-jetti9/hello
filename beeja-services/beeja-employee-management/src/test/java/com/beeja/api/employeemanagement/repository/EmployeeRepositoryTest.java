package com.beeja.api.employeemanagement.repository;

import static org.junit.jupiter.api.Assertions.*;

import com.beeja.api.employeemanagement.model.Employee;
import com.beeja.api.employeemanagement.response.GetLimitedEmployee;

import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;

@DataMongoTest
class EmployeeRepositoryTest {
  @Autowired EmployeeRepository employeeRepository;
  @Mock
  Employee employee;

  @BeforeEach
  void setUp() {
    employee = new Employee();
    employee.setEmployeeId("12345");
    employee.setOrganizationId("random_organization");
    employeeRepository.save(employee);
  }

  @AfterEach
  void tearDown() {
    employeeRepository.deleteById(employee.getId());
  }

  @Test
  void findByEmployeeId() {
    Employee employee1 = employeeRepository.findByEmployeeId(employee.getEmployeeId());
    assertNotNull(employee1);
    assertEquals("12345", employee1.getEmployeeId());
  }

  @Test
  void getAllEmployeesLimitedDataByOrganizationId() {
    List<GetLimitedEmployee> employees =
        employeeRepository.getAllEmployeesLimitedDataByOrganizationId("random_organization");
    assertNotNull(employees);
    assertEquals("12345", employees.get(0).getEmployeeId());
    assertEquals(1, employees.size());
  }

  @Test
  void deleteByOrganizationId() {
    employeeRepository.deleteByOrganizationId("random_organization");
    Employee deletedEmployee = employeeRepository.findByEmployeeId(employee.getEmployeeId());
    assertNull(deletedEmployee, "Employee should be deleted");
  }

  @Test
  void findByNonexistentEmployeeId() {
    Employee nonExistentEmployee = employeeRepository.findByEmployeeId("nonexistent_id");
    assertNull(nonExistentEmployee, "Should not find an employee with a nonexistent ID");
  }

  @Test
  void getAllEmployeesLimitedDataByNonexistentOrganizationId() {
    List<GetLimitedEmployee> employees =
        employeeRepository.getAllEmployeesLimitedDataByOrganizationId("nonexistent_organization");
    assertNotNull(employees);
    assertTrue(employees.isEmpty(), "Should not find employees for a nonexistent organization");
  }
}
