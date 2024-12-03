package com.beeja.api.employeemanagement.repository;

import com.beeja.api.employeemanagement.model.Employee;
import com.beeja.api.employeemanagement.response.GetLimitedEmployee;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

@JaversSpringDataAuditable
public interface EmployeeRepository extends MongoRepository<Employee, String> {
  Employee findByEmployeeId(String employeeId);

  @Query(value = "{}", fields = "{ 'jobDetails': 1, 'employeeId': 1 }")
  List<GetLimitedEmployee> getAllEmployeesLimitedData();

  @Query(value = "{ 'organizationId': ?0 }", fields = "{ 'jobDetails': 1, 'employeeId': 1 }")
  List<GetLimitedEmployee> getAllEmployeesLimitedDataByOrganizationId(String organizationId);

  Employee findByEmployeeIdAndOrganizationId(String employeeId, String organizationId);

  @Query(
      value = "{ 'employeeId': ?0, 'organizationId': ?1 }",
      fields =
          "{ 'employeeId': 1, 'organizationId': 1, 'address': 1, 'personalInformation': 1, 'contact': 1 }")
  Employee getLimitedDataFindByEmployeeId(String employeeId, String organizationId);

  void deleteByOrganizationId(String organizationId);
}
