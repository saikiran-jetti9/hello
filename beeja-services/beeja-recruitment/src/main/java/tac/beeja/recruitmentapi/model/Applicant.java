package tac.beeja.recruitmentapi.model;

import java.util.Date;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import tac.beeja.recruitmentapi.enums.ApplicantStatus;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "applicants")
public class Applicant {
  @Id private String id;
  private String firstName;
  private String lastName;
  private String email;
  private String phoneNumber;
  private String positionAppliedFor;
  private String experience;
  private String resumeId;
  private ApplicantStatus status;
  private String organizationId;
  private List<AssignedInterviewer> assignedInterviewers;
  private List<String> notes;

  @Field("created_at")
  @CreatedDate
  private Date createdAt;

  @Field("modified_at")
  @LastModifiedDate
  private Date modifiedAt;

  private String modifiedBy;
}
