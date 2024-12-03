import { useState } from 'react';
import { Button } from '../styles/CommonStyles.style';
import {
  ExpenseHeadingSection,
  ExpenseManagementMainContainer,
} from '../styles/ExpenseManagementStyles.style';
import { ExpenseList } from './ExpenseList.screen';
import CenterModalMain from '../components/reusableComponents/CenterModalMain.component';
import AddExpenseForm from '../components/directComponents/AddExpenseForm.component';
import { ArrowDownSVG } from '../svgs/CommonSvgs.svs';
import { useNavigate } from 'react-router-dom';
import { AddNewPlusSVG } from '../svgs/EmployeeListSvgs.svg';
import { useUser } from '../context/UserContext';
import { EXPENSE_MODULE } from '../constants/PermissionConstants';
import useKeyPress from '../service/keyboardShortcuts/onKeyPress';
import { hasPermission } from '../utils/permissionCheck';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const ExpenseManagement = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { t } = useTranslation();

  const goToPreviousPage = () => {
    navigate(-1);
  };
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const handleIsCreateModalOpen = () => {
    setIsCreateModalOpen(!isCreateModalOpen);
  };

  useKeyPress(78, () => {
    user &&
      hasPermission(user, EXPENSE_MODULE.CREATE_EXPENSE) &&
      setIsCreateModalOpen(true);
  });
  const [key, setKey] = useState(0);

  const forceRerender = () => {
    toast.success('Expense added successfully');
    setKey((prevKey) => prevKey + 1);
  };
  return (
    <>
      <ExpenseManagementMainContainer>
        <ExpenseHeadingSection>
          <span className="heading">
            <span onClick={goToPreviousPage}>
              <ArrowDownSVG />
            </span>
            {t('EXPENSE_MANAGEMENT')}
          </span>
          {user && hasPermission(user, EXPENSE_MODULE.CREATE_EXPENSE) && (
            <Button
              className="submit shadow"
              onClick={handleIsCreateModalOpen}
              width="216px"
            >
              <AddNewPlusSVG />
              {t('ADD_NEW_EXPENSE')}
            </Button>
          )}
        </ExpenseHeadingSection>
        <ExpenseList key={key} />
      </ExpenseManagementMainContainer>

      {isCreateModalOpen && (
        <CenterModalMain
          heading="ADD_NEW_EXPENSE"
          modalClose={handleIsCreateModalOpen}
          actualContentContainer={
            <AddExpenseForm
              handleClose={handleIsCreateModalOpen}
              handleLoadExpenses={forceRerender}
              mode="create"
            />
          }
        />
      )}
    </>
  );
};

export default ExpenseManagement;
