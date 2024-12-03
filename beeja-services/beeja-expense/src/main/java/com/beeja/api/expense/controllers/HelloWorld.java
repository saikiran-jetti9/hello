package com.beeja.api.expense.controllers;

import com.beeja.api.expense.annotations.HasPermission;
import com.beeja.api.expense.utils.UserContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1")
public class HelloWorld {
  @GetMapping("/helloworld")
  @HasPermission({"READ_EMPLOYEE"})
  public String helloWorld() {
    return "Hello World - Expense: " + UserContext.getLoggedInEmployeeId();
  }
}
