import {
  InputLabelContainer,
  TextInput,
} from '../../styles/DocumentTabStyles.style';
import { DeviceDetails } from '../../entities/InventoryEntity';
import { ExpenseAddFormMainContainer } from '../../styles/ExpenseManagementStyles.style';
import { Button } from '../../styles/CommonStyles.style';
import { useUser } from '../../context/UserContext';
import { INVENTORY_MODULE } from '../../constants/PermissionConstants';
import { removeUnderScore } from '../../utils/stringUtils';
import { formatDate } from '../../utils/dateFormatter';
import useKeyPress from '../../service/keyboardShortcuts/onKeyPress';
import { hasPermission } from '../../utils/permissionCheck';

type PreviewInventoryFormProps = {
  formData: DeviceDetails;
  handleClose: () => void;
  handleEdit: () => void;
};

const PreviewInventoryForm = (props: PreviewInventoryFormProps) => {
  const { user } = useUser();

  const handleEditClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    props.handleEdit(); // Call the callback function provided by the parent component
  };
  const hasEditPermission =
    user && hasPermission(user, INVENTORY_MODULE.UPDATE_DEVICE);

  useKeyPress(27, () => {
    props.handleClose();
  });

  return (
    <ExpenseAddFormMainContainer>
      <div className="formInputs">
        <div>
          <InputLabelContainer>
            <label>Device no.</label>
            <TextInput
              type="text"
              name="deviceNumber"
              className="largeInput grayText"
              value={props.formData.deviceNumber}
              readOnly
            />
          </InputLabelContainer>
          {props.formData.device === 'ACCESSORIES' && (
            <InputLabelContainer>
              <label>Accessory Type</label>
              <TextInput
                type="text"
                name="accessoryType"
                className="largeInput grayText"
                value={
                  props.formData.accessoryType
                    ? removeUnderScore(props.formData.accessoryType)
                    : ''
                }
                readOnly
              />
            </InputLabelContainer>
          )}
          <InputLabelContainer>
            <label>Type</label>
            <TextInput
              type="text"
              name="type"
              className="largeInput grayText"
              value={removeUnderScore(props.formData.type)}
              readOnly
            />
          </InputLabelContainer>
          <InputLabelContainer>
            <label>Specifications</label>
            <TextInput
              type="text"
              name="specifications"
              className="largeInput grayText"
              value={props.formData.specifications}
              readOnly
            />
          </InputLabelContainer>
          <InputLabelContainer>
            <label>Availability</label>
            <TextInput
              type="text"
              name="availability"
              className="largeInput grayText"
              value={removeUnderScore(props.formData.availability)}
              readOnly
            />
          </InputLabelContainer>
          <InputLabelContainer>
            <label>Date of Purchase</label>
            <TextInput
              type="text"
              name="dateOfPurchase"
              value={
                props.formData.dateOfPurchase
                  ? formatDate(
                      new Date(props.formData.dateOfPurchase).toDateString()
                    )
                  : ''
              }
              className="largeInput grayText"
              readOnly
            />
          </InputLabelContainer>
          <InputLabelContainer>
            <label>Price</label>
            <TextInput
              type="number"
              name="price"
              className="largeInput grayText"
              value={props.formData.price}
              readOnly
            />
          </InputLabelContainer>
          {props.formData.device !== 'ACCESSORIES' && (
            <InputLabelContainer>
              <label>Comments</label>
              <TextInput
                type="text"
                name="comments"
                className="largeInput grayText"
                value={props.formData.comments}
                readOnly
              />
            </InputLabelContainer>
          )}
        </div>
        <div>
          <InputLabelContainer>
            <label>Device</label>
            <TextInput
              type="text"
              name="device"
              className="largeInput grayText"
              value={removeUnderScore(props.formData.device)}
              readOnly
            />
          </InputLabelContainer>
          <InputLabelContainer>
            <label>Provider</label>
            <TextInput
              type="text"
              name="provider"
              className="largeInput grayText"
              value={removeUnderScore(props.formData.provider)}
              readOnly
            />
          </InputLabelContainer>
          <InputLabelContainer>
            <label>Model</label>
            <TextInput
              type="text"
              name="model"
              className="largeInput grayText"
              value={props.formData.model}
              readOnly
            />
          </InputLabelContainer>
          <InputLabelContainer>
            <label>
              OS
              {['DESKTOP', 'MUSIC_SYSTEM', 'PRINTER', 'ACCESSORIES'].includes(
                props.formData.device
              ) && null}
            </label>
            <TextInput
              type="text"
              name="os"
              className="largeInput grayText"
              value={props.formData.os ? props.formData.os : '-'}
              readOnly
              disabled={
                props.formData.device === 'ACCESSORIES' ||
                props.formData.device.toUpperCase() === 'MUSIC SYSTEM'
              }
            />
          </InputLabelContainer>
          <InputLabelContainer>
            <label>
              RAM
              {['DESKTOP', 'MUSIC_SYSTEM', 'PRINTER', 'ACCESSORIES'].includes(
                props.formData.device
              ) && null}
            </label>
            <TextInput
              type="text"
              name="ram"
              className="largeInput grayText"
              value={props.formData.ram ? props.formData.ram : '-'}
              readOnly
              disabled={props.formData.device === 'ACCESSORIES'}
            />
          </InputLabelContainer>
          <InputLabelContainer>
            <label>Product ID/Serial No.</label>
            <TextInput
              type="text"
              name="productId"
              className="largeInput grayText"
              value={props.formData.productId}
              readOnly
            />
          </InputLabelContainer>
          {props.formData.device === 'ACCESSORIES' && (
            <InputLabelContainer>
              <label>Comments</label>
              <TextInput
                type="text"
                name="comments"
                className="largeInput grayText"
                value={props.formData.comments}
                readOnly
              />
            </InputLabelContainer>
          )}
        </div>
      </div>
      <div className="formButtons">
        <Button onClick={props.handleClose} fontSize="16px" width="145px">
          Cancel
        </Button>
        {hasEditPermission && (
          <Button
            onClick={handleEditClick}
            fontSize="16px"
            width="145px"
            className="submit"
          >
            Edit
          </Button>
        )}
      </div>
    </ExpenseAddFormMainContainer>
  );
};

export default PreviewInventoryForm;
