package com.beeja.api.employeemanagement.requests;

import com.beeja.api.employeemanagement.model.*;
import com.beeja.api.employeemanagement.model.Address;
import lombok.Data;

@Data
public class EmployeeUpdateRequest {
  private String id;
  private String beejaAccountId;
  private String firstName;
  private String lastName;
  private String email;
  private String employeeId;
  private Address address;
  private PersonalInformation personalInformation;
  private JobDetails jobDetails;
  private Contact contact;
  private String department;
  private String position;
  private PFDetails pfDetails;
}
