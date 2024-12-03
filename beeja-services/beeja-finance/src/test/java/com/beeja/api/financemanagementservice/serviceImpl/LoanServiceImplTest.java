package com.beeja.api.financemanagementservice.serviceImpl;

import static com.beeja.api.financemanagementservice.Utils.Constants.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.beeja.api.financemanagementservice.Utils.UserContext;
import com.beeja.api.financemanagementservice.enums.LoanStatus;
import com.beeja.api.financemanagementservice.enums.LoanType;
import com.beeja.api.financemanagementservice.modals.Loan;
import com.beeja.api.financemanagementservice.modals.LoanSequence;
import com.beeja.api.financemanagementservice.repository.LoanRepository;
import com.beeja.api.financemanagementservice.requests.SubmitLoanRequest;

import java.lang.reflect.Method;
import java.util.*;
import java.util.Collections;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;


@ExtendWith(MockitoExtension.class)
class LoanServiceImplTest {

  @Mock
  private LoanRepository loanRepository;

  @InjectMocks
  private LoanServiceImpl loanService;

  @Autowired MockMvc mockMvc;

  @Mock
  private MongoTemplate mongoTemplate;
  private  UserContext userContext;
  private LoanServiceImpl loanServiceImpl;

  @BeforeEach
  public void setUp() {
    MockitoAnnotations.openMocks(this);
    mockMvc = MockMvcBuilders.standaloneSetup(loanService).build();
    Map<String, Object> organizationMap = Collections.singletonMap("id", "tac");
    UserContext.setLoggedInUserOrganization(organizationMap);
    UserContext.setLoggedInEmployeeId("employee456");
    ReflectionTestUtils.setField(loanService, "mongoTemplate", mongoTemplate);
    ReflectionTestUtils.setField(loanService, "loanRepository", loanRepository);
  }

  private Loan createMockLoan() {
    Loan mockLoan = new Loan();
    mockLoan.setLoanNumber("123456");
    mockLoan.setOrganizationId("organization123");
    mockLoan.setEmployeeId("employee789");
    mockLoan.setStatus(LoanStatus.WAITING);
    return mockLoan;
  }

  @Test
  void testChangeLoanStatusApprove() {
    String loanId = "123456";
    String status = "APPROVE";
    String message = "Approved successfully";
    Loan mockLoan = createMockLoan();
    when(loanRepository.findByIdAndOrganizationId(any(), any())).thenReturn(mockLoan);
    loanService.changeLoanStatus(loanId, status, message);
    assertEquals(LoanStatus.APPROVED, mockLoan.getStatus());
    verify(loanRepository, times(1)).save(mockLoan);
  }

  @Test
  void testChangeLoanStatusReject() {
    String loanId = "123456";
    String status = "REJECT";
    String message = "message";

    Loan mockLoan = createMockLoan();
    when(loanRepository.findByIdAndOrganizationId(any(), any())).thenReturn(mockLoan);

    assertDoesNotThrow(() -> loanService.changeLoanStatus(loanId, status, message));

    assertEquals(LoanStatus.REJECTED, mockLoan.getStatus());
  }

  @Test
  void testChangeLoanStatusWaiting() {
    String loanId = "123456";
    String status = "WAITING";
    String message = "message";

    Loan mockLoan = createMockLoan();
    when(loanRepository.findByIdAndOrganizationId(any(), any())).thenReturn(mockLoan);

    assertDoesNotThrow(() -> loanService.changeLoanStatus(loanId, status, message));

    assertEquals(LoanStatus.WAITING, mockLoan.getStatus());
  }

  @Test
  public void testSubmitLoanRequestSuccess() throws Exception {
    SubmitLoanRequest loanRequest = new SubmitLoanRequest();
    loanRequest.setLoanType(LoanType.MONITOR_LOAN);
    doReturn(new LoanSequence("loan_sequence", 1))
            .when(mongoTemplate)
            .findAndModify(
                    ArgumentMatchers.any(Query.class),
                    ArgumentMatchers.any(Update.class),
                    ArgumentMatchers.eq(LoanSequence.class));
    Loan result = loanService.submitLoanRequest(loanRequest);
  }


  @Test
  public void testGetAllLoansSuccess() throws Exception {
    // Arrange
    List<Loan> expectedLoans = Arrays.asList(new Loan(), new Loan());
    when(loanRepository.findAllByOrganizationId("tac")).thenReturn(expectedLoans);

    // Act
    List<Loan> actualLoans = loanService.getAllLoans();

    // Assert
    assertEquals(expectedLoans, actualLoans);
  }

  @Test
  public void testGetAllLoansNoLoans() throws Exception {
    List<Loan> emptyLoans = Collections.emptyList();
    when(loanRepository.findAllByOrganizationId("tac")).thenReturn(emptyLoans);
    List<Loan> actualLoans = loanService.getAllLoans();
    assertTrue(actualLoans.isEmpty());
  }

  @Test
  public void testGetAllLoansByEmployeeIdWithoutPermission() throws Exception {
    // Arrange
    String employeeId = "testEmployeeId";
    String loggedInEmployeeId = "loggedInEmployeeId";
    List<Loan> expectedLoans = Arrays.asList(new Loan(), new Loan());
    when(loanRepository.findAllByEmployeeIdAndOrganizationId(loggedInEmployeeId, "tac"))
        .thenReturn(expectedLoans);

    Set<String> permissions = Collections.emptySet();
    UserContext.setLoggedInUserPermissions(permissions);
    UserContext.setLoggedInEmployeeId(loggedInEmployeeId);

    // Act
    List<Loan> actualLoans = loanService.getAllLoansByEmployeeId(employeeId);

    // Assert
    assertEquals(expectedLoans, actualLoans);
  }

  @Test
  public void testGetAllLoansByEmployeeIdWithPermission() throws Exception {
    // Arrange
    String employeeId = "testEmployeeId";
    List<Loan> expectedLoans = Arrays.asList(new Loan(), new Loan());
    when(loanRepository.findAllByEmployeeIdAndOrganizationId(employeeId, "tac"))
        .thenReturn(expectedLoans);

    Set<String> permissions = Set.of(GET_ALL_LOANS);
    UserContext.setLoggedInUserPermissions(permissions);

    // Act
    List<Loan> actualLoans = loanService.getAllLoansByEmployeeId(employeeId);

    // Assert
    assertEquals(expectedLoans, actualLoans);
  }

  @Test
  public void testGenerateLoanNumber_Success() throws Exception {
    LoanSequence loanSequence = new LoanSequence(LOAN_SEQUENCE, 2);
    when(mongoTemplate.findAndModify(any(Query.class), any(Update.class), eq(LoanSequence.class)))
            .thenReturn(loanSequence);
    Method generateLoanNumberMethod = LoanServiceImpl.class.getDeclaredMethod("generateLoanNumber");
    generateLoanNumberMethod.setAccessible(true);
    String loanNumber = (String) generateLoanNumberMethod.invoke(loanService);
    assertNotNull(loanNumber);
    assertEquals("L-002", loanNumber);
  }

  @Test
  public void testGenerateLoanNumber_UsingReflection() throws Exception {
    LoanSequence loanSequence = new LoanSequence(LOAN_SEQUENCE, 2);
    when(mongoTemplate.findAndModify(any(Query.class), any(Update.class), eq(LoanSequence.class)))
            .thenReturn(loanSequence);
    Method generateLoanNumberMethod = LoanServiceImpl.class.getDeclaredMethod("generateLoanNumber");
    generateLoanNumberMethod.setAccessible(true);
    String loanNumber = (String) generateLoanNumberMethod.invoke(loanService);
    assertNotNull(loanNumber);
    assertEquals("L-002", loanNumber);
  }

}
