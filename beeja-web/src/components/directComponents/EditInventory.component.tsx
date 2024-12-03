import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../../styles/CommonStyles.style';
import {
  InputLabelContainer,
  TextInput,
  ValidationText,
} from '../../styles/DocumentTabStyles.style';
import { ExpenseAddFormMainContainer } from '../../styles/ExpenseManagementStyles.style';
import { CalenderIconDark } from '../../svgs/ExpenseListSvgs.svg';
import Calendar from '../reusableComponents/Calendar.component';
import { putInventory } from '../../service/axiosInstance';
import ToastMessage from '../reusableComponents/ToastMessage.component';
import {
  DeviceDetails,
  IUpdateDeviceDetails,
} from '../../entities/InventoryEntity';
import SpinAnimation from '../loaders/SprinAnimation.loader';
import axios from 'axios';

type EditInventoryFormProps = {
  initialFormData: DeviceDetails; // Initial data to populate the form
  handleClose: () => void;
  handleSuccessMessage: () => void;
  updateInventoryList: () => void;
};

const EditInventoryForm: React.FC<EditInventoryFormProps> = ({
  initialFormData,
  handleClose,
  handleSuccessMessage,
  updateInventoryList,
}) => {
  const calendarFromRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<DeviceDetails>(initialFormData);
  const [isCalenderOpen, setIsCalenderOpen] = useState(false);
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [deviceToUpdate, setDeviceToUpdate] = useState<IUpdateDeviceDetails>(
    {} as IUpdateDeviceDetails
  );

  const handleShowErrorMessage = () => {
    setShowErrorMessage(!showErrorMessage);
    setTimeout(() => {
      setShowErrorMessage(false);
    }, 2000);
  };

  const handleCalenderOpen = (isOpen: boolean) => {
    setIsCalenderOpen(isOpen);
  };

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const [dateOfPurchase, setDateOfPurchase] = useState<Date | null>(
    initialFormData.dateOfPurchase
      ? new Date(initialFormData.dateOfPurchase)
      : null
  );

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    if (
      (name == 'device' && value == 'MUSIC_SYSTEM') ||
      (name == 'device' && value == 'ACCESSORIES')
    ) {
      setFormData((prevState) => ({
        ...prevState,
        ram: '',
        os: '',
      }));
    }
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    if (
      (name == 'device' && value == 'MUSIC_SYSTEM') ||
      (name == 'device' && value == 'ACCESSORIES')
    ) {
      setDeviceToUpdate((prevState) => ({
        ...prevState,
        ram: '',
        os: '',
      }));
    }
    setDeviceToUpdate((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  useEffect(() => {
    if (initialFormData.productId == deviceToUpdate.productId) {
      setDeviceToUpdate((prevState) => ({
        ...prevState,
        productId: null,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.productId]);

  const handleSubmitData = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    setIsResponseLoading(true);
    try {
      await putInventory(initialFormData.id, deviceToUpdate);
      handleSuccessMessage();
      handleClose();
      updateInventoryList();
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.data.startsWith('Product ID already exists')
      ) {
        setErrorMessage('Product ID already exists');
      } else {
        setErrorMessage('The Inventory hasn’t been uploaded');
      }
      setShowErrorMessage(true);
    } finally {
      setIsResponseLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarFromRef.current &&
        !calendarFromRef.current.contains(event.target as Node)
      ) {
        setIsCalenderOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setFormData(initialFormData);
    setDateOfPurchase(
      initialFormData.dateOfPurchase
        ? new Date(initialFormData.dateOfPurchase)
        : null
    );
  }, [initialFormData]);

  return (
    <>
      <ExpenseAddFormMainContainer onSubmit={handleSubmitData}>
        <div className="formInputs">
          <div>
            <InputLabelContainer>
              <label>
                Device
                <ValidationText className="star">*</ValidationText>
              </label>
              <select
                className="selectoption largeSelectOption"
                name="device"
                value={formData.device}
                onChange={handleChange}
                required
              >
                <option value="">Select Device</option>
                <option value="LAPTOP">Laptop</option>
                <option value="MOBILE">Mobile</option>
                <option value="DESKTOP">Desktop</option>
                <option value="PRINTER">Printer</option>
                <option value="MUSIC_SYSTEM">Music System</option>
                <option value="TABLET">Tablet</option>
                <option value="ACCESSORIES">Accessories</option>
              </select>
            </InputLabelContainer>
            {formData.device === 'ACCESSORIES' && (
              <InputLabelContainer>
                <label>
                  Accessory Type
                  <ValidationText className="star">*</ValidationText>
                </label>
                <select
                  className="selectoption largeSelectOption"
                  name="accessoryType"
                  value={formData.accessoryType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Accessory Type</option>
                  <option value="KEYBOARD">Keyboard</option>
                  <option value="CABLE">Cable</option>
                  <option value="HEADSET">Headset</option>
                  <option value="MOUSE">Mouse</option>
                  <option value="USB_STICKS">USB sticks</option>
                </select>
              </InputLabelContainer>
            )}
            <InputLabelContainer>
              <label>
                Type
                <ValidationText className="star">*</ValidationText>
              </label>
              <select
                className="selectoption largeSelectOption"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="NEW">New</option>
                <option value="OLD">Old</option>
              </select>
            </InputLabelContainer>
            <InputLabelContainer>
              <label>
                Specifications
                <ValidationText className="star">*</ValidationText>
              </label>
              <TextInput
                type="text"
                name="specifications"
                placeholder="Ex: 16 Inches Display"
                className="largeInput"
                value={formData.specifications}
                onChange={handleChange}
                required
              />
            </InputLabelContainer>
            <InputLabelContainer>
              <label>
                Availability
                <ValidationText className="star">*</ValidationText>
              </label>
              <select
                className="selectoption largeSelectOption"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                required
              >
                <option value="">Select Availability</option>
                <option value="YES">Yes</option>
                <option value="NO">No</option>
              </select>
            </InputLabelContainer>
            <InputLabelContainer>
              <label>
                Date of Purchase
                <ValidationText className="star">*</ValidationText>
              </label>
              <span ref={calendarFromRef} className="calendarField">
                <TextInput
                  type="text"
                  placeholder="Enter Date"
                  name="dateOfPurchase"
                  value={dateOfPurchase ? formatDate(dateOfPurchase) : ''}
                  onFocus={() => handleCalenderOpen(true)}
                  required
                  autoComplete="off"
                />
                <span
                  className="iconArea"
                  onClick={() => handleCalenderOpen(true)}
                >
                  <CalenderIconDark />
                </span>
                <div className="calendarSpace" ref={calendarFromRef}>
                  {isCalenderOpen && (
                    <Calendar
                      title="Purchase Date"
                      handleDateInput={(selectedDate) => {
                        if (selectedDate instanceof Date) {
                          setDateOfPurchase(selectedDate);
                          setDeviceToUpdate((prevState) => ({
                            ...prevState,
                            dateOfPurchase: selectedDate,
                          }));
                        }
                        handleCalenderOpen(false);
                      }}
                      selectedDate={dateOfPurchase}
                      maxDate={new Date()}
                      handleCalenderChange={() => {}}
                    />
                  )}
                </div>
              </span>
            </InputLabelContainer>
            <InputLabelContainer>
              <label>
                Price
                <ValidationText className="star">*</ValidationText>
              </label>
              <TextInput
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder={'Enter Price (₹)'}
                required
                autoComplete="off"
                onKeyDown={(event) => {
                  const allowedCharacters = /^[0-9.-]+$/;
                  if (
                    !allowedCharacters.test(event.key) &&
                    event.key !== 'Backspace'
                  ) {
                    event.preventDefault();
                  }
                  if (event.key === 'e') {
                    event.preventDefault();
                  }
                }}
              />
            </InputLabelContainer>
          </div>
          <div>
            <InputLabelContainer>
              <label>
                Provider
                <ValidationText className="star">*</ValidationText>
              </label>
              <TextInput
                type="text"
                name="provider"
                placeholder="Ex: Apple"
                className="largeInput"
                value={formData.provider}
                onChange={handleChange}
                required
              />
            </InputLabelContainer>
            <InputLabelContainer>
              <label>
                Model
                <ValidationText className="star">*</ValidationText>
              </label>
              <TextInput
                type="text"
                name="model"
                placeholder="Ex: M3 Pro"
                className="largeInput"
                value={formData.model}
                onChange={handleChange}
                required
              />
            </InputLabelContainer>
            <InputLabelContainer>
              <label>
                OS
                {['DESKTOP', 'MUSIC_SYSTEM', 'PRINTER', 'ACCESSORIES'].includes(
                  formData.device
                ) ? null : (
                  <ValidationText className="star">*</ValidationText>
                )}
              </label>
              <TextInput
                type="text"
                name="os"
                placeholder="Ex: Mac OS"
                value={formData.os ? formData.os : ''}
                className="largeInput"
                onChange={handleChange}
                disabled={
                  formData.device === 'MUSIC_SYSTEM' ||
                  formData.device === 'ACCESSORIES'
                }
                required={
                  ![
                    'PRINTER',
                    'MUSIC_SYSTEM',
                    'DESKTOP',
                    'Accessories',
                  ].includes(formData.device)
                }
              />
            </InputLabelContainer>
            <InputLabelContainer>
              <label>
                RAM
                {['DESKTOP', 'MUSIC_SYSTEM', 'PRINTER', 'ACCESSORIES'].includes(
                  formData.device
                ) ? null : (
                  <ValidationText className="star">*</ValidationText>
                )}
              </label>
              <TextInput
                type="text"
                name="ram"
                placeholder="Enter in GB"
                value={formData.ram ? formData.ram : ''}
                className="largeInput"
                onChange={handleChange}
                disabled={formData.device === 'ACCESSORIES'}
                required={
                  ![
                    'PRINTER',
                    'DESKTOP',
                    'MUSIC_SYSTEM',
                    'Accessories',
                  ].includes(formData.device)
                }
                onKeyDown={(event) => {
                  const allowedCharacters = /^[0-9.-]+$/;
                  if (
                    !allowedCharacters.test(event.key) &&
                    event.key !== 'Backspace'
                  ) {
                    event.preventDefault();
                  }
                  if (event.key === 'e') {
                    event.preventDefault();
                  }
                }}
              />
            </InputLabelContainer>
            <InputLabelContainer>
              <label>
                Product ID/Serial No.
                <ValidationText className="star">*</ValidationText>
              </label>
              <TextInput
                type="text"
                name="productId"
                placeholder="Enter Product Id of Device"
                className="largeInput"
                value={formData.productId}
                onChange={handleChange}
                required
              />
            </InputLabelContainer>
            <InputLabelContainer>
              <label>Comments</label>
              <TextInput
                type="text"
                name="comments"
                value={formData.comments}
                className="largeInput"
                placeholder="Type your comment here (Optional)"
                onChange={handleChange}
              />
            </InputLabelContainer>
          </div>
        </div>
        <div className="formButtons">
          <Button onClick={handleClose} fontSize="16px" width="145px">
            Cancel
          </Button>
          <Button className="submit" fontSize="16px" width="145px">
            Update
          </Button>
        </div>
      </ExpenseAddFormMainContainer>
      {showErrorMessage && (
        <ToastMessage
          messageType="error"
          messageBody={errorMessage}
          messageHeading="Update Unsuccessfull"
          handleClose={handleShowErrorMessage}
        />
      )}
      {isResponseLoading && <SpinAnimation />}
    </>
  );
};
export default EditInventoryForm;
