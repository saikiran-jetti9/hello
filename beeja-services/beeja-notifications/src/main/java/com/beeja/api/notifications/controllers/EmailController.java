package com.beeja.api.notifications.controllers;

import com.beeja.api.notifications.service.EmailService;
import com.beeja.api.notifications.utils.Constants;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/mail")
public class EmailController {
  @Autowired private EmailService emailService;

  @PostMapping("/send-email")
  public ResponseEntity<String> sendEmail(@RequestBody Map<String, Object> request)
      throws Exception {
    emailService.sendEmail(request);
    return new ResponseEntity<>(Constants.EMAIL_SENT_SUCCESSFULLY, HttpStatus.OK);
  }
}
