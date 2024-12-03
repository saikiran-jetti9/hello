package com.beeja.api.expense.repository;

import com.beeja.api.expense.modal.Expense;
import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.springframework.data.mongodb.repository.MongoRepository;

@JaversSpringDataAuditable
public interface ExpenseRepository extends MongoRepository<Expense, String> {

  Optional<Expense> findByOrganizationIdAndId(String organizationId, String expenseId);

  Long countByOrganizationId(String organizationId);
}
