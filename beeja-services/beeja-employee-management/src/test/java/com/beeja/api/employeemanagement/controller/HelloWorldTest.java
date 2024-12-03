package com.beeja.api.employeemanagement.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;

@DataMongoTest
public class HelloWorldTest {
  @InjectMocks HelloWorld helloWorld;

  @Test
  void testHello() {
    assertEquals(helloWorld.hello(), "Hello World");
  }
}
