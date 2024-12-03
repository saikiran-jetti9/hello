import { useState } from 'react';
import {
  BorderDivLine,
  TabContentEditArea,
  TabContentMainContainer,
  TabContentMainContainerHeading,
} from '../../styles/MyProfile.style';
import {
  LoanFields,
  ProfileHeading,
  Select,
} from '../../styles/OrganizationSettingsStyles.style';
import {
  EditWhitePenSVG,
  CheckBoxOnSVG,
  CrossMarkSVG,
} from '../../svgs/CommonSvgs.svs';
import { InfoCircleSVG } from '../../svgs/NavBarSvgs.svg';
import { TextInput } from '../../styles/InputStyles.style';
import { IOrganization } from '../../entities/OrganizationEntity';
import { toast } from 'sonner';
import { Checkbox } from '../../styles/LoanApplicationStyles.style';

type OrgSettingsLOANType = {
  organization: IOrganization;
  handleUpdateOrganization: (org: IOrganization) => void;
  isErrorOccuredWhileUpdating: boolean;
  handleCancelUpdate: () => void;
  setCompanyProfile: (org: IOrganization) => void;
};
const OrgSettingsLOAN = (props: OrgSettingsLOANType) => {
  const [isEditMonitorLoan, setIsEditMonitorLoan] = useState(false);
  const handleIsEditMonitorLoan = () => {
    setIsEditMonitorLoan(!isEditMonitorLoan);
  };
  const [isEditPersonalLoan, setIsEditPersonalLoan] = useState(false);
  const handleIsEditPersonalLoan = () => {
    setIsEditPersonalLoan(!isEditPersonalLoan);
  };
  const [updatedOrganization, setUpdatedOrganization] = useState<IOrganization>(
    {} as IOrganization
  );
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    props.setCompanyProfile({
      ...props.organization,
      loanLimit: {
        ...props.organization.loanLimit,
        [name]: value,
      },
    });

    setUpdatedOrganization(
      (prevState) =>
        ({
          ...prevState,
          loanLimit: {
            ...prevState.loanLimit,
            [name]: value,
          },
        }) as IOrganization
    );
  };

  const handleDiscardChanges = () => {
    setUpdatedOrganization({} as IOrganization);
  };

  const handleMonitorLoanChange = () => {
    if (
      updatedOrganization.loanLimit &&
      (updatedOrganization.loanLimit.monitorLoan === undefined ||
        updatedOrganization.loanLimit.monitorLoan === null ||
        updatedOrganization.loanLimit.monitorLoan.toString() === '' ||
        updatedOrganization.loanLimit.monitorLoan
          .toString()
          .replace(/0/g, '')
          .trim() === '')
    ) {
      toast.error('Please enter Monitor loan limit (must greater than 0)');
      return;
    }
    props.handleUpdateOrganization(updatedOrganization);
    if (!props.isErrorOccuredWhileUpdating) {
      setIsEditMonitorLoan(false);
      setIsEditPersonalLoan(false);
    }
    handleDiscardChanges();
  };

  const handlePersonalLoanChange = () => {
    if (
      updatedOrganization.loanLimit &&
      (updatedOrganization.loanLimit.personalLoan === undefined ||
        updatedOrganization.loanLimit.personalLoan === null ||
        updatedOrganization.loanLimit.personalLoan.toString() === '' ||
        updatedOrganization.loanLimit.personalLoan
          .toString()
          .replace(/0/g, '')
          .trim() === '')
    ) {
      toast.error('Please enter Personal loan limit (must greater than 0)');
      return;
    }
    props.handleUpdateOrganization(updatedOrganization);
    if (!props.isErrorOccuredWhileUpdating) {
      setIsEditMonitorLoan(false);
      setIsEditPersonalLoan(false);
    }
    handleDiscardChanges();
  };
  return (
    <>
      <ProfileHeading>Loans</ProfileHeading>
      <BorderDivLine width="100%" />
      <TabContentMainContainer>
        <TabContentMainContainerHeading>
          <h4>Monitor Loan</h4>
          <TabContentEditArea>
            {!isEditMonitorLoan ? (
              <span
                onClick={() => {
                  handleIsEditMonitorLoan();
                  setIsEditPersonalLoan(false);
                  props.handleCancelUpdate();
                  handleDiscardChanges();
                }}
              >
                <EditWhitePenSVG />
              </span>
            ) : (
              <span>
                <span
                  title="Save Changes"
                  onClick={() => {
                    handleMonitorLoanChange();
                  }}
                >
                  <CheckBoxOnSVG />
                </span>
                <span
                  title="Discard Changes"
                  onClick={() => {
                    props.handleCancelUpdate();
                    handleIsEditMonitorLoan();
                    handleDiscardChanges();
                  }}
                >
                  <CrossMarkSVG />
                </span>
              </span>
            )}
          </TabContentEditArea>
        </TabContentMainContainerHeading>
        <BorderDivLine width="100%" />
        <LoanFields>
          <div className="label">
            <span>Set Monitor loan limit</span>
            <span className="label-info">
              <InfoCircleSVG height={14} width={14} />
              Set the custom limit for Monitor loan
            </span>
          </div>
          <TextInput
            className="input"
            name="monitorLoan"
            onChange={handleInputChange}
            value={props.organization.loanLimit?.monitorLoan}
            placeholder="Enter Monitor loan limit"
            disabled={!isEditMonitorLoan}
            maxLength={11}
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
            }}
          />
        </LoanFields>
      </TabContentMainContainer>

      <TabContentMainContainer>
        <TabContentMainContainerHeading>
          <h4>Personal Loan</h4>
          <TabContentEditArea>
            {!isEditPersonalLoan ? (
              <span
                onClick={() => {
                  handleIsEditPersonalLoan();
                  setIsEditMonitorLoan(false);
                  props.handleCancelUpdate();
                  handleDiscardChanges();
                }}
              >
                <EditWhitePenSVG />
              </span>
            ) : (
              <span>
                <span
                  title="Save Changes"
                  onClick={() => {
                    handlePersonalLoanChange();
                  }}
                >
                  <CheckBoxOnSVG />
                </span>
                <span
                  title="Discard Changes"
                  onClick={() => {
                    props.handleCancelUpdate();
                    handleIsEditPersonalLoan();
                    handleDiscardChanges();
                  }}
                >
                  <CrossMarkSVG />
                </span>
              </span>
            )}
          </TabContentEditArea>
        </TabContentMainContainerHeading>
        <BorderDivLine width="100%" />
        <LoanFields>
          <div className="label">
            <span>Set Personal loan limit</span>
            <span className="label-info">
              <InfoCircleSVG height={14} width={14} /> Set the custom limit for
              Personal loan
            </span>
          </div>
          <TextInput
            className="input"
            name="personalLoan"
            onChange={handleInputChange}
            value={props.organization.loanLimit?.personalLoan}
            placeholder="Personal loan limit"
            disabled={!isEditPersonalLoan}
            maxLength={11}
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
            }}
          />
        </LoanFields>

        <br />
        {/* FIXME: Update Salary Multiplier when payroll settings are done!! */}
        <div className="checkBoxArea">
          <Checkbox
            className="small"
            type="checkbox"
            name="isSalaryMultiplierEnabled"
            onChange={handleInputChange}
            checked={props.organization.loanLimit.isSalaryMultiplierEnabled}
            disabled
          />
          Enable Base salary multiplier option
        </div>

        <LoanFields style={{ color: 'gray' }}>
          <div className="label">
            <span className="textMedium">Base salary multiplier</span>
            <span className="label-info">
              <InfoCircleSVG height={37} width={37} /> This base salary
              multiplier will applies to all employee’s salaries to determine
              the loan limit.
            </span>
          </div>
          <Select
            className="input"
            name="salaryMultiplier"
            onChange={handleInputChange}
            // disabled={!isEditPersonalLoan}
            disabled
            value={props.organization.loanLimit.salaryMultiplier}
          >
            <option value="1">1x</option>
            <option value="2">2x</option>
            <option value="3">3x</option>
            <option value="4">4x</option>
          </Select>
          <div className="label">
            <span className="label-info">
              {' '}
              <InfoCircleSVG height={14} width={14} /> Salary Multiplier will be
              available soon!!
            </span>
          </div>
        </LoanFields>
      </TabContentMainContainer>
    </>
  );
};

export default OrgSettingsLOAN;
