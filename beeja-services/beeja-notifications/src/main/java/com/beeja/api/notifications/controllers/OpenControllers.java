package com.beeja.api.notifications.controllers;

import com.beeja.api.notifications.modals.WebsiteContactUs;
import com.beeja.api.notifications.service.OpenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * These controllers are responsible for requests coming from websites which are subscribed to beeja
 * & just required {@code bToken} in header to access these controllers
 */
@RestController
@RequestMapping("/v1/open")
public class OpenControllers {

  @Autowired OpenService openService;

  @PostMapping("/website")
  public ResponseEntity<WebsiteContactUs> sendEmailNotification(
      @RequestBody WebsiteContactUs websiteContactUs) throws Exception {
    return ResponseEntity.ok(openService.submitContactUs(websiteContactUs));
  }
}
