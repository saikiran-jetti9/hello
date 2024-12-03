package tac.beeja.recruitmentapi.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tac.beeja.recruitmentapi.utils.UserContext;

@RestController
@RequestMapping("/v1")
public class HelloWorld {

  @GetMapping
  public String helloWorld() {
    return "Hello World from Recruitment Service, Employee ID: "
        + UserContext.getLoggedInEmployeeId();
  }
}
