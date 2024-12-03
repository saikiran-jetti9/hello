package com.beeja.api.notifications.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "sendgrid-keys")
public class SendGridApis {
  private String tacWebsite;
  private String beeja;
}
