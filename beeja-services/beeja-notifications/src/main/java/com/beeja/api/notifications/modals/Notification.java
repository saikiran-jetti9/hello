package com.beeja.api.notifications.modals;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "notifications")
public class Notification {
  @Id private String id;
  private String initiator;
  private String notificationCode;
  private String templateCode;
  private String recipientEmail;
  private String fromMail;
  private String employeeId;
  private String organizationId;
}
