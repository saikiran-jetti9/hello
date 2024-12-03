package com.beeja.api.financemanagementservice.config.javers;

import com.beeja.api.financemanagementservice.Utils.UserContext;
import org.javers.spring.auditable.AuthorProvider;

public class CustomAuthorProvider implements AuthorProvider {
  @Override
  public String provide() {
    return UserContext.getLoggedInUserEmail();
  }
}
