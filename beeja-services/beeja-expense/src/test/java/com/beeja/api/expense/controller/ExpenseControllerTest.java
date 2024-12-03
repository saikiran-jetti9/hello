package com.beeja.api.expense.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.eq;
import com.beeja.api.expense.controllers.ExpenseController;
import com.beeja.api.expense.exceptions.ExpenseNotFound;
import com.beeja.api.expense.exceptions.OrganizationMismatchException;
import com.beeja.api.expense.modal.Expense;
import com.beeja.api.expense.repository.ExpenseRepository;
import com.beeja.api.expense.requests.CreateExpense;
import com.beeja.api.expense.requests.ExpenseUpdateRequest;
import com.beeja.api.expense.service.ExpenseService;
import com.beeja.api.expense.utils.UserContext;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class ExpenseControllerTest {

  @Mock private ExpenseRepository expenseRepository;

  @InjectMocks private ExpenseController expenseController;
  @Autowired MockMvc mockMvc;

  @Mock ExpenseService expenseService;

  @Mock private UserContext userContext;

  @BeforeEach
  public void setUp() {
    MockitoAnnotations.openMocks(this);
    mockMvc = MockMvcBuilders.standaloneSetup(expenseController).build();
    Map<String, Object> organizationMap = Collections.singletonMap("id", "tac");
    UserContext.setLoggedInUserOrganization(organizationMap);
  }

  @Test
  void testCreateExpenseSuccess() throws Exception {
    CreateExpense createExpense = new CreateExpense();
    Expense newExpense = new Expense();
    when(expenseService.createExpense(any(CreateExpense.class))).thenReturn(newExpense);
    ResponseEntity<?> responseEntity = expenseController.createExpense(createExpense);
    assertEquals(HttpStatus.CREATED, responseEntity.getStatusCode());
  }


  @Test
  void testUpdateExpenseSuccess() throws Exception {
    ExpenseUpdateRequest updatedExpense = new ExpenseUpdateRequest();
    Expense expense = new Expense();
    when(expenseService.updateExpense("123", updatedExpense)).thenReturn(expense);
    ResponseEntity<?> responseEntity = expenseController.updateExpense("123", updatedExpense);
    assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
  }

  @Test
  void testUpdateExpenseInternalServerError() throws Exception {
    ExpenseUpdateRequest updatedExpense = new ExpenseUpdateRequest();
    Expense expense = new Expense();
    when(expenseService.updateExpense("123", updatedExpense))
        .thenThrow(new Exception("Some internal error"));
    ResponseEntity<?> responseEntity = expenseController.updateExpense("123", updatedExpense);
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, responseEntity.getStatusCode());
  }

  @Test
  void testUpdateExpenseForbidden() throws Exception {
    ExpenseUpdateRequest updatedExpense = new ExpenseUpdateRequest();
    Expense expense = new Expense();
    when(expenseService.updateExpense("123", updatedExpense))
        .thenThrow(new OrganizationMismatchException("Some internal error"));
    ResponseEntity<?> responseEntity = expenseController.updateExpense("123", updatedExpense);
    assertEquals(HttpStatus.FORBIDDEN, responseEntity.getStatusCode());
  }

  @Test
  void testFilterExpensesSuccess() throws Exception {
    Expense expense = new Expense();
    expense.setType("Purchase");
    expense.setCategory("Fitness");
    expense.setOrganizationId("tac");
    String expenseType = "Purchase";
    String expenseCategory = "Fitness";
    String department = null;
    String filterBasedOn = "expenseDate";
    String modeOfPayment = null;
    Date startDate = null;
    Date endDate = null;
    int pageNumber = 1;
    int pageSize = 10;
    String sortBy = null;
    boolean ascending = true;
    List<Expense> filteredExpenses = Collections.singletonList(expense);
    when(expenseService.getFilteredExpenses(any(Date.class),
            any(Date.class),
            isNull(),
            eq("expenseDate"),
            isNull(),
            eq(expenseType),
            eq(expenseCategory),
            eq("tac"),
            eq(1),
            eq(10),
            isNull(),
            eq(true)))
        .thenReturn(filteredExpenses);
    ResponseEntity<?> responseEntity =
        expenseController.filterExpenses(startDate, endDate, department, filterBasedOn, modeOfPayment,
                expenseType, expenseCategory, pageNumber, pageSize, sortBy, ascending);
    assertEquals(responseEntity.getStatusCode(), HttpStatus.OK);
  }

  @Test
  void testFilterExpensesGeneralException() throws Exception {
    Expense expense = new Expense();
    expense.setType("Purchase");
    expense.setCategory("Fitness");
    expense.setOrganizationId("tac");
    String expenseType = "Purchase";
    String expenseCategory = "Fitness";
    String department = null;
    String filterBasedOn = "expenseDate";
    String modeOfPayment = null;
    Date startDate = null;
    Date endDate = null;
    int pageNumber = 1;
    int pageSize = 10;
    String sortBy = null;
    boolean ascending = true;
    List<Expense> filteredExpenses = Collections.singletonList(expense);
    when(expenseService.getFilteredExpenses(any(Date.class),
            any(Date.class),
            isNull(),
            eq(filterBasedOn),
            isNull(),
            eq(expenseType),
            eq(expenseCategory),
            eq("tac"),
            eq(pageNumber),
            eq(pageSize),
            isNull(),
            eq(ascending)))
        .thenThrow(new Exception());
    ResponseEntity<?> responseEntity =
        expenseController.filterExpenses(startDate, endDate, department, filterBasedOn, modeOfPayment,
                expenseType, expenseCategory, pageNumber, pageSize, sortBy, ascending);
    assertEquals(responseEntity.getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @Test
  public void testDeleteExpenseSuccess() throws Exception {
    String expenseId = "1";
    Expense mockExpense = new Expense();
    when(expenseService.deleteExpense(expenseId)).thenReturn(mockExpense);
    ResponseEntity<?> responseEntity = expenseController.deleteExpense(expenseId);
    assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
  }

  @Test
  public void testDeleteExpenseExpenseNotFound() throws Exception {
    String expenseId = "1";
    when(expenseService.deleteExpense(expenseId))
        .thenThrow(new ExpenseNotFound("Expense not found with ID: " + expenseId));
    ResponseEntity<?> responseEntity = expenseController.deleteExpense(expenseId);
    assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
  }

  @Test
  public void testDeleteExpenseInternalServerError() throws Exception {
    String expenseId = "1";
    when(expenseService.deleteExpense(expenseId))
        .thenThrow(new RuntimeException("Internal Server Error"));
    ResponseEntity<?> responseEntity = expenseController.deleteExpense(expenseId);
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, responseEntity.getStatusCode());
  }
}
