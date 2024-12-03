package com.beeja.api.notifications.requests;

import lombok.Data;

@Data
public class NewLoanApplication {
  private String hrMail;
  private String employeeMail;
  private String organizationId;
  private String organizationName;
  private String employeeId;
  private String employeeName;
  private String loanAmount;
  private String loanType;
  private String notificationCode;
  private String initiator;
}
