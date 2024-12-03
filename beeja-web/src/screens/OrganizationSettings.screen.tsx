import { useEffect, useState } from 'react';
import {
  NavList,
  NavbarSection,
  SectionsContainer,
  SelectedTabSection,
  SettingHeadSection,
  SettingsMainContainer,
} from '../styles/SettingsStyles.style';
import { CompanyProfile } from '../components/reusableComponents/CompanyProfile.component';
import { OrganizationSettingsDateCurrency } from '../components/reusableComponents/OrgSettingsDateCurrency.Component';
import {
  CalenderSVG,
  LoanIconSVG,
  MyProfileSVG,
  ThemeAndTypographySVG,
} from '../svgs/NavBarSvgs.svg';
import {
  getOrganizationById,
  updateOrganizationById,
} from '../service/axiosInstance';
import { useUser } from '../context/UserContext';
import { IOrganization } from '../entities/OrganizationEntity';
import SpinAnimation from '../components/loaders/SprinAnimation.loader';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';
import ThemesAndTypography from './Theme&Typography.screen';
import OrgSettingsLOAN from '../components/directComponents/OrgSettingsLOAN.component';
import { useFeatureToggles } from '../context/FeatureToggleContext';
import { hasFeature } from '../utils/featureCheck';
import { EFeatureToggles } from '../entities/FeatureToggle';
import UserRolesPermissionsComponent from './UserRoles&Permission.component';
import {
  EMPLOYEE_MODULE,
  ORGANIZATION_MODULE,
} from '../constants/PermissionConstants';
import { hasPermission } from '../utils/permissionCheck';
import { UserBoxWithLinkSVG } from '../svgs/CommonSvgs.svs';
import { useTranslation } from 'react-i18next';
const OrganizationSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  const { user } = useUser();
  const { featureToggles } = useFeatureToggles();
  const [isUpdateResponseLoading, setIsUpdateResponseLoading] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<IOrganization>(
    {} as IOrganization
  );
  const [tempOrganization, setTempOrganization] = useState<IOrganization>(
    {} as IOrganization
  );
  const handleRevertChangesOfOrg = (org: IOrganization) => {
    setCompanyProfile(org);
  };

  const handleCancelUpdate = () => {
    setCompanyProfile(tempOrganization);
  };

  const [isErrorOccuredWhileUpdating, setIsErrorOccuredWhileUpdating] =
    useState(false);
  const handleIsErrorOccuredWhileUpdating = (
    isErrorOccuredWhileUpdating: boolean
  ) => {
    setIsErrorOccuredWhileUpdating(isErrorOccuredWhileUpdating);
  };
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

  const handleSubmitCompanyProfile = async (
    updatedOrganization: IOrganization
  ) => {
    const formData = new FormData();
    let updateType = '';
    if (updatedOrganization) {
      const updatedOrganizationJSON = JSON.stringify(updatedOrganization);
      const parsedOrganization = JSON.parse(updatedOrganizationJSON);
      if (
        updatedOrganization.loanLimit &&
        updatedOrganization.loanLimit.monitorLoan
      ) {
        parsedOrganization.loanLimit.monitorLoan = parseInt(
          parsedOrganization.loanLimit.monitorLoan
        );
        updateType = 'Monitor Loans';
      }
      if (
        updatedOrganization.loanLimit &&
        updatedOrganization.loanLimit.personalLoan
      ) {
        parsedOrganization.loanLimit.personalLoan = parseInt(
          parsedOrganization.loanLimit.personalLoan
        );
        updateType = 'Personal Loans';
      }
      if (
        updatedOrganization.loanLimit &&
        updatedOrganization.loanLimit.salaryMultiplier
      ) {
        parsedOrganization.loanLimit.salaryMultiplier = parseInt(
          parsedOrganization.loanLimit.salaryMultiplier
        );
        updateType = 'Salary Loans';
      }
      formData.append('organizationFields', JSON.stringify(parsedOrganization));
      if (Object.keys(parsedOrganization).length === 0) {
        return;
      }
    }
    setIsUpdateResponseLoading(true);
    toast.promise(
      updateOrganizationById(user ? user.organizations.id : '', formData),
      {
        loading: 'Updating Organization...',
        closeButton: true,
        success: () => {
          fetchOrganization();
          setIsUpdateResponseLoading(false);
          handleIsErrorOccuredWhileUpdating(false);
          switch (updateType) {
            case 'Monitor Loans':
              return 'Successfully Updated Monitor Loan Limit.';
            case 'Personal Loans':
              return 'Successfully Updated Personal Loan Limit.';
            case 'Salary Loans':
              return 'Successfully Updated Salary Loan Limit.';
            default:
              return 'Your changes have been successfully saved. ';
          }
        },
        error: (error) => {
          setIsUpdateResponseLoading(false);
          handleIsErrorOccuredWhileUpdating(true);
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

  const { t } = useTranslation();

  return (
    <>
      <SettingsMainContainer>
        <SettingHeadSection>
          <h4>{t('SETTINGS')}</h4>
          <span>{t('MANAGE_YOUR_DASHBOARD_HERE')}</span>
        </SettingHeadSection>
        <SectionsContainer>
          <NavbarSection>
            <NavList>
              <ul>
                {featureToggles &&
                  hasFeature(
                    featureToggles.featureToggles,
                    EFeatureToggles.ORGANIZATION_SETTINGS_PROFILE
                  ) && (
                    <li
                      className={activeTab === 'profile' ? 'active' : ''}
                      onClick={() => handleTabClick('profile')}
                    >
                      <MyProfileSVG
                        props={{
                          isActive: activeTab === 'profile',
                        }}
                      />
                      {t('PROFILE')}
                    </li>
                  )}

                {featureToggles &&
                  hasFeature(
                    featureToggles.featureToggles,
                    EFeatureToggles.ORGANIZATION_SETTINGS_DATE_CURRENCY
                  ) && (
                    <li
                      className={activeTab === 'dateCurrency' ? 'active' : ''}
                      onClick={() => handleTabClick('dateCurrency')}
                    >
                      <CalenderSVG isActive={activeTab === 'dateCurrency'} />
                      {t('DATE_AND_CURRENCY')}
                    </li>
                  )}
                {user &&
                  hasPermission(
                    user,
                    ORGANIZATION_MODULE.UPDATE_ORGANIZATION
                  ) && (
                    <>
                      {featureToggles &&
                        hasFeature(
                          featureToggles.featureToggles,
                          EFeatureToggles.LOAN_MANAGEMENT
                        ) && (
                          <li
                            className={
                              activeTab === 'loanSettings' ? 'active' : ''
                            }
                            onClick={() => handleTabClick('loanSettings')}
                          >
                            <LoanIconSVG
                              isActive={activeTab === 'loanSettings'}
                            />
                            {t('LOANS')}
                          </li>
                        )}

                      {featureToggles &&
                        (hasFeature(
                          featureToggles.featureToggles,
                          EFeatureToggles.ORGANIZATION_SETTINGS_THEMES
                        ) ||
                          hasFeature(
                            featureToggles.featureToggles,
                            EFeatureToggles.ORGANIZATION_SETTINGS_FONT_NAME
                          )) &&
                        EFeatureToggles.ORGANIZATION_SETTINGS_FONT_SIZE && (
                          <li
                            className={
                              activeTab === 'themesTypography' ? 'active' : ''
                            }
                            onClick={() => handleTabClick('themesTypography')}
                          >
                            <ThemeAndTypographySVG
                              isActive={activeTab === 'themesTypography'}
                            />
                            {t('THEMES_AND_TYPOGRAPHY')}
                          </li>
                        )}
                    </>
                  )}

                {featureToggles &&
                  user &&
                  hasFeature(
                    featureToggles.featureToggles,
                    EFeatureToggles.ORGANIZATION_SETTINGS_ROLES_AND_PERMISSIONS
                  ) &&
                  hasPermission(user, EMPLOYEE_MODULE.READ_EMPLOYEE) && (
                    <li
                      className={
                        activeTab === 'userRolesPermissions' ? 'active' : ''
                      }
                      onClick={() => handleTabClick('userRolesPermissions')}
                    >
                      <UserBoxWithLinkSVG
                        props={{
                          isActive: activeTab === 'userRolesPermissions',
                        }}
                      />
                      {t('USER_ROLES_AND_PERMISSIONS')}
                    </li>
                  )}
              </ul>
            </NavList>
          </NavbarSection>
          <SelectedTabSection>
            {activeTab === 'profile' && <CompanyProfile />}

            {activeTab === 'dateCurrency' && (
              <OrganizationSettingsDateCurrency
                organization={companyProfile}
                handleUpdateOrganization={handleSubmitCompanyProfile}
                isErrorOccuredWhileUpdating={isErrorOccuredWhileUpdating}
                setCompanyProfile={handleRevertChangesOfOrg}
                handleCancelUpdate={handleCancelUpdate}
              />
            )}

            {activeTab === 'userRolesPermissions' && (
              <UserRolesPermissionsComponent />
            )}
            {activeTab === 'themesTypography' && <ThemesAndTypography />}
            {activeTab === 'loanSettings' && (
              <OrgSettingsLOAN
                organization={companyProfile}
                handleUpdateOrganization={handleSubmitCompanyProfile}
                isErrorOccuredWhileUpdating={isErrorOccuredWhileUpdating}
                setCompanyProfile={handleRevertChangesOfOrg}
                handleCancelUpdate={handleCancelUpdate}
              />
            )}
          </SelectedTabSection>
        </SectionsContainer>
      </SettingsMainContainer>
      {isUpdateResponseLoading && <SpinAnimation />}
    </>
  );
};
export default OrganizationSettings;
