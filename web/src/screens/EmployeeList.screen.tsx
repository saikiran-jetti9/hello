import { useContext, useEffect, useState, useCallback } from 'react';
import {
  Button,
  DynamicSpaceMainContainer,
  HighlightedBoxes,
} from '../styles/CommonStyles.style';

import { departmentOptions } from '../utils/departmentOptions';
import { FilterSection } from '../styles/ExpenseListStyles.style';
import {
  EmployeeListContainer,
  EmployeeListHeadSection,
  Monogram,
  TableBodyRow,
} from '../styles/EmployeeListStyles.style';
import { AddNewPlusSVG } from '../svgs/EmployeeListSvgs.svg';
import { useTranslation } from 'react-i18next';
import SideModal from '../components/reusableComponents/SideModal.component';
import {
  InputLabelContainer,
  SideModalResponseError,
  StyledForm,
  TextInput,
  ValidationText,
} from '../styles/InputStyles.style';
import { AlertISVG, ErrorRedMark } from '../svgs/CommonSvgs.svs';
import axios, { AxiosError } from 'axios';
import { Table, TableContainer, TableHead } from '../styles/TableStyles.style';
import {
  EmailRequired,
  EMPLOYMENT_TYPRE_REQUIRED,
  FirstNameRequired,
  LastNameRequired,
  ProfileCreationError,
} from '../constants/Constants';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { useUser } from '../context/UserContext';
import {
  createEmployee,
  getAllEmployees,
  getEmployeesCount,
  downloadEmployeeFile,
  getOrganizationValuesByKey,
} from '../service/axiosInstance';
import { ApplicationContext } from '../context/ApplicationContext';
import { EMPLOYEE_MODULE } from '../constants/PermissionConstants';
import { IEmployeeCount } from '../entities/respponses/EmployeeCount';
import { DynamicSpace } from '../styles/NavBarStyles.style';
import useKeyPress from '../service/keyboardShortcuts/onKeyPress';
import { hasPermission } from '../utils/permissionCheck';
import useKeyCtrl from '../service/keyboardShortcuts/onKeySave';
import Pagination from '../components/directComponents/Pagination.component';
import { OrganizationValues } from '../entities/OrgValueEntity';
import { InputLabelContainer as SelectOption } from '../styles/DocumentTabStyles.style';
import SpinAnimation from '../components/loaders/SprinAnimation.loader';
import { toast } from 'sonner';
import CopyPasswordPopup from '../components/directComponents/CopyPasswordPopup.component';
import { CreatedUserEntity } from '../entities/CreatedUserEntity';

const EmployeeList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { employeeList: finalEmpList, updateEmployeeList } =
    useContext(ApplicationContext);
  const [employeeCount, setEmployeeCount] = useState<IEmployeeCount>();
  const [isLoadingData, setLoadingData] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [departmentFilter, setDepartmentFilter] = useState<string>(''); //m
  const [EmployeementTypeFilter, setEmployeementTypeFilter] = useState('');
  const [JobTitleFilter, setJobTitleFilter] = useState<string>('');
  const [EmployeeStatusFilter, setEmployeeStatusFilter] = useState<string>('');

  const handleDepartmentChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDepartmentFilter(event.target.value);
  };

  const handleEmploymentTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setEmployeementTypeFilter(event.target.value);
  };

  const handleJobTitleChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setJobTitleFilter(event.target.value);
  };

  const handleEmployeeStatusChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setEmployeeStatusFilter(event.target.value);
  };

  const [isCreateEmployeeModelOpen, setIsCreateEmployeeModelOpen] =
    useState(false);

  const handleIsCreateEmployeeModal = () => {
    setIsCreateEmployeeModelOpen(!isCreateEmployeeModelOpen);
  };
  const [employeeImages, setEmployeeImages] = useState<Map<string, string>>(
    new Map()
  );

  const fetchEmployeeImages = async () => {
    const imageUrls = new Map<string, string>();

    if (finalEmpList) {
      const promises = finalEmpList.map(async (emp) => {
        const profilePictureId = emp.employee.profilePictureId;

        if (profilePictureId) {
          try {
            const response = await downloadEmployeeFile(profilePictureId);

            if (!response.data || response.data.size === 0) {
              throw new Error('Received empty or invalid blob data');
            }

            return new Promise<void>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const imageUrl = reader.result as string;
                imageUrls.set(emp.employee.employeeId, imageUrl);
                resolve();
              };
              reader.onerror = () => {
                reject(new Error('Error converting blob to base64'));
              };
              reader.readAsDataURL(response.data);
            });
          } catch (error) {
            throw new Error('Error fetching profile image:');
          }
        }
      });
      await Promise.all(promises);

      setEmployeeImages(new Map(imageUrls));
    }
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (finalEmpList) {
      setLoadingData(true);
      fetchEmployeeImages();
      setLoadingData(false);
    }
  }, [finalEmpList]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const fetchEmployees = useCallback(async () => {
    setLoadingData(true);
    try {
      const queryParams = [];
      if (departmentFilter != null && departmentFilter != '-')
        queryParams.push(`department=${encodeURIComponent(departmentFilter)}`);
      if (EmployeementTypeFilter != null && EmployeementTypeFilter != '-')
        queryParams.push(
          `employmentType=${encodeURIComponent(EmployeementTypeFilter)}`
        );
      if (JobTitleFilter != null && JobTitleFilter != '-')
        queryParams.push(`designation=${encodeURIComponent(JobTitleFilter)}`);
      if (EmployeeStatusFilter != null && EmployeeStatusFilter != '-')
        queryParams.push(`status=${encodeURIComponent(EmployeeStatusFilter)}`);

      queryParams.push(`pageNumber=${currentPage}`);
      queryParams.push(`pageSize=${itemsPerPage}`);
      const queryString =
        queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

      const response = await getAllEmployees(queryString);
      const allEmployees = response.data.employeeList;
      setTotalItems(response.data.totalSize);
      updateEmployeeList(allEmployees);
      if (!allEmployees || allEmployees.length === 0) {
        setError('No employees found.');
      } else {
        setError(null);
      }
    } catch (error) {
      setError('ERROR_WHILE_FETCHING_EMPLOYEES');
    } finally {
      setLoadingData(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    departmentFilter,
    EmployeementTypeFilter,
    JobTitleFilter,
    EmployeeStatusFilter,
    updateEmployeeList,
  ]);

  const fetchEmployeeCount = async () => {
    try {
      const response = await getEmployeesCount();
      setEmployeeCount(response.data);
    } catch (error) {
      setError('ERROR_WHILE_FETCHING_EMPLOYEE_COUNT');
    }
  };

  useEffect(() => {
    fetchEmployeeCount();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleNavigateToDetailedView = (employeeId: string) => {
    navigate('/profile', { state: { employeeId } });
  };

  /*Below state used to set response loading when we click on Creat Profile Button
    Used to prevent close function while response from BE is loading
  */
  const [isResponseLoading, setIsResponseLoading] = useState(false);

  useKeyPress(78, () => {
    user &&
      hasPermission(user, EMPLOYEE_MODULE.CREATE_EMPLOYEE) &&
      setIsCreateEmployeeModelOpen(true);
  });

  const currentEmployees = finalEmpList;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setItemsPerPage(newPageSize);
    setCurrentPage(1);
  };

  return (
    <DynamicSpace>
      <EmployeeListContainer>
        <DynamicSpaceMainContainer>
          <EmployeeListHeadSection>
            <div>
              <h3>{t('EMPLOYEES')}</h3>
              <span>{t('MANAGE_YOUR_EMPLOYEES')}</span>
            </div>
            {user && hasPermission(user, EMPLOYEE_MODULE.CREATE_EMPLOYEE) && (
              <div>
                <Button
                  className="submit"
                  onClick={handleIsCreateEmployeeModal}
                >
                  <AddNewPlusSVG />
                  {t('ADD_NEW')}
                </Button>
              </div>
            )}
          </EmployeeListHeadSection>
          <HighlightedBoxes>
            {user && hasPermission(user, EMPLOYEE_MODULE.GET_ALL_EMPLOYEES) && (
              <div>
                {isLoadingData ? (
                  <>
                    <h4 className="skeleton skeleton-text"></h4>
                    <span className="skeleton skeleton-text"></span>
                  </>
                ) : (
                  <>
                    <h4>{t('TOTAL_EMPLOYEES')}</h4>
                    <span>{employeeCount?.totalCount}</span>
                  </>
                )}
              </div>
            )}
            <div>
              {isLoadingData ? (
                <>
                  <h4 className="skeleton skeleton-text"></h4>
                  <span className="skeleton skeleton-text"></span>
                </>
              ) : (
                <>
                  <h4>{t('ACTIVE_EMPLOYEES')}</h4>
                  <span>{employeeCount?.activeCount}</span>
                </>
              )}
            </div>
            {user && hasPermission(user, EMPLOYEE_MODULE.GET_ALL_EMPLOYEES) && (
              <div>
                {isLoadingData ? (
                  <>
                    <h4 className="skeleton skeleton-text"></h4>
                    <span className="skeleton skeleton-text"></span>
                  </>
                ) : (
                  <>
                    <h4>{t('INACTIVE_EMPLOYEES')}</h4>
                    <span>{employeeCount?.inactiveCount}</span>
                  </>
                )}
              </div>
            )}
          </HighlightedBoxes>

          {/* FIXME Uncomment below while adding search & filter functionalities */}

          {/* <EmployeeListFilterSection>
            <SearchEmployee placeholder={t('Search employee')} />
            <Button>{t('All Jobs')}</Button>
            <Button>{t('Status')}</Button>
          </EmployeeListFilterSection> */}

          <FilterSection>
            <select
              className="selectoption"
              name="EmployeeDepartment"
              value={departmentFilter}
              onChange={(e) => {
                handleDepartmentChange(e);
                setCurrentPage(1);
              }}
            >
              <option value="">Department</option>{' '}
              {departmentOptions.employeeDepartments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
            <select
              className="selectoption"
              name="JobTitle"
              value={JobTitleFilter}
              onChange={(e) => {
                handleJobTitleChange(e);
                setCurrentPage(1);
              }}
            >
              <option value="">JobTitle</option>{' '}
              {departmentOptions.jobTitles.map((jobTitle) => (
                <option key={jobTitle} value={jobTitle}>
                  {jobTitle}
                </option>
              ))}
            </select>

            <select
              className="selectoption"
              name="EmployementType"
              value={EmployeementTypeFilter}
              onChange={(e) => {
                handleEmploymentTypeChange(e);
                setCurrentPage(1);
              }}
            >
              <option value="">EmployementType</option>
              {departmentOptions.employmentTypes.map((employementType) => (
                <option key={employementType} value={employementType}>
                  {employementType}
                </option>
              ))}
            </select>

            <select
              className="selectoption"
              name="employeeStatus"
              value={EmployeeStatusFilter}
              onChange={(e) => {
                handleEmployeeStatusChange(e);
                setCurrentPage(1);
              }}
            >
              <option value="">Status</option>{' '}
              {departmentOptions.status.map((employeStatus) => (
                <option key={employeStatus} value={employeStatus}>
                  {employeStatus}
                </option>
              ))}
            </select>
          </FilterSection>
          <br />
          <TableContainer>
            <Table>
              <TableHead>
                <tr style={{ textAlign: 'left', borderRadius: '10px' }}>
                  <th style={{ width: '250px' }}>{t('NAME')}</th>
                  <th style={{ width: '120px' }}>{t('JOB_TITLE')}</th>
                  <th style={{ width: '140px' }}>{t('TYPE')}</th>
                  <th style={{ width: '140px' }}>{t('DEPARTMENT')}</th>
                  <th style={{ width: '120px' }}>{t('STATUS')}</th>
                </tr>
              </TableHead>
              <tbody style={{ fontSize: '14px' }}>
                {isLoadingData ? (
                  <>
                    {[...Array(8).keys()].map((index) => (
                      <TableBodyRow key={index}>
                        <td className="profilePicArea">
                          {<Monogram className="skeleton"> </Monogram>}
                          <span className="skeleton skeleton-text"></span>
                        </td>
                        <td>
                          <div className="skeleton skeleton-text"></div>
                        </td>
                        <td>
                          <div className="skeleton skeleton-text"></div>
                        </td>
                        <td>
                          <div className="skeleton skeleton-text"></div>
                        </td>
                        <td>
                          <div className="skeleton skeleton-text"></div>
                        </td>
                      </TableBodyRow>
                    ))}
                  </>
                ) : (
                  currentEmployees?.map((emp, index) => (
                    <React.Fragment key={index}>
                      <TableBodyRow
                        onClick={() =>
                          handleNavigateToDetailedView(emp.account.employeeId)
                        }
                      >
                        <td className="profilePicArea">
                          {employeeImages.has(emp.employee.employeeId) ? (
                            <Monogram
                              className="initials"
                              style={{
                                backgroundImage: `url(${employeeImages.get(emp.employee.employeeId)})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                              }}
                            >
                              {/* Empty because the background image handles the visual */}
                            </Monogram>
                          ) : (
                            <Monogram
                              className={emp.account.firstName
                                .charAt(0)
                                .toUpperCase()}
                            >
                              {emp.account.firstName.charAt(0).toUpperCase() +
                                emp.account.lastName.charAt(0).toUpperCase()}
                            </Monogram>
                          )}
                          <span className="nameAndMail">
                            <span>
                              {emp.account.firstName === null &&
                              emp.account.lastName === null
                                ? // FIXME
                                  't.a.cer'
                                : emp.account.firstName +
                                  ' ' +
                                  emp.account.lastName}
                            </span>
                            <span className="employeeMail">
                              {emp.account.email}
                            </span>
                          </span>
                        </td>
                        <td>
                          {emp.employee.jobDetails
                            ? emp.employee.jobDetails.designation
                            : '-'}
                        </td>
                        <td>
                          {emp.employee.jobDetails &&
                          emp.employee.jobDetails.employementType
                            ? emp.employee.jobDetails.employementType
                            : '-'}
                        </td>
                        <td>
                          {emp.employee.jobDetails
                            ? emp.employee.jobDetails.department
                            : '-'}
                        </td>
                        <td>
                          {emp.account.active ? t('ACTIVE') : t('INACTIVE')}
                        </td>
                      </TableBodyRow>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </Table>
          </TableContainer>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / itemsPerPage)}
            handlePageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            handleItemsPerPage={handlePageSizeChange}
            totalItems={totalItems}
          />
          {error && <div className="error-message">{error}</div>}
        </DynamicSpaceMainContainer>

        {isCreateEmployeeModelOpen && (
          <SideModal
            handleClose={
              isResponseLoading ? () => {} : handleIsCreateEmployeeModal
            }
            isModalOpen={isCreateEmployeeModelOpen}
            innerContainerContent={
              <CreateAccount
                setIsResponseLoading={setIsResponseLoading}
                isResponseLoading={isResponseLoading}
                handleClose={handleIsCreateEmployeeModal}
                reloadEmployeeList={fetchEmployees}
                refetchEmployeeCount={fetchEmployeeCount}
              />
            }
          />
        )}
      </EmployeeListContainer>
    </DynamicSpace>
  );
};

export default EmployeeList;

type CreateAccountProps = {
  handleClose: () => void;
  reloadEmployeeList: () => void;
  refetchEmployeeCount: () => void;
  setIsResponseLoading: (param: boolean) => void;
  isResponseLoading: boolean;
};

const CreateAccount: React.FC<CreateAccountProps> = (props) => {
  const [responseMessage, setResponseMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    employmentType: '',
  });
  const [organizationValues, setOrganizationValues] =
    useState<OrganizationValues | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<CreatedUserEntity>();
  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    employmentType: '',
  });
  const [emailMessage, setEmailMessage] = useState('');

  useEffect(() => {
    const fetchOrganizationValues = async () => {
      try {
        setLoading(true);
        const key = 'employeeTypes';
        const response = await getOrganizationValuesByKey(key);
        setOrganizationValues(response.data);
      } catch (err) {
        toast.error(t('ERROR_OCCURRED_PLEASE_RELOAD'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreateEmployee = async (e: any) => {
    e.preventDefault();
    const newErrors = {
      firstName:
        formData.firstName === ''
          ? FirstNameRequired
          : /\d/.test(formData.firstName)
            ? 'FIRST_NAME_CANNOT_CONTAIN_NuMBERS'
            : '',
      lastName:
        formData.lastName === ''
          ? LastNameRequired
          : /\d/.test(formData.lastName)
            ? 'LAST_NAME_CANNOT_CONTAIN_NuMBERS'
            : '',
      email:
        formData.email === ''
          ? EmailRequired
          : !/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(formData.email)
            ? 'INVALID_EMAIL_FORMAT'
            : '',
      employmentType:
        formData.employmentType === '' ? EMPLOYMENT_TYPRE_REQUIRED : '',
    };

    setErrors(newErrors);

    if (Object.values(newErrors).every((error) => error === '')) {
      try {
        props.setIsResponseLoading(true);
        const resp = await createEmployee(formData);
        setUser(resp.data);
        handleShowPassword();
        props.reloadEmployeeList();
        props.refetchEmployeeCount();
        toast.success(t('PROFILE_HAS_BEEN_SUCCESSFULLY_ADDED'));
      } catch (e) {
        if (axios.isAxiosError(e)) {
          const axiosError: AxiosError = e;
          const responseData: string | undefined = (
            axiosError.response?.data as { message?: string }
          )?.message;
          if (
            responseData &&
            responseData.startsWith('Employee With Given Id Is Already Found')
          ) {
            setResponseMessage('EMPLOYEE_ID_ALREADY_FOUND');
          } else if (
            responseData &&
            responseData.startsWith('User Already Found')
          ) {
            setResponseMessage('A profile with this email ID already exists');
            setEmailMessage('A profile with this email ID already exists');
          } else {
            setResponseMessage(ProfileCreationError);
          }
        }
      } finally {
        props.setIsResponseLoading(false);
        setTimeout(() => {
          setResponseMessage('');
          setEmailMessage('');
        }, 5000);
      }
    }
  };
  useKeyCtrl('s', () =>
    handleCreateEmployee(event as unknown as React.FormEvent<HTMLFormElement>)
  );

  useKeyPress(27, () => {
    props.handleClose();
  });

  const { t } = useTranslation();

  return (
    <StyledForm style={{ cursor: props.isResponseLoading ? 'progress' : '' }}>
      <div>
        <h3>{t('ADD_NEW_PROFILE')}</h3>
        <InputLabelContainer>
          <label>
            {t('FIRST_NAME')}{' '}
            <ValidationText className="star">*</ValidationText>
          </label>
          <TextInput
            type="text"
            name="firstName"
            placeholder="Ex: John"
            value={formData.firstName}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            className={`${errors.firstName}` ? 'errorEnabledInput' : ''}
          />
          {errors.firstName && (
            <ValidationText>
              <AlertISVG /> {errors.firstName}
            </ValidationText>
          )}
        </InputLabelContainer>

        <InputLabelContainer>
          <label>
            {t('LAST_NAME')} <ValidationText className="star">*</ValidationText>
          </label>
          <TextInput
            type="text"
            name="lastName"
            placeholder="Ex: Mark"
            value={formData.lastName}
            onChange={handleChange}
            className={`${errors.lastName}` ? 'errorEnabledInput' : ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
          />
          {errors.lastName && (
            <ValidationText>
              <AlertISVG /> {errors.lastName}
            </ValidationText>
          )}
        </InputLabelContainer>

        <InputLabelContainer>
          <label>
            {t('EMAIL_ADDRESS')}{' '}
            <ValidationText className="star">*</ValidationText>
          </label>
          <TextInput
            type="email"
            name="email"
            placeholder="Ex: john@techatcore.com"
            value={formData.email}
            onChange={handleChange}
            className={`${errors.email}` ? 'errorEnabledInput' : ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
          />
          {errors.email && (
            <ValidationText>
              <AlertISVG /> {errors.email}
            </ValidationText>
          )}
          {emailMessage && (
            <ValidationText>
              <AlertISVG /> {emailMessage}
            </ValidationText>
          )}
        </InputLabelContainer>

        <SelectOption>
          <label>
            {t('EMPLOYMENT_TYPE')}{' '}
            <ValidationText className="star">*</ValidationText>
          </label>
          <select
            className="selectoption"
            name="employmentType"
            id="employmentType"
            onKeyPress={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
              }
            }}
            onChange={handleChange}
          >
            <option value="">{t('SELECT_EMPLOYMENT_TYPE')}</option>
            {organizationValues &&
              organizationValues.values &&
              organizationValues.values.map((type, index) => (
                <option key={index} value={type.value}>
                  {t(type.value)}
                </option>
              ))}
          </select>
          {errors.employmentType && (
            <ValidationText>
              <AlertISVG /> {errors.employmentType}
            </ValidationText>
          )}
        </SelectOption>
        <span>
          <ValidationText className="info">
            {t('EMPLOYEE_ID_WILL_BE_GENERATED_BASED_ON_PATTERN')}
          </ValidationText>
        </span>
      </div>

      <div>
        {responseMessage.length != 0 && (
          <SideModalResponseError>
            <span>
              <ErrorRedMark />
            </span>
            <span>{responseMessage}</span>
          </SideModalResponseError>
        )}
        <div className="buttonArea">
          <Button
            style={
              props.isResponseLoading
                ? { opacity: 0.3, cursor: 'not-allowed' }
                : {}
            }
            onClick={(e) => {
              if (props.isResponseLoading) {
                e.preventDefault();
              }
              if (!props.isResponseLoading) {
                props.handleClose();
              }
            }}
          >
            {t('CANCEL')}
          </Button>
          <Button
            className="submit"
            onClick={handleCreateEmployee}
            style={{ cursor: props.isResponseLoading ? 'progress' : '' }}
            disabled={props.isResponseLoading}
          >
            {t('CREATE')}
          </Button>
        </div>
      </div>
      {loading && <SpinAnimation />}
      {showPassword && (
        <CopyPasswordPopup
          password={user?.password || ''}
          handleClose={() => {
            props.handleClose();
            handleShowPassword();
          }}
          employeeId={user?.user?.employeeId || ''}
          firstName={user?.user?.firstName || ''}
          email={user?.user?.email || ''}
          companyName={user?.user?.organizations?.name?.toUpperCase() || ''}
        />
      )}
    </StyledForm>
  );
};
