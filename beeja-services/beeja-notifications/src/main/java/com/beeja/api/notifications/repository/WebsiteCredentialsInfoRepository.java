package com.beeja.api.notifications.repository;

import com.beeja.api.notifications.modals.WebsiteCredentialsInfo;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WebsiteCredentialsInfoRepository
    extends MongoRepository<WebsiteCredentialsInfo, String> {
  WebsiteCredentialsInfo findByOrganizationId(String organizationId);
}
