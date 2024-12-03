import React, { useEffect, useRef, useState } from 'react';
import {
  BorderDivLine,
  TabContentEditArea,
  TabContentMainContainer,
  TabContentMainContainerHeading,
} from '../../styles/MyProfile.style';

import {
  CheckBoxOnSVG,
  CloseIcon,
  CloudUpload,
  CrossMarkSVG,
  EditWhitePenSVG,
} from '../../svgs/CommonSvgs.svs';
import {
  Input,
  Select,
  Row,
  Label,
  Container,
  Address,
  ProfileHeading,
  FileUploadSection,
  Logo,
  LogoText,
} from '../../styles/OrganizationSettingsStyles.style';
import { IOrganization } from '../../entities/OrganizationEntity';
import { useUser } from '../../context/UserContext';
import {
  downloadOrgFile,
  getOrganizationById,
  updateOrganizationById,
} from '../../service/axiosInstance';
import SpinAnimation from '../loaders/SprinAnimation.loader';
import { UploadReceiptIcon } from '../../svgs/ExpenseListSvgs.svg';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';
import {
  isValidESINumber,
  isValidEmail,
  isValidGSTNumber,
  isValidLINNumber,
  isValidPFNumber,
  isValidPINCode,
  isValidPanCardNo,
  isValidTANNumber,
  isValidURL,
} from '../../utils/formInputValidators';
import { usePreferences } from '../../context/PreferencesContext';
import { hasPermission } from '../../utils/permissionCheck';
import { ORGANIZATION_MODULE } from '../../constants/PermissionConstants';
import { useTranslation } from 'react-i18next';

export const CompanyProfile = () => {
  const [isEditModeOn, setEditModeOn] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<IOrganization>(
    {} as IOrganization
  );
  const [tempOrganization, setTempOrganization] = useState<IOrganization>(
    {} as IOrganization
  );
  const { user } = useUser();
  const { t } = useTranslation();
  const { preferences } = usePreferences();
  const [updatedOrganization, setUpdatedOrganization] = useState<IOrganization>(
    {} as IOrganization
  );

  const [isUpdateResponseLoading, setIsUpdateResponseLoading] = useState(false);

  const fetchOrganization = async () => {
    setIsUpdateResponseLoading(true);
    try {
      const response = await getOrganizationById(
        user ? user.organizations.id : ''
      );
      setCompanyProfile(response.data);
      setTempOrganization(response.data);
      setIsUpdateResponseLoading(false);
    } catch (error) {
      setIsUpdateResponseLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganization();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleIsEditModeOn = () => {
    setEditModeOn(!isEditModeOn);
  };

  const handleCloseEditMode = () => {
    setCompanyProfile(tempOrganization);
    setUpdatedOrganization({} as IOrganization);
    setEditModeOn(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name.startsWith('address')) {
      const addr: string[] = name.split('.');
      setCompanyProfile(
        (prevState) =>
          ({
            ...prevState,
            address: {
              ...prevState.address,
              [addr[1]]: value,
            },
          }) as IOrganization
      );
      setUpdatedOrganization(
        (prevState) =>
          ({
            ...prevState,
            address: {
              ...prevState.address,
              [addr[1]]: value,
            },
          }) as IOrganization
      );
      return;
    }
    if (name.startsWith('accounts')) {
      const accountsKey: string[] = name.split('.');
      setCompanyProfile(
        (prevState) =>
          ({
            ...prevState,
            accounts: {
              ...prevState.accounts,
              [accountsKey[1]]: value,
            },
          }) as IOrganization
      );
      setUpdatedOrganization(
        (prevState) =>
          ({
            ...prevState,
            accounts: {
              ...prevState.accounts,
              [accountsKey[1]]: value,
            },
          }) as IOrganization
      );
      return;
    }
    setCompanyProfile((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setUpdatedOrganization((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const imageInputRef = useRef<HTMLInputElement>(null);
  const handleImageDivClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };
  const [file, setFile] = useState<File | undefined>();

  const handleFile = (files: FileList | null) => {
    if (files && files.length > 0) {
      setFile(files[0]);
    } else {
      setFile(undefined);
    }
  };

  const [nameError, setNameError] = useState('');
  const [panError, setPanError] = useState('');
  const [pfError, setPFError] = useState<string>('');
  const [tanError, setTANError] = useState<string>('');
  const [esiError, setESIError] = useState<string>('');
  const [gstError, setGSTError] = useState<string>('');
  const [linError, setLINError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [websiteError, setWebsiteError] = useState<string>('');
  const [pinError, setPINError] = useState<string>('');

  const handleSubmitCompanyProfile = async () => {
    let hasErrors = false;

    // Reset error states
    setNameError('');
    setPanError('');
    setPFError('');
    setTANError('');
    setESIError('');
    setGSTError('');
    setLINError('');
    setEmailError('');
    setWebsiteError('');

    if (
      (updatedOrganization.name == null || updatedOrganization.name == '') &&
      (companyProfile.name == null || companyProfile.name == '')
    ) {
      setNameError('Name is mandatory');
      hasErrors = true;
    }
    if (updatedOrganization.address && updatedOrganization.address.pinCode) {
      if (!isValidPINCode(updatedOrganization.address.pinCode.toString())) {
        setPINError('Enter Valid PIN');
        hasErrors = true;
      } else {
        setPINError('');
      }
    }
    if (
      updatedOrganization.accounts &&
      updatedOrganization.accounts.panNumber
    ) {
      if (
        !isValidPanCardNo(updatedOrganization.accounts.panNumber.toUpperCase())
      ) {
        setPanError('PAN number must be in format of ABCD19008L');
        hasErrors = true;
      } else {
        setPanError('');
      }
    }
    if (updatedOrganization.accounts && updatedOrganization.accounts.pfNumber) {
      if (
        !isValidPFNumber(updatedOrganization.accounts.pfNumber.toUpperCase())
      ) {
        setPFError('PF number must be in format of MAMUM00641480000001258');
        hasErrors = true;
      } else {
        setPFError('');
      }
    }
    if (
      updatedOrganization.accounts &&
      updatedOrganization.accounts.tanNumber
    ) {
      if (
        !isValidTANNumber(updatedOrganization.accounts.tanNumber.toUpperCase())
      ) {
        setTANError('TAN number must be in format of ABCD12345E');
        hasErrors = true;
      } else {
        setTANError('');
      }
    }
    if (
      updatedOrganization.accounts &&
      updatedOrganization.accounts.esiNumber
    ) {
      if (
        !isValidESINumber(updatedOrganization.accounts.esiNumber.toUpperCase())
      ) {
        setESIError(
          'ESI number must be a 17-digit numeric value, Ex: 31001234560000001'
        );
        hasErrors = true;
      } else {
        setESIError('');
      }
    }
    if (
      updatedOrganization.accounts &&
      updatedOrganization.accounts.gstNumber
    ) {
      if (
        !isValidGSTNumber(updatedOrganization.accounts.gstNumber.toUpperCase())
      ) {
        setGSTError(
          'GST number must be a 15-character alphanumeric value, e.g., 22AAAAA0000A1Z5'
        );
        hasErrors = true;
      } else {
        setGSTError('');
      }
    }
    if (
      updatedOrganization.accounts &&
      updatedOrganization.accounts.linNumber
    ) {
      if (
        !isValidLINNumber(updatedOrganization.accounts.linNumber.toUpperCase())
      ) {
        setLINError(
          'LIN number must be a 10-digit numeric value, Ex: 1234567890'
        );
        hasErrors = true;
      } else {
        setLINError('');
      }
    }
    if (updatedOrganization.website) {
      if (!isValidURL(updatedOrganization.website)) {
        setWebsiteError('Invalid URL format, Ex: https://example.com');
        hasErrors = true;
      } else {
        setWebsiteError('');
      }
    }
    if (
      updatedOrganization.email ||
      companyProfile.email == '' ||
      companyProfile.email == null
    ) {
      if (!isValidEmail(updatedOrganization.email)) {
        setEmailError('Provide Valid Email');
        hasErrors = true;
      } else {
        setEmailError('');
      }
    }

    if (hasErrors) {
      return;
    }

    setIsUpdateResponseLoading(true);
    const formData = new FormData();
    if (updatedOrganization) {
      const updatedOrganizationJSON = JSON.stringify(updatedOrganization);
      formData.append('organizationFields', updatedOrganizationJSON);
    }
    if (file) {
      formData.append('logo', file);
    }

    toast.promise(
      updateOrganizationById(user ? user.organizations.id : '', formData),
      {
        loading: 'Updating Organization...',
        closeButton: true,
        success: () => {
          fetchOrganization();
          handleCloseEditMode();
          setIsUpdateResponseLoading(false);
          setUpdatedOrganization({} as IOrganization);
          fetchOrgFile();
          setFile(undefined);
          return 'Successfully Updated Organization Profile.';
        },
        error: (error) => {
          setIsUpdateResponseLoading(false);
          if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            if (axiosError.code === 'ERR_NETWORK') {
              return 'Network Error, Please check connection';
            }
            if (axiosError.code === 'ECONNABORTED') {
              return 'Request timeout, Please try again';
            }
          }
          return 'Request Unsuccessful, Please try again';
        },
      }
    );
  };

  const [imageUrl, setImageUrl] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const fetchOrgFile = () => {
    setIsImageLoading(true);
    downloadOrgFile()
      .then((response) => {
        const blobUrl = URL.createObjectURL(response.data);
        setImageUrl(blobUrl);
        setIsImageLoading(false);
      })
      .catch(() => {
        setIsImageLoading(false);
      });
  };

  useEffect(() => {
    fetchOrgFile();
  }, []);
  const [textareaHeight] = useState<string>('43px');

  useEffect(() => {
    const textarea = document.querySelector('textarea');
    const adjustTextareaHeight = () => {
      if (textarea) {
        textarea.style.height = '43px';
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = `${scrollHeight}px`;
      }
    };

    if (textarea) {
      textarea.addEventListener('keyup', adjustTextareaHeight);
    }

    return () => {
      if (!isEditModeOn && textarea) {
        textarea.style.height = 'auto';
      } else if (textarea) {
        textarea.removeEventListener('keyup', adjustTextareaHeight);
      }
    };
  }, [isEditModeOn]);

  return (
    <>
      <ProfileHeading>Profile</ProfileHeading>
      <BorderDivLine width="100%" />
      <TabContentMainContainer>
        <TabContentMainContainerHeading>
          <h4>{t('COMPANY_INFO')}</h4>
          {user &&
            hasPermission(user, ORGANIZATION_MODULE.UPDATE_ORGANIZATION) && (
              <TabContentEditArea>
                {!isEditModeOn ? (
                  <span onClick={handleIsEditModeOn}>
                    <EditWhitePenSVG />
                  </span>
                ) : (
                  <span>
                    <span
                      title="Save Changes"
                      onClick={handleSubmitCompanyProfile}
                    >
                      <CheckBoxOnSVG />
                    </span>
                    <span
                      title="Discard Changes"
                      onClick={() => {
                        handleCloseEditMode();
                        setFile(undefined);
                      }}
                    >
                      <CrossMarkSVG />
                    </span>
                  </span>
                )}
              </TabContentEditArea>
            )}
        </TabContentMainContainerHeading>
        <BorderDivLine width="100%" />
        <Container>
          <Row>
            <Label>{t('COMPANY_LOGO')}</Label>
            <Logo isEditModeOn={isEditModeOn}>
              <FileUploadSection isEditModeOn={isEditModeOn}>
                {isImageLoading ? (
                  t('LOADING')
                ) : (
                  <>
                    {file ? (
                      <div>
                        <span
                          className="imageClearIcon"
                          onClick={() => setFile(undefined)}
                          title={t('CLEAR_IMAGE')}
                        >
                          <CloseIcon theme={preferences?.theme} />
                        </span>
                        <div className="imageArea">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={t('UPLOADED_IMAGE')}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        {imageUrl && (
                          <div
                            className="imageArea"
                            onClick={handleImageDivClick}
                          >
                            <img src={imageUrl} alt={t('FILE_PREVIEW')} />
                          </div>
                        )}
                      </>
                    )}
                    <span
                      style={{ display: file || imageUrl ? 'none' : 'inline' }}
                    >
                      <UploadReceiptIcon theme={preferences?.theme} />
                      <span>Upload Company </span> LOGO
                      <input
                        type="file"
                        name="File"
                        onChange={(e) => handleFile(e.target.files)}
                        ref={imageInputRef}
                        disabled={!isEditModeOn}
                        accept="image/jpeg, image/png"
                      />
                    </span>
                  </>
                )}
              </FileUploadSection>
              <span
                className="uploadIcon"
                onClick={handleImageDivClick}
                title="Upload Logo"
              >
                <CloudUpload theme={preferences?.theme} />
              </span>
              <LogoText>
                {' '}
                This Logo will be displayed on documents such as Payslips and
                TDS worksheets
              </LogoText>
            </Logo>
          </Row>

          <Row>
            <Label>Company Name</Label>
            <div>
              <Input
                name="name"
                type="text"
                value={
                  companyProfile.name && companyProfile.name != null
                    ? companyProfile.name
                    : ''
                }
                onChange={handleInputChange}
                disabled={!isEditModeOn}
                autoComplete="off"
                required
              />
              {nameError.length > 0 && <span>{nameError}</span>}
            </div>
          </Row>
          <Row>
            <Label>Company Address</Label>
            <Input
              name="address.addressOne"
              placeholder={isEditModeOn ? 'Primary Address' : '-'}
              type="text"
              value={
                companyProfile.address &&
                companyProfile.address.addressOne != null
                  ? companyProfile.address.addressOne
                  : ''
              }
              onChange={handleInputChange}
              disabled={!isEditModeOn}
              autoComplete={'photo'}
            />
          </Row>
          <Row>
            <Label></Label>
            <Input
              name="address.addressTwo"
              type="text"
              placeholder={
                isEditModeOn ? 'Address Two (Secondary Address)' : '-'
              }
              value={
                companyProfile.address &&
                companyProfile.address.addressTwo != null
                  ? companyProfile.address.addressTwo
                  : ''
              }
              onChange={handleInputChange}
              disabled={!isEditModeOn}
              autoComplete="off"
            />
          </Row>

          <Row className="styled-input">
            <Label></Label>
            <Address>
              <div>
                <Input
                  name="address.city"
                  type="text"
                  value={
                    companyProfile &&
                    companyProfile.address &&
                    companyProfile.address != null &&
                    companyProfile.address.city != null
                      ? companyProfile.address.city
                      : ''
                  }
                  onKeyDown={(event) => {
                    const allowedCharacters = /^[a-zA-Z\s]+$/;
                    if (
                      !allowedCharacters.test(event.key) &&
                      event.key !== 'Backspace' &&
                      event.key !== 'ArrowLeft' &&
                      event.key !== 'ArrowRight'
                    ) {
                      event.preventDefault();
                    }
                  }}
                  maxLength={20}
                  placeholder={isEditModeOn ? 'City' : '-'}
                  onChange={handleInputChange}
                  disabled={!isEditModeOn}
                  autoComplete="off"
                />
              </div>
              <div>
                <Select
                  name="address.state"
                  value={
                    companyProfile.address &&
                    companyProfile.address.state != null
                      ? companyProfile.address.state
                      : ''
                  }
                  onChange={handleInputChange}
                  disabled={!isEditModeOn}
                >
                  <option value={''}>Select State</option>
                  <option value={'Telangana'}>Telangana</option>
                  <option value={'AP'}>Andhra Pradesh</option>
                  <option value={'Delhi'}>Delhi</option>
                </Select>
              </div>
              <div>
                <Input
                  name="address.pinCode"
                  type="number"
                  placeholder={isEditModeOn ? 'Pin Code' : '-'}
                  value={
                    companyProfile.address &&
                    companyProfile.address.pinCode != null
                      ? companyProfile.address.pinCode
                      : ''
                  }
                  onChange={handleInputChange}
                  disabled={!isEditModeOn}
                  autoComplete="off"
                  onKeyDown={(event) => {
                    const allowedCharacters = /^[0-9]+$/;
                    if (
                      !allowedCharacters.test(event.key) &&
                      event.key !== 'Backspace'
                    ) {
                      event.preventDefault();
                    }
                    if (event.key === 'e') {
                      event.preventDefault();
                    }
                    if (
                      companyProfile.address &&
                      companyProfile.address.pinCode.toString().length >= 6 &&
                      event.key !== 'Backspace'
                    ) {
                      event.preventDefault();
                    }
                  }}
                />
                {pinError.length > 1 && <span>{pinError}</span>}
              </div>
            </Address>
          </Row>

          <Row>
            <Label>Country</Label>
            <Select
              name="address.country"
              value={
                companyProfile.address && companyProfile.address.country != null
                  ? companyProfile.address.country
                  : ''
              }
              onChange={handleInputChange}
              disabled={!isEditModeOn}
            >
              <option value={''}>Select Country</option>
              <option value={'India'}>India</option>
              <option value={'Germany'}>Germany</option>
              <option value={'US'}>US</option>
            </Select>
          </Row>
          <Row>
            <Label>Filing Address</Label>
            <textarea
              name="filingAddress"
              placeholder={
                isEditModeOn
                  ? 'Filing Address (Visible in Payslips, Invoices etc)'
                  : '-'
              }
              value={
                companyProfile.filingAddress &&
                companyProfile.filingAddress != null
                  ? companyProfile.filingAddress
                  : ''
              }
              onChange={handleInputChange}
              disabled={!isEditModeOn}
              autoComplete="off"
              style={{ height: textareaHeight }}
              rows={5}
              maxLength={150}
            />
          </Row>
          <Row>
            <Label>Email</Label>
            <div>
              <Input
                name="email"
                type="email"
                placeholder={isEditModeOn ? 'Ex: help@organization.in' : '-'}
                value={companyProfile.email ? companyProfile.email : ''}
                onChange={handleInputChange}
                disabled={!isEditModeOn}
                autoComplete="off"
                onKeyDown={(event) => {
                  const allowedCharacters = /^[a-zA-Z0-9@._-]+$/;
                  if (
                    !allowedCharacters.test(event.key) &&
                    event.key !== 'Backspace' &&
                    event.key !== 'Tab' &&
                    event.key !== 'ArrowLeft' &&
                    event.key !== 'ArrowRight' &&
                    event.key !== 'Delete'
                  ) {
                    event.preventDefault();
                  }
                }}
              />
              {emailError.length > 1 && <span>{emailError}</span>}
            </div>
          </Row>
          <Row>
            <Label>Website URL</Label>
            <div>
              <Input
                name="website"
                type="url"
                placeholder={isEditModeOn ? 'Ex: https://example.com' : '-'}
                value={companyProfile.website ? companyProfile.website : ''}
                onChange={handleInputChange}
                disabled={!isEditModeOn}
                autoComplete="off"
              />
              {websiteError.length > 1 && <span>{websiteError}</span>}
            </div>
          </Row>
          <Row>
            <Label>PF No.</Label>
            <div>
              <Input
                name="accounts.pfNumber"
                type="text"
                placeholder={isEditModeOn ? 'Enter PF Number' : '-'}
                value={
                  companyProfile.accounts && companyProfile.accounts.pfNumber
                    ? companyProfile.accounts.pfNumber.toUpperCase()
                    : ''
                }
                onChange={handleInputChange}
                disabled={!isEditModeOn}
                autoComplete="off"
                maxLength={22}
                onKeyDown={(event) => {
                  const allowedCharacters = /^[a-zA-Z0-9]+$/;
                  if (
                    !allowedCharacters.test(event.key) &&
                    event.key !== 'Backspace'
                  ) {
                    event.preventDefault();
                  }
                  if (
                    companyProfile.address &&
                    companyProfile.address.pinCode.toString().length >= 22 &&
                    event.key !== 'Backspace'
                  ) {
                    event.preventDefault();
                  }
                }}
              />
              {pfError.length > 1 && <span>{pfError}</span>}
            </div>
          </Row>
          <Row>
            <Label>TAN No.</Label>
            <div>
              <Input
                name="accounts.tanNumber"
                type="text"
                placeholder={isEditModeOn ? 'Enter TAN Number' : '-'}
                value={
                  companyProfile.accounts && companyProfile.accounts.tanNumber
                    ? companyProfile.accounts.tanNumber.toUpperCase()
                    : ''
                }
                onChange={handleInputChange}
                disabled={!isEditModeOn}
                maxLength={10}
                pattern="[A-Za-z0-9]{0,10}"
                autoComplete="off"
                onKeyDown={(event) => {
                  const allowedCharacters = /^[a-zA-Z0-9]+$/;
                  if (
                    !allowedCharacters.test(event.key) &&
                    event.key !== 'Backspace'
                  ) {
                    event.preventDefault();
                  }
                  if (
                    companyProfile.address &&
                    companyProfile.address.pinCode.toString().length >= 10 &&
                    event.key !== 'Backspace'
                  ) {
                    event.preventDefault();
                  }
                }}
              />
              {tanError.length > 1 && <span>{tanError}</span>}
            </div>
          </Row>
          <Row>
            <Label>PAN No.</Label>
            <div>
              <Input
                name="accounts.panNumber"
                placeholder={
                  isEditModeOn ? 'Enter PAN Number  (Ex: ABCDR9115L)' : '-'
                }
                type="text"
                value={
                  companyProfile.accounts && companyProfile.accounts.panNumber
                    ? companyProfile.accounts.panNumber.toUpperCase()
                    : ''
                }
                onChange={handleInputChange}
                disabled={!isEditModeOn}
                maxLength={10}
                autoComplete="off"
                onKeyDown={(event) => {
                  const allowedCharacters = /^[a-zA-Z0-9]+$/;
                  if (
                    !allowedCharacters.test(event.key) &&
                    event.key !== 'Backspace'
                  ) {
                    event.preventDefault();
                  }
                  if (
                    companyProfile.address &&
                    companyProfile.address.pinCode.toString().length >= 10 &&
                    event.key !== 'Backspace'
                  ) {
                    event.preventDefault();
                  }
                }}
              />
              {panError.length > 1 && <span>{panError}</span>}
            </div>
          </Row>
          <Row>
            <Label>ESI No.</Label>
            <div>
              <Input
                name="accounts.esiNumber"
                type="text"
                placeholder={isEditModeOn ? 'Enter ESI Number' : '-'}
                value={
                  companyProfile.accounts && companyProfile.accounts.esiNumber
                    ? companyProfile.accounts.esiNumber.toUpperCase()
                    : ''
                }
                onChange={handleInputChange}
                disabled={!isEditModeOn}
                autoComplete="off"
                maxLength={17}
                onKeyDown={(event) => {
                  const allowedCharacters = /^[0-9]+$/;
                  if (
                    !allowedCharacters.test(event.key) &&
                    event.key !== 'Backspace' &&
                    event.key !== 'ArrowLeft' &&
                    event.key !== 'ArrowRight'
                  ) {
                    event.preventDefault();
                  }
                }}
              />
              {esiError.length > 1 && <span>{esiError}</span>}
            </div>
          </Row>
          <Row>
            <Label>LIN No.</Label>
            <div>
              <Input
                name="accounts.linNumber"
                placeholder={isEditModeOn ? 'Enter LIN Number' : '-'}
                type="text"
                value={
                  companyProfile.accounts && companyProfile.accounts.linNumber
                    ? companyProfile.accounts.linNumber.toUpperCase()
                    : ''
                }
                onChange={handleInputChange}
                disabled={!isEditModeOn}
                autoComplete="off"
                maxLength={10}
                onKeyDown={(event) => {
                  const allowedCharacters = /^[0-9]+$/;
                  if (
                    !allowedCharacters.test(event.key) &&
                    event.key !== 'Backspace' &&
                    event.key !== 'ArrowLeft' &&
                    event.key !== 'ArrowRight'
                  ) {
                    event.preventDefault();
                  }
                  if (event.key === 'e') {
                    event.preventDefault();
                  }
                  if (
                    companyProfile.accounts &&
                    companyProfile.accounts.linNumber.toString().length >= 10 &&
                    event.key !== 'Backspace' &&
                    event.key !== 'ArrowLeft' &&
                    event.key !== 'ArrowRight'
                  ) {
                    event.preventDefault();
                  }
                }}
              />

              {linError.length > 1 && <span>{linError}</span>}
            </div>
          </Row>
          <Row>
            <Label>GST No.</Label>
            <div>
              <Input
                name="accounts.gstNumber"
                type="text"
                placeholder={isEditModeOn ? 'Enter GST Number' : '-'}
                value={
                  companyProfile.accounts && companyProfile.accounts.gstNumber
                    ? companyProfile.accounts.gstNumber.toUpperCase()
                    : ''
                }
                onChange={handleInputChange}
                disabled={!isEditModeOn}
                autoComplete="off"
                maxLength={15}
                onKeyDown={(event) => {
                  const allowedCharacters = /^[a-zA-Z0-9]+$/;
                  if (
                    !allowedCharacters.test(event.key) &&
                    event.key !== 'Backspace'
                  ) {
                    event.preventDefault();
                  }
                  if (
                    companyProfile.address &&
                    companyProfile.address.pinCode.toString().length >= 15 &&
                    event.key !== 'Backspace'
                  ) {
                    event.preventDefault();
                  }
                }}
              />
              {gstError.length > 1 && <span>{gstError}</span>}
            </div>
          </Row>
        </Container>
        {isUpdateResponseLoading && <SpinAnimation />}
      </TabContentMainContainer>
    </>
  );
};
