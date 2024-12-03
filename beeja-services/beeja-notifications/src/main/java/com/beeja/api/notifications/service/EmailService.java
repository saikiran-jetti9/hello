package com.beeja.api.notifications.service;

import java.util.Map;

public interface EmailService {
  void sendEmail(Map<String, Object> request) throws Exception;
}
