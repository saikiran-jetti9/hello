package com.beeja.api.notifications.modals;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "website-credentials-info")
public class WebsiteCredentialsInfo {
  @Id private String id;
  private String organizationId;
  private String toMail;
}
