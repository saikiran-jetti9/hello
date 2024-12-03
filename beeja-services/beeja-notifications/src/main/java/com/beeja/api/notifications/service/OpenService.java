package com.beeja.api.notifications.service;

import com.beeja.api.notifications.modals.WebsiteContactUs;

/**
 * This service will use for the business logic for all endpoints which are publicly available
 * without connecting with Beeja Login
 */
public interface OpenService {
  WebsiteContactUs submitContactUs(WebsiteContactUs websiteContactUs) throws Exception;
}
