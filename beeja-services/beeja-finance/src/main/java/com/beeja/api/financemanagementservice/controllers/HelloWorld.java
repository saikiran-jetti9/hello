package com.beeja.api.financemanagementservice.controllers;

import com.beeja.api.financemanagementservice.Utils.UserContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1")
public class HelloWorld {
  @GetMapping("/helloworld")
  public String helloWorld() {
    return "Hello, Welcome to Beeja Finance Service! \n Logged in as: "
        + UserContext.getLoggedInUserName();
  }
}
