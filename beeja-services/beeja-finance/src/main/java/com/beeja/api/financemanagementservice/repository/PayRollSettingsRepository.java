package com.beeja.api.financemanagementservice.repository;

import com.beeja.api.financemanagementservice.modals.payrollsettings.PayRollSettings;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@JaversSpringDataAuditable
@Repository
public interface PayRollSettingsRepository extends MongoRepository<PayRollSettings, String> {

    Optional<PayRollSettings> findByOrganizationId(String organizationId);

}
