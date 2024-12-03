package com.beeja.api.filemanagement.config.javers;

import com.beeja.api.filemanagement.utils.UserContext;
import org.javers.spring.auditable.AuthorProvider;

public class CustomAuthorProvider implements AuthorProvider {
  @Override
  public String provide() {
    return UserContext.getLoggedInUserEmail();
  }
}
