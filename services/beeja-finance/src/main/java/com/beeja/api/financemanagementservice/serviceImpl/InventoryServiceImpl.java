package com.beeja.api.financemanagementservice.serviceImpl;

import com.beeja.api.financemanagementservice.Utils.BuildErrorMessage;
import com.beeja.api.financemanagementservice.Utils.Constants;
import com.beeja.api.financemanagementservice.Utils.UserContext;
import com.beeja.api.financemanagementservice.enums.Availability;
import com.beeja.api.financemanagementservice.enums.Device;
import com.beeja.api.financemanagementservice.enums.ErrorCode;
import com.beeja.api.financemanagementservice.enums.ErrorType;
import com.beeja.api.financemanagementservice.exceptions.DuplicateProductIdException;
import com.beeja.api.financemanagementservice.exceptions.ResourceNotFoundException;
import com.beeja.api.financemanagementservice.modals.Inventory;
import com.beeja.api.financemanagementservice.repository.InventoryRepository;
import com.beeja.api.financemanagementservice.requests.DeviceDetails;
import com.beeja.api.financemanagementservice.service.InventoryService;
import com.mongodb.DuplicateKeyException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class InventoryServiceImpl implements InventoryService {

  private final MongoOperations mongoOperations;
  @Autowired private MongoTemplate mongoTemplate;

  /**
   * Implementation of InventoryService providing CRUD operations for managing inventory devices.
   */
  @Autowired
  public InventoryServiceImpl(MongoOperations mongoOperations) {
    this.mongoOperations = mongoOperations;
  }

  @Autowired InventoryRepository inventoryRepository;

  /**
   * Adds a new device to the inventory.
   *
   * @param deviceDetails Details of the device to be added.
   * @return The newly added Inventory object.
   * @throws DuplicateProductIdException If a product with the same ID already exists.
   * @throws Exception If there is an error saving the device details.
   */
  @Override
  public Inventory addDevice(DeviceDetails deviceDetails) throws Exception {
    Optional<Inventory> existingDevice =
        inventoryRepository.findByProductId(deviceDetails.getProductId());
    if (existingDevice.isPresent()) {
      throw new DuplicateProductIdException(
          BuildErrorMessage.buildErrorMessage(
              ErrorType.RESOURCE_EXISTS_ERROR,
              ErrorCode.RESOURCE_IN_USE,
              Constants.PRODUCT_ID_ALREADY_EXISTS + deviceDetails.getProductId()));
    }

    Inventory device = new Inventory();
    device.setDevice(deviceDetails.getDevice());
    device.setProvider(deviceDetails.getProvider());
    device.setModel(deviceDetails.getModel());
    device.setType(deviceDetails.getType());
    device.setOs(deviceDetails.getOs());
    device.setSpecifications(deviceDetails.getSpecifications());
    device.setRAM(deviceDetails.getRAM());
    device.setAvailability(deviceDetails.getAvailability());
    device.setProductId(deviceDetails.getProductId());
    device.setPrice(deviceDetails.getPrice());
    device.setDateOfPurchase(deviceDetails.getDateOfPurchase());
    device.setComments(deviceDetails.getComments());
    device.setAccessoryType(deviceDetails.getAccessoryType());
    device.setDeviceNumber(UUID.randomUUID().toString().substring(0, 6).toUpperCase());
    device.setCreatedBy(UserContext.getLoggedInUserEmail());
    try {
      return inventoryRepository.save(device);
    } catch (DuplicateKeyException e) {
      throw new DuplicateProductIdException(
          BuildErrorMessage.buildErrorMessage(
              ErrorType.RESOURCE_EXISTS_ERROR, ErrorCode.RESOURCE_IN_USE, e.getMessage()));
    } catch (Exception e) {
      throw new RuntimeException(
          BuildErrorMessage.buildErrorMessage(
              ErrorType.DB_ERROR,
              ErrorCode.CANNOT_SAVE_CHANGES,
              Constants.ERROR_SAVING_DEVICE_DETAILS));
    }
  }

  /**
   * Retrieves all devices from the inventory.
   *
   * @return List of all Inventory objects representing devices.
   */
  @Override
  public List<Inventory> filterInventory(
      int pageNumber,
      int pageSize,
      Device device,
      String provider,
      Availability availability,
      String os,
      String searchTerm) {
    try {

      Query query = new Query();

      if (device != null) {
        query.addCriteria(Criteria.where("device").is(device));
      }
      if (provider != null && StringUtils.hasText(provider)) {
        query.addCriteria(
            Criteria.where("provider").is(provider)); // Case-insensitive regex for provider
      }
      if (availability != null) {
        query.addCriteria(Criteria.where("availability").is(availability));
      }
      if (os != null && StringUtils.hasText(os)) {
        query.addCriteria(Criteria.where("os").is(os));
      }
      if (searchTerm != null && !searchTerm.isEmpty()) {
        query.addCriteria(
            Criteria.where("deviceNumber").regex(".*" + Pattern.quote(searchTerm) + ".*", "i"));
      }

      int skip = (pageNumber - 1) * pageSize;
      query.skip(skip).limit(pageSize);

      return mongoTemplate.find(query, Inventory.class);

    } catch (Exception e) {
      throw new RuntimeException(
          BuildErrorMessage.buildErrorMessage(
              ErrorType.DB_ERROR,
              ErrorCode.UNABLE_TO_FETCH_DETAILS,
              Constants.ERROR_FETCHING_DEVICE_DETAILS));
    }
  }

  @Override
  public Long getTotalInventorySize(
      Device device,
      String provider,
      Availability availability,
      String os,
      String organizationId,
      String searchTerm) {
    Query query = new Query();

    if (device != null) {
      query.addCriteria(Criteria.where("device").is(device));
    }

    if (availability != null) {
      query.addCriteria(Criteria.where("availability").is(availability));
    }

    if (os != null && !os.isEmpty()) {
      query.addCriteria(Criteria.where("os").is(os));
    }

    if (organizationId != null) {
      query.addCriteria(Criteria.where("organizationId").is(organizationId));
    }

    if (provider != null && !provider.isEmpty()) {
      query.addCriteria(Criteria.where("provider").is(provider));
    }
    if (searchTerm != null && !searchTerm.isEmpty()) {
      query.addCriteria(
          Criteria.where("deviceNumber").regex(".*" + Pattern.quote(searchTerm) + ".*", "i"));
    }

    return mongoTemplate.count(query, Inventory.class);
  }

  /**
   * Retrieves all devices belonging to the logged-in user's organization.
   *
   * @param organizationId ID of the organization to filter devices.
   * @return List of Inventory objects belonging to the organization.
   */
  public List<Inventory> getAllDevicesByOrganizationId(String organizationId) {
    try {
      return inventoryRepository.findByOrganizationId(
          UserContext.getLoggedInUserOrganization().get("id").toString());
    } catch (Exception e) {
      throw new RuntimeException(
          BuildErrorMessage.buildErrorMessage(
              ErrorType.DB_ERROR,
              ErrorCode.UNABLE_TO_FETCH_DETAILS,
              Constants.ERROR_FETCHING_DEVICE_DETAILS));
    }
  }

  /**
   * Deletes an existing device from the inventory.
   *
   * @param id ID of the device to be deleted.
   * @return ResponseEntity with the deleted Inventory object if successful, or not found if no
   *     device with the given ID exists.
   * @throws Exception If there is an error deleting the device details.
   */
  @Override
  public ResponseEntity<Inventory> deleteExistingDeviceDetails(String id) throws Exception {
    try {
      String loggedInUserOrganizationId =
          (String) UserContext.getLoggedInUserOrganization().get("id");
      Optional<Inventory> optionalDevice =
          inventoryRepository.findByIdAndOrganizationId(id, loggedInUserOrganizationId);
      if (optionalDevice.isPresent()) {
        Inventory inventory = optionalDevice.get();
        inventoryRepository.delete(inventory);
        return ResponseEntity.ok().body(inventory);
      } else {
        throw new ResourceNotFoundException(
            BuildErrorMessage.buildErrorMessage(
                ErrorType.RESOURCE_NOT_FOUND_ERROR,
                ErrorCode.RESOURCE_NOT_FOUND,
                Constants.DEVICE_NOT_FOUND + " with ID " + id));
      }
    } catch (Exception e) {
      throw new RuntimeException(
          BuildErrorMessage.buildErrorMessage(
              ErrorType.DB_ERROR,
              ErrorCode.CANNOT_DELETE_SELF_ORGANIZATION,
              Constants.ERROR_DELETING_DEVICE_DETAILS));
    }
  }

  /**
   * Updates details of an existing device in the inventory.
   *
   * @param updatedDeviceDetails Updated details of the device.
   * @param deviceId ID of the device to be updated.
   * @return The updated Inventory object.
   * @throws DuplicateProductIdException If a product with the updated ID already exists.
   * @throws Exception If there is an error updating the device details.
   */
  @Override
  public Inventory updateDeviceDetails(DeviceDetails updatedDeviceDetails, String deviceId)
      throws Exception {
    try {
      if (updatedDeviceDetails.getProductId() != null) {
        Optional<Inventory> productIdCheck =
            inventoryRepository.findByProductId(updatedDeviceDetails.getProductId());
        if (productIdCheck.isPresent()) {
          throw new DuplicateProductIdException(
              BuildErrorMessage.buildErrorMessage(
                  ErrorType.CONFLICT_ERROR,
                  ErrorCode.RESOURCE_EXISTS_ERROR,
                  Constants.PRODUCT_ID_ALREADY_EXISTS + updatedDeviceDetails.getProductId()));
        }
      }
      String loggedInUserOrganizationId =
          (String) UserContext.getLoggedInUserOrganization().get("id").toString();
      Optional<Inventory> optionalDeviceDetails =
          inventoryRepository.findByIdAndOrganizationId(deviceId, loggedInUserOrganizationId);
      if (optionalDeviceDetails.isPresent()) {
        Inventory existingDevice = optionalDeviceDetails.get();
        String actualProductId = existingDevice.getProductId();

        Class<?> updatedDeviceDetailsClass = updatedDeviceDetails.getClass();
        Class<?> existingDeviceClass = existingDevice.getClass();
        for (Field field : updatedDeviceDetailsClass.getDeclaredFields()) {
          field.setAccessible(true);
          Object value = field.get(updatedDeviceDetails);
          if (value != null) {
            Field existingField = existingDeviceClass.getDeclaredField(field.getName());
            existingField.setAccessible(true);
            existingField.set(existingDevice, value);
          }
        }
        if (updatedDeviceDetails.getProductId() == null
            || updatedDeviceDetails.getProductId().isEmpty()) {
          existingDevice.setProductId(actualProductId);
        }

        return inventoryRepository.save(existingDevice);
      } else {
        throw new ResourceNotFoundException(
            BuildErrorMessage.buildErrorMessage(
                ErrorType.RESOURCE_NOT_FOUND_ERROR,
                ErrorCode.RESOURCE_NOT_FOUND,
                Constants.DEVICE_NOT_FOUND + " with ID " + deviceId));
      }
    } catch (DuplicateProductIdException e) {
      throw new DuplicateProductIdException(e.getMessage());
    } catch (Exception e) {
      throw new Exception(
          BuildErrorMessage.buildErrorMessage(
              ErrorType.DB_ERROR,
              ErrorCode.CANNOT_SAVE_CHANGES,
              Constants.ERROR_UPDATING_DEVICE_DETAILS));
    }
  }
}
