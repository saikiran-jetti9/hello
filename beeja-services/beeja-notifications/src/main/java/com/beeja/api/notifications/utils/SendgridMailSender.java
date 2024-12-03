package com.beeja.api.notifications.utils;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import java.io.IOException;
import java.util.Map;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;

/** Utility class for sending emails using SendGrid. */
public class SendgridMailSender {

  /**
   * Sends an email using SendGrid.
   *
   * @param senderName The name of the sender.
   * @param subject The subject of the email.
   * @param templateName The name of the FreeMarker template to use for the email content (fetched
   *     from classpath).
   * @param model The model contains dynamic data to be used in the template.
   * @param toMail The email address of the recipient.
   * @param senderMail The email address of the sender.
   * @param apiKey The SendGrid API key.
   * @param configuration The FreeMarker configuration object.
   * @throws Exception If an error occurs while sending the email.
   */
  public static void sendEmail(
      String senderName,
      String subject,
      String templateName,
      Map<String, Object> model,
      String toMail,
      String senderMail,
      String apiKey,
      Configuration configuration)
      throws Exception {
    try {
      SendGrid sg = new SendGrid(apiKey);
      Template template = configuration.getTemplate(templateName);

      String htmlContent = FreeMarkerTemplateUtils.processTemplateIntoString(template, model);

      Email from = new Email(senderMail, senderName);
      Email to = new Email(toMail);

      Content content = new Content("text/html", htmlContent);
      Mail mail = new Mail(from, subject, to, content);

      Request sendRequest = new Request();
      sendRequest.setMethod(Method.POST);
      sendRequest.setEndpoint("mail/send");
      sendRequest.setBody(mail.build());
      sg.api(sendRequest);
    } catch (IOException | TemplateException e) {
      throw new Exception(Constants.ERROR_OCCURRED_IN_MAIL_SENDING + e.getMessage());
    }
  }
}
