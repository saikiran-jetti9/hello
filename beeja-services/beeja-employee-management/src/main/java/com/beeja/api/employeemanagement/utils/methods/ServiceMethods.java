package com.beeja.api.employeemanagement.utils.methods;

import com.beeja.api.employeemanagement.response.GetLimitedEmployee;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;

import java.util.*;
import java.util.stream.Collectors;

public class ServiceMethods {
  public static String[] getNullPropertyNames(Object source) {
    final BeanWrapper src = new BeanWrapperImpl(source);
    java.beans.PropertyDescriptor[] pds = src.getPropertyDescriptors();

    Set<String> emptyNames = new HashSet<>();
    for (java.beans.PropertyDescriptor pd : pds) {
      Object srcValue = src.getPropertyValue(pd.getName());
      if (srcValue == null) emptyNames.add(pd.getName());
    }

    String[] result = new String[emptyNames.size()];
    return emptyNames.toArray(result);
  }

  public static List<Map<String, Object>> combineEmployeeAndAccountData(
      List<GetLimitedEmployee> employeesWithLimitedData,
      List<Map<String, Object>> accountDataList) {

    return employeesWithLimitedData.stream()
        .map(employee -> combineEmployeeAndAccount(employee, accountDataList))
        .filter(Optional::isPresent)
        .map(Optional::get)
        .collect(Collectors.toList());
  }

  public static Optional<Map<String, Object>> combineEmployeeAndAccount(
      GetLimitedEmployee employee, List<Map<String, Object>> accountDataList) {

    return accountDataList.stream()
        .filter(accountData -> employee.getEmployeeId().equals(accountData.get("employeeId")))
        .findFirst()
        .map(
            accountData -> {
              Map<String, Object> combinedData = new HashMap<>();
              combinedData.put("employee", employee);
              combinedData.put("account", accountData);
              return combinedData;
            });
  }
}
