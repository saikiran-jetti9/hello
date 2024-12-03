package com.beeja.api.employeemanagement.client;

import com.beeja.api.employeemanagement.requests.EmployeeUpdateRequest;
import com.beeja.api.employeemanagement.requests.EmployeeOrgRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@FeignClient(value = "account-service", url = "${client-urls.accountsService}")
public interface AccountClient {

  @RequestMapping(value = "/v1/users", method = RequestMethod.GET)
  @ResponseBody
  ResponseEntity<Object> getAllUsers();

  @GetMapping("v1/users/email/{email}")
  ResponseEntity<?> getEmployeeByEmail(@PathVariable String email);

  @GetMapping("v1/users/{employeeId}")
  ResponseEntity<?> getUserByEmployeeId(@PathVariable String employeeId);

  @PutMapping("v1/users/{employeeId}")
  ResponseEntity<?> updateUser(
      @PathVariable String employeeId, @RequestBody EmployeeUpdateRequest updatedUser);

  @GetMapping("v1/users/ispresent/{email}")
  Boolean isUserPresentWithMail(@PathVariable String email);

  @RequestMapping(value = "/v1/users/emp-ids", method = RequestMethod.POST)
  @ResponseBody
  ResponseEntity<Object> getUsersByEmployeeIds(@RequestBody EmployeeOrgRequest employeeOrgRequest);
}
