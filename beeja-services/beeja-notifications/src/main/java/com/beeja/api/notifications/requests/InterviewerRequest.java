package com.beeja.api.notifications.requests;

import lombok.Data;

@Data
public class InterviewerRequest {
  private String applicantFirstName;
  private String applicantFastName;
  private String applicantEmail;
  private String positionAppliedFor;

  private String interviewerMail;

  private String notificationCode;
  private String initiator;

  private String organizationId;
  private String organizationName;
}
