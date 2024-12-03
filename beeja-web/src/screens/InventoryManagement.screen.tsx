import { useNavigate } from 'react-router-dom';
import { Button } from '../styles/CommonStyles.style';
import {
  ExpenseHeadingSection,
  ExpenseManagementMainContainer,
} from '../styles/ExpenseManagementStyles.style';
import { ArrowDownSVG } from '../svgs/CommonSvgs.svs';
import { AddNewPlusSVG } from '../svgs/EmployeeListSvgs.svg';
import { useEffect, useState, useCallback } from 'react';
import CenterModalMain from '../components/reusableComponents/CenterModalMain.component';
import AddInventoryForm from '../components/directComponents/AddInventoryForm.component';
import InventoryList from './InventoryList.screen';
import { getInventory } from '../service/axiosInstance';
import ToastMessage from '../components/reusableComponents/ToastMessage.component';
import useKeyPress from '../service/keyboardShortcuts/onKeyPress';
import { hasPermission } from '../utils/permissionCheck';
import { INVENTORY_MODULE } from '../constants/PermissionConstants';
import { useUser } from '../context/UserContext';
import { AllInventoryResponse } from '../entities/respponses/AllInventoryItemResponse';
import { DeviceDetails } from '../entities/InventoryEntity';
import { useTranslation } from 'react-i18next';

const InventoryManagement = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const goToPreviousPage = () => {
    navigate(-1);
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const handleIsCreateModalOpen = () => {
    setIsCreateModalOpen(!isCreateModalOpen);
  };

  const [showInventoryList, setShowInventoryList] = useState(true);
  const handleSuccessMessage = () => {
    handleShowSuccessMessage();
    setShowInventoryList(true);
    setIsCreateModalOpen(false);
    fetchData();
  };

  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const handleShowSuccessMessage = () => {
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 2000);
  };

  const [inventoryList, setInventoryList] = useState<DeviceDetails[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(
    Math.ceil(totalSize ? totalSize / 10 : 0)
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPage = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage);
    setCurrentPage(1);
    handleTotalPages(totalPages ?? 1);
  };

  const handleTotalPages = (totalPages: number) => {
    setTotalPages(totalPages);
  };

  // Use useCallback to memoize fetchData
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = [];
      if (currentPage) {
        queryParams.push(`pageNumber=${currentPage}`);
      }
      if (itemsPerPage) {
        queryParams.push(`pageSize=${itemsPerPage}`);
      }
      const filteredParams = queryParams.filter((param) => param.length > 0);
      const url =
        filteredParams.length > 0
          ? `/finance/v1/inventory?${filteredParams.join('&')}`
          : '/finance/v1/inventory';
      const res = await getInventory(url);
      const metadata = res.data.metadata;
      const finalResponse: AllInventoryResponse = {
        inventory: res.data.inventory,
        metadata: metadata,
      };
      const totalPages = Math.ceil(res.data.metadata.totalSize / itemsPerPage);
      setTotalSize(metadata.totalSize);
      handleTotalPages(totalPages ?? 1);
      setInventoryList(finalResponse.inventory);
      setLoading(false);
    } catch (error) {
      throw new Error('Error fetching data:' + error);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateInventoryList = () => {
    fetchData();
  };

  useKeyPress(78, () => {
    user &&
      hasPermission(user, INVENTORY_MODULE.CREATE_DEVICE) &&
      setIsCreateModalOpen(true);
  });
  const { t } = useTranslation();
  return (
    <>
      <ExpenseManagementMainContainer>
        <ExpenseHeadingSection>
          <span className="heading">
            <span onClick={goToPreviousPage}>
              <ArrowDownSVG />
            </span>
            {t('INVENTORY_MANAGEMENT')}
          </span>
          {user && hasPermission(user, INVENTORY_MODULE.CREATE_DEVICE) && (
            <Button
              className="submit shadow"
              onClick={handleIsCreateModalOpen}
              width="216px"
            >
              <AddNewPlusSVG />
              {t('ADD_INVENTORY')}
            </Button>
          )}
        </ExpenseHeadingSection>
        {showInventoryList && (
          <InventoryList
            inventoryList={inventoryList}
            updateInventoryList={updateInventoryList}
            isLoading={loading}
            totalPages={totalPages}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            handleItemsPerPage={handleItemsPerPage}
            totalSize={totalSize}
          />
        )}
      </ExpenseManagementMainContainer>

      {isCreateModalOpen && (
        <CenterModalMain
          heading="ADD_INVENTORY"
          modalClose={handleIsCreateModalOpen}
          actualContentContainer={
            <AddInventoryForm
              handleClose={handleIsCreateModalOpen}
              handleSuccessMessage={handleSuccessMessage}
            />
          }
        />
      )}
      {showSuccessMessage && (
        <ToastMessage
          messageType="success"
          messageBody="THE_INVENTORY_HAS_BEEN_ADDED"
          messageHeading="SUCCESSFULLY_ADDED"
          handleClose={handleShowSuccessMessage}
        />
      )}
    </>
  );
};

export default InventoryManagement;
