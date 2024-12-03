import React, { useRef, useState } from 'react';
import { ActionIcon } from '../../svgs/ExpenseListSvgs.svg';
/* eslint-disable */
import {
  ActionContainer,
  ActionMenuContent,
  ActionMenuOption,
  ActionMenu,
} from '../../styles/ExpenseListStyles.style';
import { deleteExpense } from '../../service/axiosInstance';
import SpinAnimation from '../loaders/SprinAnimation.loader';
import ToastMessage from './ToastMessage.component';
import { Expense } from '../../entities/ExpenseEntity';
import CenterModalMain from './CenterModalMain.component';
import AddExpenseForm from '../directComponents/AddExpenseForm.component';
import CenterModal from './CenterModal.component';

interface ActionProps {
  options: {
    title: string;
    svg: React.ReactNode;
  }[];
  fetchExpenses: () => void;
  currentExpense: Expense;
  // onOptionSelect: (selectedOption: string) => void;
}

export const ExpenseAction: React.FC<ActionProps> = ({
  options,
  fetchExpenses,
  currentExpense,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const openDropdown = () => {
    setIsOpen(!isOpen);
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const handleIsEditModalOpen = () => {
    setIsEditModalOpen(!isEditModalOpen);
  };

  const [isDeletedToastMessage, setIsDeleteToastMessage] = useState(false);
  const handleIsDeleteToastMessage = () => {
    setIsDeleteToastMessage(!isDeletedToastMessage);
  };

  const handleDeleteModal = () => {
    setConfirmDeleteModal(!confirmDeleteModal);
  };

  const deleteSelectedExpense = async (fileId: string) => {
    try {
      setIsResponseLoading(true);
      await deleteExpense(fileId);
      handleIsDeleteToastMessage();
      fetchExpenses();
    } catch (error) {
      setIsResponseLoading(false);
      console.error('Error deleting expense:', error);
    }
  };

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    if (option == 'Delete') {
      handleDeleteModal();
    }
    if (option == 'Edit') {
      handleIsEditModalOpen();
    }
    setIsOpen(false);
    // onOptionSelect(option);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      setIsOpen(false);
    }
  };

  document.addEventListener('click', handleClickOutside);

  const handleDocumentClick = (e: any) => {
    if (isOpen && !dropdownRef.current?.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  window.addEventListener('click', handleDocumentClick);

  return (
    <>
      <ActionContainer className="dropdown-container" ref={dropdownRef}>
        <ActionMenu onClick={openDropdown}>
          <ActionIcon />
        </ActionMenu>
        {isOpen && (
          <ActionMenuContent>
            {options.map((option, index) => (
              <ActionMenuOption
                key={index}
                className={selectedOption === option.title ? 'selected' : ''}
                onClick={() => handleOptionClick(option.title)}
              >
                {option.svg}
                {option.title}
              </ActionMenuOption>
            ))}
          </ActionMenuContent>
        )}
      </ActionContainer>
      {confirmDeleteModal && (
        <span style={{ cursor: 'default' }}>
          <CenterModal
            handleModalClose={handleDeleteModal}
            handleModalSubmit={() => deleteSelectedExpense(currentExpense.id)}
            modalHeading="Delete"
            modalContent={`Are you sure want to Delete the Expense of ₹ ${currentExpense.amount}`}
          />
        </span>
      )}
      {isResponseLoading && <SpinAnimation />}
      {isDeletedToastMessage && (
        <ToastMessage
          messageType="success"
          messageHeading="Expense Deleted"
          messageBody="Expense Deleted Succesfully"
          handleClose={handleIsDeleteToastMessage}
        />
      )}
      {isEditModalOpen && (
        <span style={{ cursor: 'default' }}>
          <CenterModalMain
            heading="Edit Expense"
            modalClose={handleIsEditModalOpen}
            actualContentContainer={
              <AddExpenseForm
                handleClose={handleIsEditModalOpen}
                handleLoadExpenses={fetchExpenses}
                mode="edit"
                expense={currentExpense}
              />
            }
          />
        </span>
      )}
    </>
  );
};
