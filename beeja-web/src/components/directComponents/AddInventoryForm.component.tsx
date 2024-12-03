import { useEffect, useRef, useState } from 'react';
import { Button } from '../../styles/CommonStyles.style';
import {
  InputLabelContainer,
  TextInput,
  ValidationText,
} from '../../styles/DocumentTabStyles.style';
import { ExpenseAddFormMainContainer } from '../../styles/ExpenseManagementStyles.style';
import { CalenderIconDark } from '../../svgs/ExpenseListSvgs.svg';
import Calendar from '../reusableComponents/Calendar.component';
import { postInventory } from '../../service/axiosInstance';
import ToastMessage from '../reusableComponents/ToastMessage.component';
import { DeviceDetails } from '../../entities/InventoryEntity';
import SpinAnimation from '../loaders/SprinAnimation.loader';
import axios from 'axios';
import useKeyCtrl from '../../service/keyboardShortcuts/onKeySave';
import useKeyPress from '../../service/keyboardShortcuts/onKeyPress';

type AddInventoryFormProps = {
  handleClose: () => void;
  handleSuccessMessage: () => void;
};

const AddInventoryForm = (props: AddInventoryFormProps) => {
  const calendarFromRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<DeviceDetails>({} as DeviceDetails);
  const [isCalenderOpen, setIsCalenderOpen] = useState(false);
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const handleShowErrorMessage = () => {
    setShowErrorMessage(!showErrorMessage);
  };
  const handleCalenderOpen = (isOpen: boolean) => {
    setIsCalenderOpen(isOpen);
  };
  const [errorMessage, setErrorMessage] = useState<string>('');

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };
  const [dateOfPurchase, setDateOfPurchase] = useState<Date | null>(null);
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    if (name === 'purchaseDate') {
      setDateOfPurchase(value ? new Date(value) : null);
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };
  const handleSubmitData = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setIsResponseLoading(true);
    try {
      const data: DeviceDetails = {
        ...formData,
        device: formData.device.toUpperCase(),
        type: formData.type.toUpperCase(),
        availability: formData.availability.toUpperCase(),
        accessoryType: formData.accessoryType?.toUpperCase(),
        dateOfPurchase: formData.dateOfPurchase,
      };
      await postInventory(data);
      setIsResponseLoading(false);

      props.handleSuccessMessage();
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.data.startsWith('Product ID already exists')
      ) {
        setErrorMessage('Product ID already exists');
      } else {
        setErrorMessage('The Inventory hasn’t been uploaded');
      }
      setIsResponseLoading(false);
      handleShowErrorMessage();
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
  useKeyCtrl('s', () =>
    handleSubmitData(event as unknown as React.FormEvent<HTMLFormElement>)
  );
  useKeyPress(27, () => {
    props.handleClose();
  });
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
                <option value="Laptop">Laptop</option>
                <option value="Mobile">Mobile</option>
                <option value="Desktop">Desktop</option>
                <option value="Printer">Printer</option>
                <option value="MUSIC_SYSTEM">Music System</option>
                <option value="Tablet">Tablet</option>
                <option value="Accessories">Accessories</option>
              </select>
            </InputLabelContainer>
            {formData.device === 'Accessories' && (
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
                  <option value="Keyboard">Keyboard</option>
                  <option value="Cable">Cable</option>
                  <option value="Headset">Headset</option>
                  <option value="Mouse">Mouse</option>
                  <option value="USB_sticks">USB sticks</option>
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
                <option value="New">New</option>
                <option value="Old">Old</option>
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
                <option value="Yes">Yes</option>
                <option value="No">No</option>
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
                          setFormData((prevState) => ({
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
                placeholder={'Enter Price (₹)'}
                required
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
                {['Desktop', 'MUSIC_SYSTEM', 'Printer', 'Accessories'].includes(
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
                  formData.device === 'Accessories'
                }
                required={
                  ![
                    'Printer',
                    'MUSIC_SYSTEM',
                    'Desktop',
                    'Accessories',
                  ].includes(formData.device)
                }
              />
            </InputLabelContainer>
            <InputLabelContainer>
              <label>
                RAM
                {['Desktop', 'MUSIC_SYSTEM', 'Printer', 'Accessories'].includes(
                  formData.device
                ) ? null : (
                  <ValidationText className="star">*</ValidationText>
                )}
              </label>
              <TextInput
                type="text"
                placeholder="Enter in GB"
                name="ram"
                value={formData.ram ? formData.ram : ''}
                className="largeInput"
                onChange={handleChange}
                disabled={formData.device === 'Accessories'}
                autoComplete="off"
                required={
                  ![
                    'Printer',
                    'Desktop',
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
          <Button onClick={props.handleClose}>Cancel</Button>
          <Button className="submit">Submit</Button>
        </div>
      </ExpenseAddFormMainContainer>
      {showErrorMessage && (
        <ToastMessage
          messageType="error"
          messageBody={errorMessage}
          messageHeading="Upload Unsuccessfull"
          handleClose={handleShowErrorMessage}
        />
      )}
      {isResponseLoading && <SpinAnimation />}
    </>
  );
};
export default AddInventoryForm;
