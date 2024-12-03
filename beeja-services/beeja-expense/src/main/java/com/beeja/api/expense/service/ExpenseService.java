package com.beeja.api.expense.service;

import com.beeja.api.expense.modal.Expense;
import com.beeja.api.expense.requests.CreateExpense;
import com.beeja.api.expense.requests.ExpenseUpdateRequest;
import java.util.Date;
import java.util.List;

public interface ExpenseService {

  Expense deleteExpense(String expenseId) throws Exception;

  Expense updateExpense(String expenseId, ExpenseUpdateRequest updatedExpense) throws Exception;

  Expense createExpense(CreateExpense createExpense) throws Exception;

  List<Expense> getFilteredExpenses(
      Date startDate,
      Date endDate,
      String department,
      String filterBasedOn,
      String modeOfPayment,
      String expenseType,
      String expenseCategory,
      String organizationId,
      int pageNumber,
      int pageSize,
      String sortBy,
      boolean ascending)
      throws Exception;

  Double getFilteredTotalAmount(
      Date startDate,
      Date endDate,
      String department,
      String filterBasedOn,
      String modeOfPayment,
      String expenseType,
      String expenseCategory,
      String organizationId);

  Long getTotalExpensesSize(
      Date startDate,
      Date endDate,
      String department,
      String filterBasedOn,
      String modeOfPayment,
      String expenseType,
      String expenseCategory,
      String organizationId);
}
