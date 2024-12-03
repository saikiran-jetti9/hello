package com.beeja.api.employeemanagement.config;

import com.beeja.api.employeemanagement.exceptions.UnAuthorisedException;
import com.beeja.api.employeemanagement.utils.BuildErrorMessage;
import com.beeja.api.employeemanagement.annotations.HasPermission;
import com.beeja.api.employeemanagement.annotations.RequireAllPermissions;
import com.beeja.api.employeemanagement.enums.ErrorCode;
import com.beeja.api.employeemanagement.enums.ErrorType;
import com.beeja.api.employeemanagement.utils.UserContext;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

import static com.beeja.api.employeemanagement.utils.Constants.UNAUTHORISED;
import static com.beeja.api.employeemanagement.utils.Constants.UNAUTHORISED_ACCESS;

@Aspect
@Component
public class PermissionAspect {

  @Before("@annotation(hasPermission)")
  public void checkPermission(HasPermission hasPermission) {
    String[] requiredPermissions = hasPermission.value();
    List<String> userPermissions = getUserPermissions();

    boolean hasRequiredPermission =
        Arrays.stream(requiredPermissions).anyMatch(userPermissions::contains);

    if (!hasRequiredPermission) {
      throw new UnAuthorisedException(
          BuildErrorMessage.buildErrorMessage(
              ErrorType.AUTHORIZATION_ERROR, ErrorCode.PERMISSION_MISSING, UNAUTHORISED_ACCESS));
    }
  }

  @Before("@annotation(requireAllPermissions)")
  public void checkAllPermissions(RequireAllPermissions requireAllPermissions) {
    HasPermission[] requiredPermissions = requireAllPermissions.value();
    List<String> userPermissions = getUserPermissions();

    for (HasPermission permissionAnnotation : requiredPermissions) {
      String[] permissions = permissionAnnotation.value();

      boolean hasRequiredPermissions =
          Arrays.stream(permissions).allMatch(userPermissions::contains);

      if (!hasRequiredPermissions) {
        throw new UnAuthorisedException(UNAUTHORISED);
      }
    }
  }

  private List<String> getUserPermissions() {
    Set<String> loggedInUserPermissions = UserContext.getLoggedInUserPermissions();
    return new ArrayList<>(loggedInUserPermissions);
  }
}
