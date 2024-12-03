package com.beeja.api.notifications.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class ProfileManager {

  @Autowired private Environment environment;

  public String[] getActiveProfiles() {
    return environment.getActiveProfiles();
  }

  public boolean isProfileActive(String profile) {
    for (String activeProfile : getActiveProfiles()) {
      if (activeProfile.equals(profile)) {
        return true;
      }
    }
    return false;
  }
}
