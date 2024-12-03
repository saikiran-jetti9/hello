package com.beeja.api.notifications.serviceImpl;

import com.beeja.api.notifications.exceptions.CustomExceptionHandler;
import com.beeja.api.notifications.exceptions.ResourceNotFoundException;
import com.beeja.api.notifications.modals.WebsiteContactUs;
import com.beeja.api.notifications.modals.WebsiteCredentialsInfo;
import com.beeja.api.notifications.properties.SendGridApis;
import com.beeja.api.notifications.properties.SenderEmails;
import com.beeja.api.notifications.repository.WebsiteCredentialsInfoRepository;
import com.beeja.api.notifications.service.OpenService;
import com.beeja.api.notifications.utils.BTokenVerificationContext;
import com.beeja.api.notifications.utils.Constants;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OpenServiceImpl implements OpenService {
  @Autowired SenderEmails senderEmails;

  @Autowired SendGridApis sendGridApis;

  @Autowired WebsiteCredentialsInfoRepository websiteCredentialsInfoRepository;

  @Override
  public WebsiteContactUs submitContactUs(WebsiteContactUs websiteContactUs) throws Exception {

    Mail mail = getMail(websiteContactUs);

    SendGrid sg = new SendGrid(sendGridApis.getTacWebsite());
    Request request = new Request();
    try {
      request.setMethod(Method.POST);
      request.setEndpoint("mail/send");
      request.setBody(mail.build());
      sg.api(request);
      return websiteContactUs;
    } catch (Exception ex) {
      throw new Exception(ex.getMessage());
    }
  }

  private Mail getMail(WebsiteContactUs websiteContactUs) {
    WebsiteCredentialsInfo websiteCredentialsInfo =
        websiteCredentialsInfoRepository.findByOrganizationId(
            BTokenVerificationContext.getOrganizationId());
    if (websiteCredentialsInfo == null) {
      throw new ResourceNotFoundException(Constants.WEB_CREDENTIALS_NOT_FOUND);
    }
    Email from = new Email(senderEmails.getTacWebsite());
    String subject = websiteContactUs.getName() + " " + Constants.CONTACTED_THROUGH_WEBSITE;
    Email to = new Email(websiteCredentialsInfo.getToMail());

    if (from == null || to == null) {
      throw new CustomExceptionHandler(Constants.FROM_AND_TO_MAILS_MISSING);
    }

    Content content = getContent(websiteContactUs);
    Mail mail = new Mail(from, subject, to, content);
    return mail;
  }

  //        TODO: Update the html and also use templating engines
  private static Content getContent(WebsiteContactUs websiteContactUs) {
    String htmlContent = "<html><body>";
    htmlContent += "<h1>Contact Details:</h1>";
    htmlContent += "<p><b>Name:</b> " + websiteContactUs.getName() + "</p>";
    htmlContent += "<p><b>Email:</b> " + websiteContactUs.getEmail() + "</p>";
    htmlContent += "<p><b>Phone:</b> " + websiteContactUs.getPhone() + "</p>";
    htmlContent += "<p><b>Questions/Comments:</b> " + websiteContactUs.getQuestions() + "</p>";

    htmlContent +=
        "<p><i>This message was sent because someone clicked the contact button on the company's website.</i></p>";
    htmlContent += "<p><i>Please take necessary action to respond to this inquiry.</i></p>";
    htmlContent += "</body></html>";

    Content content = new Content("text/html", htmlContent);
    return content;
  }
}
