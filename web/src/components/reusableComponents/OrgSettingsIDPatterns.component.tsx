import { useState, useEffect } from 'react';
import {
  TabContentMainContainer,
  TabContentMainContainerHeading,
} from '../../styles/MyProfile.style';
import { Hr } from '../../styles/LoanApplicationStyles.style';
import { Button } from '../../styles/CommonStyles.style';
import { AddNewPlusSVG } from '../../svgs/EmployeeListSvgs.svg';
import {
  Table,
  TableContainer,
  TableHead,
} from '../../styles/TableStyles.style';
import EmployeeIDCreate from '../../screens/iDPatternCreate.screen';
import {
  getIDPatterns,
  updatePatternStatus,
} from '../../service/axiosInstance';
import { TableBodyRow } from '../../styles/DocumentTabStyles.style';
import { ToggleSwitchContainer } from '../../styles/IDPatternCreateStyles.style';
import {
  ActiveToggleSVG,
  InactiveToggleSVG,
} from '../../svgs/CreateIDPatternSvgs.svg';
interface OrgSettingsIDPatternsProps {
  patternType: 'LOAN_ID_PATTERN' | 'EMPLOYEE_ID_PATTERN' | 'DEVICE_ID_PATTERN';
}
export const OrgSettingsIDPatterns: React.FC<OrgSettingsIDPatternsProps> = ({
  patternType,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [patterns, setPatterns] = useState<any[]>([]);
  const [isCreateScreenOpen, setIsCreateScreenOpen] = useState(false);
  const closeCreateScreen = () => {
    setIsCreateScreenOpen(false);
  };
  const refreshPatterns = async () => {
    const response = await getIDPatterns(patternType);
    setPatterns(response.data);
  };
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    refreshPatterns();
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */
  const handleToggleSwitch = async (patternId: string) => {
    try {
      await updatePatternStatus(patternId, patternType);
      await refreshPatterns();
    } catch (error) {
      alert('Failed to update pattern status. Please try again.');
      throw error;
    }
  };
  return (
    <>
      {isCreateScreenOpen ? (
        <EmployeeIDCreate
          onClose={closeCreateScreen}
          refreshPatterns={refreshPatterns}
          patternType={patternType}
        />
      ) : (
        <TabContentMainContainer>
          <TabContentMainContainerHeading>
            <h4>
              {patternType === 'LOAN_ID_PATTERN'
                ? 'Loan ID Pattern'
                : patternType === 'EMPLOYEE_ID_PATTERN'
                  ? 'Employee ID Pattern'
                  : 'Device ID Pattern'}
            </h4>

            <Button
              className="submit shadow button emp"
              onClick={() => {
                setIsCreateScreenOpen(true);
              }}
            >
              <AddNewPlusSVG />
              Create Id Pattern
            </Button>
          </TabContentMainContainerHeading>
          <Hr />
          <TableContainer>
            <Table>
              <TableHead>
                <tr style={{ textAlign: 'left', borderRadius: '10px' }}>
                  <th style={{ width: '250px' }}>Id Length</th>
                  <th style={{ width: '250px' }}>Id Prefix</th>
                  <th style={{ width: '250px' }}>Intial Sequence</th>
                  <th style={{ width: '105px' }}>Active Pattern</th>
                </tr>
              </TableHead>
              <tbody>
                {patterns?.map((pattern, index) => (
                  <TableBodyRow key={index}>
                    <td>{pattern.patternLength}</td>
                    <td>{pattern.prefix}</td>
                    <td>{pattern.initialSequence}</td>
                    <td>
                      <ToggleSwitchContainer isChecked={pattern.active}>
                        <div
                          style={{
                            flexGrow: 1,
                            maxWidth: '50px',
                          }}
                          className="toggle-switch-container"
                        >
                          <div
                            className="toggle-switch"
                            onClick={() => {
                              if (!pattern.active) {
                                handleToggleSwitch(pattern.id);
                              }
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={pattern.active}
                              readOnly
                              disabled={pattern.active}
                            />

                            {pattern.active ? (
                              <ActiveToggleSVG></ActiveToggleSVG>
                            ) : (
                              <InactiveToggleSVG></InactiveToggleSVG>
                            )}
                          </div>
                        </div>
                      </ToggleSwitchContainer>
                    </td>
                  </TableBodyRow>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        </TabContentMainContainer>
      )}
    </>
  );
};

export default OrgSettingsIDPatterns;
