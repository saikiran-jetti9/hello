package com.beeja.api.financemanagementservice.service;

import com.beeja.api.financemanagementservice.enums.Availability;
import com.beeja.api.financemanagementservice.enums.Device;
import com.beeja.api.financemanagementservice.modals.Inventory;
import com.beeja.api.financemanagementservice.requests.DeviceDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface InventoryService {
  Inventory addDevice(DeviceDetails deviceDetails) throws Exception;

  List<Inventory> filterInventory(
      int pageNumber,
      int pageSize,
      Device device,
      String provider,
      Availability availability,
      String os,
      String searchTerm)
      throws Exception;

  ResponseEntity<Inventory> deleteExistingDeviceDetails(String id) throws Exception;

  Inventory updateDeviceDetails(DeviceDetails deviceDetails, String deviceId) throws Exception;

  List<Inventory> getAllDevicesByOrganizationId(String organizationId);

  Long getTotalInventorySize(
      Device device,
      String provider,
      Availability availability,
      String os,
      String organizationId,
      String searchTerm);
}
