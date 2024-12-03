package com.beeja.api.filemanagement.controller;

import com.beeja.api.filemanagement.utils.UserContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1")
public class HelloWorld {
  @GetMapping
  public String hello() {
    return "Hello World " + UserContext.getLoggedInUserName();
  }
}
