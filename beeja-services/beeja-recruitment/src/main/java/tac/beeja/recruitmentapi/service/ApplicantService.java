package tac.beeja.recruitmentapi.service;

import java.util.List;
import java.util.Map;
import org.springframework.core.io.ByteArrayResource;
import tac.beeja.recruitmentapi.model.Applicant;
import tac.beeja.recruitmentapi.model.AssignedInterviewer;
import tac.beeja.recruitmentapi.request.ApplicantFeedbackRequest;
import tac.beeja.recruitmentapi.request.ApplicantRequest;

public interface ApplicantService {
  Applicant postApplicant(ApplicantRequest applicant) throws Exception;

  List<Applicant> getAllApplicantsInOrganization() throws Exception;

  Applicant updateApplicant(String applicantId, Map<String, Object> fields) throws Exception;

  ByteArrayResource downloadFile(String fileId) throws Exception;

  Applicant submitFeedback(String applicantId, ApplicantFeedbackRequest applicantFeedbackRequest);

  Applicant assignInterviewer(String applicantId, AssignedInterviewer assignedInterviewer)
      throws Exception;

  Applicant getApplicantById(String applicantId) throws Exception;

  Applicant deleteInterviewerByInterviewID(String applicantId, String interviewId) throws Exception;
}
