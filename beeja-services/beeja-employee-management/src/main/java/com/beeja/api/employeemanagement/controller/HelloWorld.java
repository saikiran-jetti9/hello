package com.beeja.api.employeemanagement.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloWorld {
  @GetMapping("/v1")
  public String hello() {
    return "Hello World";
  }
}
