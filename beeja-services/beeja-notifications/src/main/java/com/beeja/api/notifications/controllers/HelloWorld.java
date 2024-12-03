package com.beeja.api.notifications.controllers;

import com.beeja.api.notifications.utils.UserContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1")
public class HelloWorld {
  @GetMapping
  public String helloWorld() {
    return "Welcome to Beeja Notification Service, " + UserContext.getLoggedInEmployeeId();
  }
}
