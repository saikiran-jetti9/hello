package com.beeja.api.expense.controllers;

import com.beeja.api.expense.annotations.HasPermission;
import com.beeja.api.expense.exceptions.ExpenseNotFound;
import com.beeja.api.expense.exceptions.OrganizationMismatchException;
import com.beeja.api.expense.modal.Expense;
import com.beeja.api.expense.requests.CreateExpense;
import com.beeja.api.expense.requests.ExpenseUpdateRequest;
import com.beeja.api.expense.service.ExpenseService;
import com.beeja.api.expense.utils.Constants;
import com.beeja.api.expense.utils.UserContext;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1")
public class ExpenseController {

  @Autowired ExpenseService expenseService;

  @PostMapping
  @HasPermission(Constants.CREATE_EXPENSE)
  public ResponseEntity<?> createExpense(CreateExpense createExpense) {
    try {
      Expense newExpense = expenseService.createExpense(createExpense);
      return new ResponseEntity<>(newExpense, HttpStatus.CREATED);
    } catch (Exception e) {
      return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @DeleteMapping("/{expenseId}")
  @HasPermission(Constants.DELETE_EXPENSE)
  public ResponseEntity<?> deleteExpense(@PathVariable String expenseId) throws Exception {
    try {
      Expense deletedExpense = expenseService.deleteExpense(expenseId);
      return ResponseEntity.ok(deletedExpense);
    } catch (ExpenseNotFound e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
    }
  }

  @PutMapping(value = "/{expenseId}", consumes = "multipart/form-data")
  @HasPermission(Constants.UPDATE_EXPENSE)
  public ResponseEntity<Object> updateExpense(
      @PathVariable String expenseId, ExpenseUpdateRequest updatedExpense) {
    try {
      Expense expense = expenseService.updateExpense(expenseId, updatedExpense);
      return new ResponseEntity<>(expense, HttpStatus.OK);
    } catch (OrganizationMismatchException e) {
      return new ResponseEntity<>(e.getMessage(), HttpStatus.FORBIDDEN);
    } catch (Exception e) {
      return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @GetMapping
  @HasPermission(Constants.READ_EXPENSE)
  public ResponseEntity<?> filterExpenses(
      @RequestParam(name = "startDate", required = false) Date startDate,
      @RequestParam(name = "endDate", required = false) Date endDate,
      @RequestParam(name = "department", required = false) String department,
      @RequestParam(name = "filterBasedOn", defaultValue = "expenseDate") String filterBasedOn,
      @RequestParam(name = "modeOfPayment", required = false) String modeOfPayment,
      @RequestParam(name = "expenseType", required = false) String expenseType,
      @RequestParam(name = "expenseCategory", required = false) String expenseCategory,
      @RequestParam(name = "pageNumber", defaultValue = "1") int pageNumber,
      @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
      @RequestParam(name = "sortBy", required = false) String sortBy,
      @RequestParam(name = "ascending", defaultValue = "true") boolean ascending) {
    try {
      Calendar calendar = Calendar.getInstance();

      calendar.set(Calendar.DAY_OF_MONTH, 1);
      calendar.set(Calendar.HOUR_OF_DAY, 0);
      calendar.set(Calendar.MINUTE, 0);
      calendar.set(Calendar.SECOND, 0);
      calendar.set(Calendar.MILLISECOND, 0);

      Date defaultStartDate = calendar.getTime();

      calendar = Calendar.getInstance();
      calendar.set(Calendar.HOUR_OF_DAY, 23);
      calendar.set(Calendar.MINUTE, 59);
      calendar.set(Calendar.SECOND, 59);
      calendar.set(Calendar.MILLISECOND, 999);

      Date defaultEndDate = calendar.getTime();

      if (startDate == null) {
        startDate = defaultStartDate;
      }

      if (endDate == null) {
        endDate = defaultEndDate;
      }

      HashMap<String, Object> expenses = new HashMap<>();
      HashMap<String, Object> metadata = new HashMap<>();
      metadata.put(
          "totalAmount",
          expenseService.getFilteredTotalAmount(
              startDate,
              endDate,
              department,
              filterBasedOn,
              modeOfPayment,
              expenseType,
              expenseCategory,
              UserContext.getLoggedInUserOrganization().get("id").toString()));
      metadata.put(
          "totalSize",
          expenseService.getTotalExpensesSize(
              startDate,
              endDate,
              department,
              filterBasedOn,
              modeOfPayment,
              expenseType,
              expenseCategory,
              UserContext.getLoggedInUserOrganization().get("id").toString()));
      List<Expense> filteredExpenses =
          expenseService.getFilteredExpenses(
              startDate,
              endDate,
              department,
              filterBasedOn,
              modeOfPayment,
              expenseType,
              expenseCategory,
              UserContext.getLoggedInUserOrganization().get("id").toString(),
              pageNumber,
              pageSize,
              sortBy,
              ascending);
      expenses.put("metadata", metadata);
      expenses.put("expenses", filteredExpenses);
      return new ResponseEntity<>(expenses, HttpStatus.OK);
    } catch (Exception e) {
      return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
