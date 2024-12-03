package com.beeja.api.employeemanagement.service;

import com.beeja.api.employeemanagement.requests.EmployeeUpdateRequest;
import com.beeja.api.employeemanagement.response.GetLimitedEmployee;
import com.beeja.api.employeemanagement.model.Employee;
import com.beeja.api.employeemanagement.requests.UpdateKYCRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface EmployeeService {
  Employee createEmployee(Map<String, Object> employee) throws Exception;

  Map<String, Object> getEmployeeByEmployeeId(String employeeId) throws Exception;

  Employee updateEmployee(String id, EmployeeUpdateRequest updatedEmployee) throws Exception;

  List<Map<String, Object>> getCombinedLimitedDataOfEmployees(
      String department,
      String designation,
      String employmentType,
      int pageNumber,
      int pageSize,
      String status)
      throws Exception;

  List<GetLimitedEmployee> getLimitedDataOfEmployees(
      String department,
      String designation,
      String employmentType,
      int pageNumber,
      int pageSize,
      String status);

  void deleteAllEmployeesByOrganizationId(String organizationId) throws Exception;

  Employee updateKYCRequest(String id, UpdateKYCRequest updateKYCRequest) throws Exception;

  Employee uploadOrUpdateProfilePic(MultipartFile file, String employeeId) throws Exception;
}
