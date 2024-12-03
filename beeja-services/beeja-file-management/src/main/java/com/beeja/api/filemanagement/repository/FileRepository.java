package com.beeja.api.filemanagement.repository;

import com.beeja.api.filemanagement.model.File;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

@JaversSpringDataAuditable
public interface FileRepository extends MongoRepository<File, String> {
  List<File> findByEntityId(String entityId);

  File findByOrganizationIdAndId(String organizationId, String id);

  List<File> findByEntityIdAndOrganizationId(String entityId, String organizationId);

  File findByEntityIdAndFileTypeAndOrganizationId(
      String entityId, String fileType, String organizationId);
}
