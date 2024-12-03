package tac.beeja.recruitmentapi.repository;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import tac.beeja.recruitmentapi.model.Applicant;

public interface ApplicantRepository extends MongoRepository<Applicant, String> {
  List<Applicant> findAllByOrganizationId(String organizationId);

  Applicant findByIdAndOrganizationId(String id, String organizationId);
}
