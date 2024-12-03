package com.beeja.api.employeemanagement.config.javers;

import com.beeja.api.employeemanagement.utils.UserContext;
import org.javers.spring.auditable.AuthorProvider;

public class CustomAuthorProvider implements AuthorProvider {
  @Override
  public String provide() {
    return UserContext.getLoggedInUserEmail();
  }
}
