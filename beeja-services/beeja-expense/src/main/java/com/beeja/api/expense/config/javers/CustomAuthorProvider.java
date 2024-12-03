package com.beeja.api.expense.config.javers;

import com.beeja.api.expense.utils.UserContext;
import org.javers.spring.auditable.AuthorProvider;

public class CustomAuthorProvider implements AuthorProvider {
  @Override
  public String provide() {
    return UserContext.getLoggedInUserEmail();
  }
}
