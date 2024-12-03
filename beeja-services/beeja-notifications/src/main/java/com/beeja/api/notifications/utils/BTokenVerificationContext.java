package com.beeja.api.notifications.utils;

import lombok.Getter;
import lombok.Setter;

public class BTokenVerificationContext {
  @Getter @Setter private static Boolean isValid;

  @Getter @Setter private static String organizationId;

  @Getter @Setter private static String tokenType;
  @Getter @Setter private static String organizationName;

  public static void setTokenContext(Boolean valid, String orgId, String type, String orgName) {
    isValid = valid;
    organizationId = orgId;
    tokenType = type;
    organizationName = orgName;
  }
}
