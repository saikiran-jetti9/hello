package com.beeja.api.expense.service;

import static com.mongodb.assertions.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.times;
import com.beeja.api.expense.client.FileClient;
import com.beeja.api.expense.exceptions.ExpenseNotFound;
import com.beeja.api.expense.modal.Expense;
import com.beeja.api.expense.repository.ExpenseRepository;
import com.beeja.api.expense.requests.CreateExpense;
import com.beeja.api.expense.requests.ExpenseUpdateRequest;
import com.beeja.api.expense.serviceImpl.ExpenseServiceImpl;
import com.beeja.api.expense.utils.UserContext;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

class ExpenseServiceImplTest {

  @Mock private ExpenseRepository expenseRepository;

  @Mock private MongoTemplate mongoTemplate;

  @Mock private FileClient fileClient;
  @InjectMocks private ExpenseServiceImpl expenseService;

  @BeforeEach
  public void setUp() {
    MockitoAnnotations.openMocks(this);
    Map<String, Object> organizationMap = Collections.singletonMap("id", "tac");
    UserContext.setLoggedInUserOrganization(organizationMap);
  }

  @Test
  public void testCreateExpense_SavesExpenseDetails() throws Exception {
    MockitoAnnotations.openMocks(this);
    CreateExpense createExpense = new CreateExpense();
    createExpense.setAmount(100);
    createExpense.setCurrencyCode("USD");
    createExpense.setType("Travel");
    createExpense.setCategory("Transport");
    createExpense.setModeOfPayment("Credit Card");
    createExpense.setMerchant("Uber");
    createExpense.setClaimed(true);
    createExpense.setPaymentMadeBy("Employee");
    createExpense.setDescription("Business trip to client");
    createExpense.setDepartment("Sales");
    Expense mockExpense = new Expense();
    when(expenseRepository.save(any())).thenReturn(mockExpense);
    Expense savedExpense = expenseService.createExpense(createExpense);
    assertNotNull(savedExpense);
  }

  @Test
  void testUpdateExpensesSuccess() throws Exception {
    UserContext.setLoggedInUserPermissions(Set.of("READ_EXPENSE"));
    Expense expense = new Expense();
    Optional<Expense> optionalExpense = Optional.of(expense);
    optionalExpense.get().setOrganizationId("tac");
    when(expenseRepository.findById(anyString())).thenReturn(optionalExpense);
    ExpenseUpdateRequest updatedExpense = new ExpenseUpdateRequest();
    optionalExpense.get().setOrganizationId("tac");
    String loggedInUserOrganizationId =
        (String) UserContext.getLoggedInUserOrganization().get("id");
    when(expenseRepository.save(expense)).thenReturn(expense);
    Expense expense1 = expenseService.updateExpense("123", updatedExpense);
    assertEquals(expense, expense1);
  }

  @Test
  void testUpdateExpensesGeneralException() {
    UserContext.setLoggedInUserPermissions(Set.of("READ_EXPENSE"));
    Expense expense = new Expense();
    ExpenseUpdateRequest expenseUpdateRequest = new ExpenseUpdateRequest();
    when(expenseRepository.save(expense)).thenThrow(new RuntimeException("Some internal error"));
    assertThrows(Exception.class, () -> expenseService.updateExpense("123", expenseUpdateRequest));
  }

  @Test
  void testGetFilteredExpensesSuccess() {
    Query query = new Query();
    query.addCriteria(Criteria.where("modeOfPayment").is("UPI"));
    query.addCriteria(Criteria.where("type").is("Purchase"));
    query.addCriteria(Criteria.where("category").is("Office Supplies - Lap"));
    query.addCriteria(Criteria.where("organizationId").is("tac"));
    Expense expense = new Expense();
    expense.setModeOfPayment("UPI");
    expense.setType("Purchase");
    expense.setCategory("Office Supplies - Lap");
    expense.setOrganizationId("tac");
    List<Expense> filteredExpenses = Collections.singletonList(expense);
    when(mongoTemplate.find(query, Expense.class)).thenReturn(filteredExpenses);
    assertEquals(filteredExpenses.get(0), expense);
  }

  @Test
  public void testDeleteFile_Success() throws Exception {
    String expenseId = "1";
    UserContext.setLoggedInUserEmail("tac");

    Expense mockExpense = new Expense();
    mockExpense.setFileId(Arrays.asList("abc", "cdf"));
    UserContext.setLoggedInUserPermissions(Set.of("DELETE_EXPENSE"));

    when(expenseRepository.findByOrganizationIdAndId(anyString(), anyString()))
        .thenReturn(Optional.of(mockExpense));
    Expense result = expenseService.deleteExpense(expenseId);
    assertEquals(mockExpense, result);
  }

  @Test
  void testDeleteExpenseExpenseNotFound() {
    String expenseId = "1";
    when(expenseRepository.findByOrganizationIdAndId(anyString(), anyString()))
        .thenReturn(Optional.empty());
    assertThrows(ExpenseNotFound.class, () -> expenseService.deleteExpense(expenseId));
  }

  @Test
  void testDeleteExpenseException() throws Exception {
    String expenseId = "1234";
    String organizationId = "abcde";
    UserContext.setLoggedInUserOrganization(Collections.singletonMap("id", organizationId));
    Expense expense = new Expense();
    expense.setId(expenseId);
    expense.setFileId(Arrays.asList("fileId1", "fileId2"));
    when(expenseRepository.findByOrganizationIdAndId(organizationId, expenseId))
        .thenReturn(Optional.of(expense));
    expenseService.deleteExpense(expenseId);
    verify(expenseRepository).deleteById(expenseId);
    verify(fileClient, times(2)).deleteFile(anyString());

  }
}
