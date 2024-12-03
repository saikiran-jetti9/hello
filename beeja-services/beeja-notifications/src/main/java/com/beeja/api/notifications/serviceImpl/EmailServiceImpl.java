package com.beeja.api.notifications.serviceImpl;

import com.beeja.api.notifications.config.ProfileManager;
import com.beeja.api.notifications.properties.SendGridApis;
import com.beeja.api.notifications.properties.SenderEmails;
import com.beeja.api.notifications.requests.InterviewerRequest;
import com.beeja.api.notifications.requests.NewLoanApplication;
import com.beeja.api.notifications.requests.NewUserEmailRequest;
import com.beeja.api.notifications.service.EmailService;
import com.beeja.api.notifications.utils.SendgridMailSender;
import com.fasterxml.jackson.databind.ObjectMapper;
import freemarker.template.Configuration;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

  @Autowired SendGridApis sendGridApis;

  @Autowired private Configuration config;

  @Autowired private SenderEmails senderEmails;

  @Autowired private ProfileManager profileManager;

  /**
   * Sends email notifications based on the provided request data.
   *
   * @param request A map containing request data.
   * @throws Exception If an error occurs while sending the email.
   */
  @Override
  public void sendEmail(Map<String, Object> request) throws Exception {
    if ("NEW_EMP".equals(request.get("notificationCode"))) {
      NewUserEmailRequest newUserEmailRequest =
          new ObjectMapper().convertValue(request, NewUserEmailRequest.class);
      Map<String, Object> model = new HashMap<>();
      model.put("companyName", newUserEmailRequest.getOrganizationName());
      model.put("employeeName", newUserEmailRequest.getEmployeeName());
      model.put("newEmployeeEmail", newUserEmailRequest.getToMail());
      model.put("newEmployeeId", newUserEmailRequest.getEmployeeId());
      model.put("newEmployeePassword", newUserEmailRequest.getPassword());

      String senderMail = senderEmails.getTacWebsite();
      String subject;
      String templateName;
      String senderName;
      if (profileManager.isProfileActive("prod")) {
        senderName = "HR Team - " + newUserEmailRequest.getOrganizationName();
        templateName = "UserCreationMail.ftl";
        subject = "Welcome to " + newUserEmailRequest.getOrganizationName();
      } else {
        senderName = "Dev Team - Beeja";
        templateName = "UserCreationMailDev.ftl";
        subject = "Welcome to Beeja - " + newUserEmailRequest.getOrganizationName();
      }
      String toMail = newUserEmailRequest.getToMail();

      SendgridMailSender.sendEmail(
          senderName,
          subject,
          templateName,
          model,
          toMail,
          senderMail,
          sendGridApis.getBeeja(),
          config);
    }

    if ("PAYSLIP_SUCCESS".equals(request.get("notificationCode"))) {

      String employeeName = (String) request.get("employeeName");
      String employeeEmail = (String) request.get("toMail");
      String employeeId = (String) request.get("employeeId");
      String organizationName = (String) request.get("organizationName");
      String month = (String) request.get("month");
      String year = (String) request.get("year");

      if (employeeName != null) {
        Map<String, Object> model = new HashMap<>();
        model.put("employeeName", employeeName);
        model.put("organizationName", organizationName);
        model.put("month", month);
        model.put("year", year);
        model.put("employeeId", employeeId);

        String senderMail = senderEmails.getTacWebsite();
        String senderName = "Finance Team - " + organizationName;
        String subject = "Payslip for " + month + " " + year;
        String templateName = "PayslipNotification.ftl";
        String toMail = employeeEmail;

        {
          SendgridMailSender.sendEmail(
              senderName,
              subject,
              templateName,
              model,
              toMail,
              senderMail,
              sendGridApis.getBeeja(),
              config);
        }
      }
    }

    if ("NEW_LOAN".equals(request.get("notificationCode"))) {
      NewLoanApplication newLoanApplication =
          new ObjectMapper().convertValue(request, NewLoanApplication.class);
      Map<String, Object> model = new HashMap<>();
      model.put("employeeName", newLoanApplication.getEmployeeName());
      model.put("employeeId", newLoanApplication.getEmployeeId());
      model.put("loanAmount", newLoanApplication.getLoanAmount());
      model.put("loanType", newLoanApplication.getLoanType());

      String senderMail = senderEmails.getTacWebsite();
      String senderName = "Accounts - " + newLoanApplication.getOrganizationName();
      String subject = "New Loan Application of " + newLoanApplication.getEmployeeId();
      String templateName = "LoanApplicationHRMail.ftl";
      String toMail = newLoanApplication.getHrMail();
      SendgridMailSender.sendEmail(
          senderName,
          subject,
          templateName,
          model,
          toMail,
          senderMail,
          sendGridApis.getBeeja(),
          config);

      //      Mail for Loan Applicant
      Map<String, Object> employeeModal = new HashMap<>();
      employeeModal.put("employeeName", newLoanApplication.getEmployeeName());
      employeeModal.put("loanAmount", newLoanApplication.getLoanAmount());
      employeeModal.put("loanType", newLoanApplication.getLoanType());

      String employeeSubject =
          "New Loan Application Confirmation: " + newLoanApplication.getEmployeeId();
      String employeeTemplateName = "LoanApplicationConfirmationEmp.ftl";
      String employeeMail = newLoanApplication.getEmployeeMail();
      SendgridMailSender.sendEmail(
          senderName,
          employeeSubject,
          employeeTemplateName,
          employeeModal,
          employeeMail,
          senderMail,
          sendGridApis.getBeeja(),
          config);
    }

    if ("INTERVIEW_SCHEDULE".equals(request.get("notificationCode"))) {
      InterviewerRequest interviewerRequest =
          new ObjectMapper().convertValue(request, InterviewerRequest.class);
      Map<String, Object> model = new HashMap<>();
      model.put("applicantName", interviewerRequest.getApplicantFirstName());
      model.put("applicantLastName", interviewerRequest.getApplicantFastName());
      model.put("applicantEmail", interviewerRequest.getApplicantEmail());
      model.put("position", interviewerRequest.getPositionAppliedFor());
      model.put("companyName", interviewerRequest.getOrganizationName());

      String senderMail = senderEmails.getTacWebsite();
      String senderName = "Hiring Team - " + interviewerRequest.getOrganizationName();
      String subject = "Interview Scheduled " + interviewerRequest.getOrganizationName();
      String templateName = "Interviewer.ftl";
      String toMail = interviewerRequest.getInterviewerMail();

      SendgridMailSender.sendEmail(
          senderName,
          subject,
          templateName,
          model,
          toMail,
          senderMail,
          sendGridApis.getBeeja(),
          config);
    }
  }
}
