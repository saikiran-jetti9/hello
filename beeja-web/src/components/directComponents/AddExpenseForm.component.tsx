import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Button } from '../../styles/CommonStyles.style';
import {
  FileUploadField,
  FormFileSelected,
  InputLabelContainer,
  ValidationText,
} from '../../styles/DocumentTabStyles.style';
import { ExpenseAddFormMainContainer } from '../../styles/ExpenseManagementStyles.style';
import {
  Slider,
  StyledSwitch,
  SwitchLabel,
  TextInput,
} from '../../styles/InputStyles.style';
import { FormFileCloseIcon } from '../../svgs/DocumentTabSvgs.svg';
import {
  CalenderIconDark,
  FileTextIcon,
  UploadReceiptIcon,
} from '../../svgs/ExpenseListSvgs.svg';
import { CreateExpenseRequest } from '../../entities/Requests/CreateExpense';
import {
  createExpense,
  expenseReceiptDownload,
  updateExpense,
} from '../../service/axiosInstance';
import SpinAnimation from '../loaders/SprinAnimation.loader';
import ToastMessage from '../reusableComponents/ToastMessage.component';
import {
  compareTwoDates,
  formatDate,
  formatDateYYYYMMDD,
  getCurrentDate,
} from '../../utils/dateFormatter';
import { Expense } from '../../entities/ExpenseEntity';
import { UpdateExpenseRequest } from '../../entities/Requests/UpdateExpenseRequest';
import axios, { AxiosError } from 'axios';
import { UndoSVG } from '../../svgs/CommonSvgs.svs';
import Calendar from '../reusableComponents/Calendar.component';
import { useUser } from '../../context/UserContext';
import { EXPENSE_MODULE } from '../../constants/PermissionConstants';
import DocumentPreviewMain from '../reusableComponents/DocumentPreviewMain.component';
import DocumentDownload from './DocumentDownload.component';
import { ForbiddenError, PreviewReceiptError } from '../../constants/Constants';
import useKeyPress from '../../service/keyboardShortcuts/onKeyPress';
import { toast } from 'sonner';
import { departmentOptions } from '../../utils/departmentOptions';
import { hasPermission } from '../../utils/permissionCheck';
import useKeyCtrl from '../../service/keyboardShortcuts/onKeySave';

type AddExpenseFormProps = {
  handleClose: () => void;
  handleLoadExpenses: () => void;
  mode: 'preview' | 'create' | 'edit';
  expense?: Expense;
  // fileId: string;
  handleModeOfModal?: (modalTitle: string) => void;
};
const AddExpenseForm = (props: AddExpenseFormProps) => {
  const { user } = useUser();
  const [newExpense, setNewExpense] = useState<
    CreateExpenseRequest | undefined
  >();
  const [selectedFile, setSelectedFile] = useState<File[]>([]);
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [
    isDocumentPreviewResponseLoading,
    setIsDocumentPreviewResponseLoading,
  ] = useState(false);
  const [responseErrorMessage, setResponseErrorMessage] = useState('');
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const handleShowErrorMessage = () => {
    setShowErrorMessage(!showErrorMessage);
  };

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const handleShowSuccessMessage = () => {
    setShowSuccessMessage(!showSuccessMessage);
  };

  const fileId: string =
    props.expense?.fileId && props.expense?.files && props.expense?.files[0].id
      ? props.expense?.fileId && props.expense?.files[0].id
      : '';
  const [images, setImages] = useState(null);
  const [fileExtension, setFileExtension] = useState<string>();
  const [name, setName] = useState<string | undefined>();

  const [
    isExpenseReceiptPreviewModalOpen,
    setIsExpenseReceiptPreviewModalOpen,
  ] = useState(false);
  const handleIsExpenseReceiptPreviewModalOpen = () => {
    setIsExpenseReceiptPreviewModalOpen(!isExpenseReceiptPreviewModalOpen);
  };

  const expenseReceiptPreview = async (
    fileName: string,
    fileId: string,
    fileType: string | undefined
  ) => {
    try {
      setIsDocumentPreviewResponseLoading(true);
      const response = await expenseReceiptDownload(fileId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const imageUrl: any = window.URL.createObjectURL(
        new Blob([response.data])
      );
      setImages(imageUrl);
      setName(fileName);
      setFileExtension(fileType);
      const link = document.createElement('img');
      link.setAttribute('preview', `${fileName}.${fileType}`);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(imageUrl);
      props.handleLoadExpenses();
    } catch (error) {
      setIsDocumentPreviewResponseLoading(false);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 403) {
          setResponseErrorMessage(ForbiddenError);
          handleShowErrorMessage();
        } else if (axiosError.response?.status === 500) {
          setResponseErrorMessage(PreviewReceiptError);
          handleShowErrorMessage();
        } else {
          setResponseErrorMessage('Something happened');
          handleShowErrorMessage();
        }
      }
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newExpense) {
      // Checking undefined values and adding to list to display in toast!
      const errorMessages = [];
      if (newExpense.amount === undefined) {
        errorMessages.push('Amount');
      }
      if (newExpense.department == undefined || newExpense.department == '') {
        errorMessages.push('Department');
      }
      if (newExpense.category == undefined || newExpense.category == '') {
        errorMessages.push('Category');
      }
      if (newExpense.type == undefined || newExpense.type == '') {
        errorMessages.push('Type');
      }
      if (
        newExpense.modeOfPayment == undefined ||
        newExpense.modeOfPayment == ''
      ) {
        errorMessages.push('Mode of Payment');
      }
      if (
        newExpense.paymentMadeBy == undefined ||
        newExpense.paymentMadeBy == ''
      ) {
        errorMessages.push('Payment Made By');
      }
      if (expenseDate == undefined || expenseDate == null) {
        errorMessages.push('Expense Date');
      }
      if (requestedDate == undefined || requestedDate == null) {
        errorMessages.push('Requested Date');
      }
      if (errorMessages.length > 0) {
        handleShowErrorMessage();
        setResponseErrorMessage('Please fill ' + errorMessages);
        return;
      }
      const formData = new FormData();
      // Append each field to the FormData object
      formData.append('department', newExpense.department);
      formData.append('category', newExpense.category);
      formData.append('type', newExpense.type);
      if (newExpense.amount) {
        formData.append('amount', newExpense.amount.toString());
      }
      formData.append('currencyCode', newExpense.currencyCode);
      formData.append('modeOfPayment', newExpense.modeOfPayment);
      formData.append('merchant', newExpense.merchant);
      if (newExpense.isClaimed != null) {
        formData.append('claimed', newExpense.isClaimed.toString());
      }
      formData.append('paymentMadeBy', newExpense.paymentMadeBy);
      if (newExpense.description !== undefined) {
        formData.append('description', newExpense.description);
      } else {
        formData.append('description', 'null');
      }

      // Append files individually to prevent non null exception
      if (newExpense && newExpense.files && newExpense.files.length > 0) {
        if (newExpense.files.length > 3) {
          toast.error('Max 3 files allowed');
          return;
        }
        newExpense.files.forEach((file, index) => {
          formData.append(`files[${index}]`, file);
        });
      }
      if (expenseDate != null) {
        formData.append(
          'expenseDate',
          formatDateYYYYMMDD(expenseDate.toString())
        );
      }
      if (paymentDate != null) {
        formData.append(
          'paymentDate',
          formatDateYYYYMMDD(paymentDate.toString())
        );
      }
      if (requestedDate != null) {
        formData.append(
          'requestedDate',
          formatDateYYYYMMDD(requestedDate.toString())
        );
      }
      setIsResponseLoading(true);

      try {
        await createExpense(formData);
        handleShowSuccessMessage();
        await props.handleLoadExpenses();
        props.handleClose();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const { response } = error;
          if (response) {
            if (response.data.startsWith('At least one receipt is required')) {
              setResponseErrorMessage(
                'Please Select Files (Max 3 files allowed'
              );
              handleShowErrorMessage();
            } else if (response.status === 403) {
              window.location.reload();
            } else if (response.status === 500) {
              setResponseErrorMessage(
                'Our system is facing difficulties in creating expense, try again later'
              );
              handleShowErrorMessage();
            } else if (response.status === 413) {
              setResponseErrorMessage(response.data);
              handleShowErrorMessage();
            } else {
              setResponseErrorMessage('Something happened');
              handleShowErrorMessage();
            }
          }
        }
        setIsResponseLoading(false);
      } finally {
        setIsResponseLoading(false);
      }
    } else {
      setResponseErrorMessage('Please Fill Fields');
      handleShowErrorMessage();
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(event.dataTransfer.files);
      setSelectedFile((prevFiles) => [...prevFiles, ...droppedFiles]);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFiles = Array.from(event.target.files);
      setSelectedFile((prevFiles) => [...prevFiles, ...selectedFiles]);

      if (modeOfModal === 'create') {
        setNewExpense((prev) => ({
          ...prev!,
          files: [...(prev?.files || []), ...selectedFiles],
        }));
      } else {
        setExpenseToBeUpdated((prev) => ({
          ...prev!,
          newFiles: [...(prev?.newFiles || []), ...selectedFiles],
        }));
      }
    }
  };

  const removeFile = (index: number, type: 'create' | 'edit') => {
    if (type == 'edit') {
      setExpenseToBeUpdated((prev) => ({
        ...prev!,
        newFiles: prev?.newFiles.filter((_, i) => i !== index) || [],
      }));
      setSelectedFile((prevFiles) => {
        const newFilesCopy = [...prevFiles];
        newFilesCopy.splice(index, 1);
        return newFilesCopy;
      });
    } else {
      setNewExpense((prev) => ({
        ...prev!,
        files: prev?.files.filter((_, i) => i !== index) || [],
      }));
      setSelectedFile((prevFiles) => {
        const newFilesCopy = [...prevFiles];
        newFilesCopy.splice(index, 1);
        return newFilesCopy;
      });
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const fieldName = e.currentTarget.name;
    const fieldValue = e.currentTarget.value;

    if (fieldName === 'paymentDate' && fieldValue.length === 0) {
      setNewExpense((prevExpense) => {
        if (!prevExpense) {
          return prevExpense;
        }

        return {
          ...prevExpense,
          paymentDate: 'No Payment Date',
        };
      });
    } else if (fieldName === 'expenseDate' && fieldValue.length === 0) {
      setNewExpense((prevExpense) => {
        if (!prevExpense) {
          return prevExpense;
        }

        return {
          ...prevExpense,
          expenseDate: 'No Expense Date',
        };
      });
    } else if (fieldName === 'requestedDate' && fieldValue.length === 0) {
      setNewExpense((prevExpense) => {
        if (!prevExpense) {
          return prevExpense;
        }

        return {
          ...prevExpense,
          requestedDate: 'No Requested Date',
        };
      });
    } else {
      setNewExpense((prev) => ({
        ...prev!,
        [fieldName]: fieldValue,
      }));
    }
  };

  const [expenseToBeUpdated, setExpenseToBeUpdated] = useState<
    UpdateExpenseRequest | undefined
  >(props.expense as UpdateExpenseRequest | undefined);

  const [filedToBeDeletedWhileUpdating, setFilesToBeDeletedWhileUpdating] =
    useState<string[]>([]);
  const handleFilesToBeDeletedWhileUpdating = (fileId: string) => {
    setFilesToBeDeletedWhileUpdating((prev) => [...prev, fileId]);
  };
  const handleFilesToBeDeletedWhileUpdating_Undo = (fileId: string) => {
    setFilesToBeDeletedWhileUpdating((prev) =>
      prev.filter((id) => id !== fileId)
    );
  };
  const handleUpdateChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const fieldName = e.currentTarget.name;
    const fieldValue = e.currentTarget.value;

    if (fieldName === 'paymentDate' && fieldValue.length === 0) {
      setExpenseToBeUpdated((prevExpense) => {
        if (!prevExpense) {
          return prevExpense;
        }

        return {
          ...prevExpense,
          paymentDate: 'No Payment Date',
        };
      });
    } else if (expenseDate == null) {
      setExpenseToBeUpdated((prevExpense) => {
        if (!prevExpense) {
          return prevExpense;
        }

        return {
          ...prevExpense,
          expenseDate: 'No Expense Date',
        };
      });
    } else if (fieldName === 'requestedDate' && fieldValue.length === 0) {
      setExpenseToBeUpdated((prevExpense) => {
        if (!prevExpense) {
          return prevExpense;
        }

        return {
          ...prevExpense,
          requestedDate: 'No Requested Date',
        };
      });
    } else {
      setExpenseToBeUpdated((prevExpense) => {
        if (!prevExpense) {
          return prevExpense;
        }

        return {
          ...prevExpense,
          [fieldName]: fieldValue,
        } as UpdateExpenseRequest;
      });
    }
  };

  const handleUpdateExpenseSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (props.expense && expenseToBeUpdated) {
      // Checking undefined values and adding to list to display in toast!
      const errorMessages = [];
      if (
        expenseToBeUpdated.amount === undefined ||
        expenseToBeUpdated.amount == ''
      ) {
        errorMessages.push('Amount');
      }
      if (
        expenseToBeUpdated.department == undefined ||
        expenseToBeUpdated.department == ''
      ) {
        errorMessages.push('department');
      }
      if (
        expenseToBeUpdated.category == undefined ||
        expenseToBeUpdated.category == ''
      ) {
        errorMessages.push('Category');
      }
      if (
        expenseToBeUpdated.type == undefined ||
        expenseToBeUpdated.type == ''
      ) {
        errorMessages.push('Type');
      }
      if (
        expenseToBeUpdated.modeOfPayment == undefined ||
        expenseToBeUpdated.modeOfPayment == ''
      ) {
        errorMessages.push('Mode of Payment');
      }
      if (
        expenseToBeUpdated.paymentMadeBy == undefined ||
        expenseToBeUpdated.paymentMadeBy == ''
      ) {
        errorMessages.push('Payment Made By');
      }
      if (
        expenseToBeUpdated.expenseDate == undefined ||
        expenseToBeUpdated.expenseDate == 'No Expense Date'
      ) {
        errorMessages.push('Expense Date');
      }

      if (
        expenseToBeUpdated.requestedDate == undefined ||
        expenseToBeUpdated.requestedDate == 'No Requested Date'
      ) {
        errorMessages.push('Requested Date');
      }

      if (errorMessages.length > 0) {
        handleShowErrorMessage();
        setResponseErrorMessage('Please fill ' + errorMessages);
        return;
      }

      const formData = new FormData();
      // Append each field to the FormData object
      formData.append('department', expenseToBeUpdated.department);
      formData.append('category', expenseToBeUpdated.category);
      formData.append('type', expenseToBeUpdated.type);
      if (expenseToBeUpdated.amount) {
        formData.append('amount', expenseToBeUpdated.amount.toString());
      }
      formData.append('currencyCode', expenseToBeUpdated.currencyCode);
      formData.append('modeOfPayment', expenseToBeUpdated.modeOfPayment);
      formData.append('merchant', expenseToBeUpdated.merchant);
      if (expenseToBeUpdated.claimed != null) {
        formData.append('claimed', expenseToBeUpdated.claimed.toString());
      }
      formData.append('paymentMadeBy', expenseToBeUpdated.paymentMadeBy);
      formData.append('description', expenseToBeUpdated.description);

      // Append files individually to prevent non null exception
      if (
        expenseToBeUpdated &&
        expenseToBeUpdated.newFiles &&
        expenseToBeUpdated.newFiles.length > 0
      ) {
        expenseToBeUpdated.newFiles.forEach((file, index) => {
          formData.append(`newFiles[${index}]`, file);
        });
      }
      if (expenseDate != null) {
        formData.append(
          'expenseDate',
          formatDateYYYYMMDD(expenseDate.toString())
        );
      }
      if (paymentDate != null) {
        formData.append(
          'paymentDate',
          formatDateYYYYMMDD(paymentDate.toString())
        );
      }
      if (requestedDate != null) {
        formData.append(
          'requestedDate',
          formatDateYYYYMMDD(requestedDate.toString())
        );
      }
      if (filedToBeDeletedWhileUpdating.length > 0) {
        filedToBeDeletedWhileUpdating.forEach((fileId) => {
          formData.append('deleteFileId', fileId);
        });
      }

      setIsResponseLoading(true);
      try {
        await updateExpense(props.expense?.id, formData);
        handleShowSuccessMessage();
        await props.handleLoadExpenses();
        handleModeOfModal && handleModeOfModal('preview');
        props.handleClose();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const { response } = error;
          if (response) {
            if (response.data.startsWith('At least one receipt is required')) {
              setResponseErrorMessage(
                'Please Select Files (Max 3 files allowed'
              );
              handleShowErrorMessage();
            } else if (response.status === 403) {
              window.location.reload();
            } else if (response.status === 500) {
              setResponseErrorMessage(
                'Our system is facing difficulties in creating expense, try again later'
              );
              handleShowErrorMessage();
            } else if (response.status === 413) {
              setResponseErrorMessage(response.data);
              handleShowErrorMessage();
            } else {
              setResponseErrorMessage('Something happened');
              handleShowErrorMessage();
            }
          }
        }
        setIsResponseLoading(false);
      } finally {
        setIsResponseLoading(false);
      }
    } else {
      setResponseErrorMessage('Please Fill Fields');
      handleShowErrorMessage();
    }
  };

  const [departments, setDepartments] = useState<string>('');
  const [categories, setCategories] = useState<string>('');
  const [types, setTypes] = useState<string>('');

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    const selectedDepartment = e.target.value;
    setDepartments(selectedDepartment);
    setCategories(''); // Reset category and type on department change
    setTypes('');
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    const selectedCategory = e.target.value;
    setCategories(selectedCategory);
    setTypes('');
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    const selectedType = e.target.value;
    setTypes(selectedType);
  };

  // changing mode from props
  const [modeOfModal, setModeOfModal] = useState(props.mode);
  const handleModeOfModal = (mode: 'edit' | 'preview' | 'create') => {
    mode === 'preview'
      ? props.handleModeOfModal && props.handleModeOfModal('Expense Preview')
      : setModeOfModal(mode);
  };

  const [checkClaim, setCheckClaim] = useState(
    modeOfModal === 'edit' ? props.expense?.claimed : false
  );
  const handleClaimCheck = () => {
    setCheckClaim(!checkClaim);
    setNewExpense((prev) => ({
      ...prev!,
      isClaimed: !checkClaim,
    }));
    setExpenseToBeUpdated((prev) => ({
      ...prev!,
      isClaimed: !checkClaim,
    }));
  };

  const [checkUpdateClaim, setCheckUpdateClaim] = useState(
    props.expense?.claimed
  );

  const handleUpdateClaimCheck = () => {
    setCheckUpdateClaim(!checkUpdateClaim);
    setExpenseToBeUpdated((prev) => ({
      ...prev!,
      isClaimed: !checkUpdateClaim,
    }));
    // setExpenseToBeUpdated((prev) => ({
    //   ...prev!,
    //   isClaimed: !checkClaim,
    // }));
  };
  const calendarFromRef = useRef<HTMLDivElement>(null);
  const handleClickOutside = (event: MouseEvent) => {
    if (
      calendarFromRef.current &&
      !calendarFromRef.current.contains(event.target as Node)
    ) {
      handleCalenderOpen(false, 'expense');
    }
  };
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calendarPaymentRef = useRef<HTMLDivElement>(null);
  const handleClickOutsidePayment = (event: MouseEvent) => {
    if (
      calendarPaymentRef.current &&
      !calendarPaymentRef.current.contains(event.target as Node)
    ) {
      handleCalenderOpen(false, 'payment');
    }
  };
  useEffect(() => {
    document.addEventListener('click', handleClickOutsidePayment);

    return () => {
      document.removeEventListener('click', handleClickOutsidePayment);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calendarRequestedRef = useRef<HTMLDivElement>(null);
  const handleClickOutsideRequested = (event: MouseEvent) => {
    if (
      calendarRequestedRef.current &&
      !calendarRequestedRef.current.contains(event.target as Node)
    ) {
      handleCalenderOpen(false, 'requested');
    }
  };
  useEffect(() => {
    document.addEventListener('click', handleClickOutsideRequested);

    return () => {
      document.removeEventListener('click', handleClickOutsideRequested);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isCalenderOpen, setIsCalenderOpen] = useState<boolean>(false);
  const [isPaymentCalenderOpen, setIsPaymentCalenderOpen] =
    useState<boolean>(false);
  const [isRequestedCalenderOpen, setIsRequestedCalenderOpen] =
    useState<boolean>(false);
  const handleCalenderOpen = (
    isOpen: boolean,
    calenderType: 'expense' | 'payment' | 'requested'
  ) => {
    if (calenderType == 'expense') {
      setIsCalenderOpen(isOpen);
    } else if (calenderType == 'payment') {
      setIsPaymentCalenderOpen(isOpen);
    } else {
      setIsRequestedCalenderOpen(isOpen);
    }
  };
  const [expenseDate, setExpenseDate] = useState<Date | null>();
  const [requestedDate, setRequestedDate] = useState<Date | null>();
  const [paymentDate, setPaymentDate] = useState<Date | null>();
  useEffect(() => {
    if (modeOfModal == 'edit' && props.expense) {
      setExpenseDate(
        new Date(formatDateYYYYMMDD(props.expense?.expenseDate.toString()))
      );
      if (props.expense && props.expense.paymentDate) {
        setPaymentDate(
          new Date(formatDateYYYYMMDD(props.expense?.paymentDate.toString()))
        );
      }
      setRequestedDate(
        new Date(formatDateYYYYMMDD(props.expense?.requestedDate.toString()))
      );
    }
  }, [modeOfModal, props.expense, props.expense?.expenseDate]);

  useKeyPress(27, () => {
    if (modeOfModal === 'preview') {
      props.handleClose();
    }
  });
  useEffect(() => {
    if ((props.mode === 'preview' || props.mode === 'edit') && props.expense) {
      setDepartments(props.expense.department || '');
      setCategories(props.expense.category || '');
      setTypes(props.expense.type || '');
    }
  }, [props.mode, props.expense]);

  useKeyCtrl('s', () =>
    handleExpenseSubmit(event as unknown as React.FormEvent<HTMLFormElement>)
  );
  useKeyPress(27, () => {
    props.handleClose();
  });
  return (
    <ExpenseAddFormMainContainer
      onSubmit={
        props.mode === 'create'
          ? handleExpenseSubmit
          : handleUpdateExpenseSubmit
      }
    >
      <div className="formInputs">
        <div>
          <InputLabelContainer>
            <label>
              Department{' '}
              {modeOfModal !== 'preview' && (
                <ValidationText className="star">*</ValidationText>
              )}
            </label>
            <select
              className="selectoption largeSelectOption"
              name="department"
              value={departments}
              onChange={(e) => {
                handleDepartmentChange(e);
                props.mode === 'create'
                  ? handleChange(e)
                  : handleUpdateChange(e);
              }}
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                }
              }}
              disabled={modeOfModal === 'preview' && true}
            >
              {modeOfModal === 'preview' &&
              props.expense?.department === null ? (
                <option value="-">-</option>
              ) : (
                <>
                  <option value="">Select Department</option>
                  {departmentOptions.departments.map((dept) => (
                    <option
                      key={dept}
                      value={dept}
                      selected={
                        (modeOfModal === 'edit' || modeOfModal === 'preview') &&
                        props.expense?.department === dept
                      }
                    >
                      {dept}
                    </option>
                  ))}
                </>
              )}
            </select>
          </InputLabelContainer>
          <InputLabelContainer>
            <label>
              Type of Expense{' '}
              {modeOfModal !== 'preview' && (
                <ValidationText className="star">*</ValidationText>
              )}
            </label>
            <select
              className="selectoption largeSelectOption"
              name="type"
              value={types}
              onChange={(e) => {
                handleTypeChange(e);
                props.mode === 'create'
                  ? handleChange(e)
                  : handleUpdateChange(e);
              }}
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                }
              }}
              disabled={modeOfModal === 'preview' && true}
            >
              {modeOfModal === 'preview' && props.expense?.type === null ? (
                <option value="-">-</option>
              ) : (
                <>
                  <option value="">Select Type</option>
                  {departmentOptions.types.map((type) => (
                    <option
                      key={type}
                      value={type}
                      selected={
                        (modeOfModal === 'edit' || modeOfModal === 'preview') &&
                        props.expense?.type === type
                      }
                    >
                      {type}
                    </option>
                  ))}
                </>
              )}
            </select>
          </InputLabelContainer>
          <InputLabelContainer>
            <label>
              Mode of Payment{' '}
              {modeOfModal !== 'preview' && (
                <ValidationText className="star">*</ValidationText>
              )}
            </label>
            <select
              className="selectoption largeSelectOption"
              name="modeOfPayment"
              onChange={
                props.mode === 'create' ? handleChange : handleUpdateChange
              }
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                }
              }}
              disabled={modeOfModal === 'preview' && true}
            >
              <option value="">Select Mode</option>
              <option
                value="UPI"
                selected={
                  (modeOfModal === 'edit' || modeOfModal === 'preview') &&
                  props.expense?.modeOfPayment === 'UPI'
                }
              >
                UPI
              </option>
              <option
                value="Credit Card"
                selected={
                  (modeOfModal === 'edit' || modeOfModal === 'preview') &&
                  props.expense?.modeOfPayment === 'Credit Card'
                }
              >
                Credit Card
              </option>
              <option
                value="Petty Cash"
                selected={
                  (modeOfModal === 'edit' || modeOfModal === 'preview') &&
                  props.expense?.modeOfPayment === 'Petty Cash'
                }
              >
                Petty Cash
              </option>
              <option
                value="Online"
                selected={
                  (modeOfModal === 'edit' || modeOfModal === 'preview') &&
                  props.expense?.modeOfPayment === 'Online'
                }
              >
                Online
              </option>
              <option
                value="Others"
                selected={
                  (modeOfModal === 'edit' || modeOfModal === 'preview') &&
                  props.expense?.modeOfPayment === 'Others'
                }
              >
                Others
              </option>
            </select>
          </InputLabelContainer>
          <InputLabelContainer>
            <label>
              Who made the Payment ?{' '}
              {modeOfModal !== 'preview' && (
                <ValidationText className="star">*</ValidationText>
              )}
            </label>
            <select
              className="selectoption largeSelectOption"
              name="paymentMadeBy"
              onChange={
                props.mode === 'create' ? handleChange : handleUpdateChange
              }
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                }
              }}
              disabled={modeOfModal === 'preview' && true}
            >
              <option value="">Select</option>
              <option
                value="Accounts Manager"
                selected={
                  (modeOfModal === 'edit' || modeOfModal === 'preview') &&
                  props.expense?.paymentMadeBy === 'Accounts Manager'
                }
              >
                Accounts Manager
              </option>
              <option
                value="Super Admin"
                selected={
                  (modeOfModal === 'edit' || modeOfModal === 'preview') &&
                  props.expense?.paymentMadeBy === 'Super Admin'
                }
              >
                Super Admin
              </option>
            </select>
          </InputLabelContainer>
          <InputLabelContainer>
            <label>
              Requested Date{' '}
              {modeOfModal !== 'preview' && (
                <ValidationText className="star">*</ValidationText>
              )}
            </label>
            <span ref={calendarRequestedRef} className="calendarField">
              <TextInput
                type="text"
                placeholder="Enter Date"
                name="requestedDate"
                onChange={
                  modeOfModal === 'create' ? handleChange : handleUpdateChange
                }
                onKeyPress={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                  }
                }}
                min={
                  modeOfModal === 'edit'
                    ? expenseToBeUpdated?.expenseDate
                      ? expenseToBeUpdated.expenseDate.slice(0, 10)
                      : ''
                    : newExpense?.expenseDate || ''
                }
                max={getCurrentDate()}
                className={modeOfModal === 'preview' ? 'disabledPreview' : ''}
                value={
                  requestedDate
                    ? formatDate(requestedDate.toString())
                    : modeOfModal === 'preview' && props.expense
                      ? formatDate(props.expense?.requestedDate.toString())
                      : ''
                }
                onFocus={() => handleCalenderOpen(true, 'requested')}
                disabled={expenseDate == null}
                autoComplete="off"
              />
              <span
                className="iconArea"
                onClick={() =>
                  expenseDate && handleCalenderOpen(true, 'requested')
                }
              >
                <CalenderIconDark />
              </span>
              <div className="calendarSpace" ref={calendarRequestedRef}>
                {isRequestedCalenderOpen && (
                  <Calendar
                    title="Requested Date"
                    minDate={expenseDate ? expenseDate : null}
                    maxDate={new Date()}
                    handleDateInput={(selectedDate) => {
                      setRequestedDate(selectedDate);
                      handleCalenderOpen(false, 'requested');
                      if (
                        selectedDate &&
                        paymentDate &&
                        selectedDate > paymentDate
                      ) {
                        setPaymentDate(null);
                      }
                    }}
                    selectedDate={requestedDate ? requestedDate : null}
                    handleCalenderChange={function (): void {
                      throw new Error('Function not implemented.');
                    }}
                  />
                )}
              </div>
            </span>
          </InputLabelContainer>
          <InputLabelContainer>
            <label>Description</label>
            <TextInput
              className={modeOfModal === 'preview' ? 'disabledPreview' : ''}
              type="text"
              placeholder="Description (Optional)"
              name="description"
              onChange={
                props.mode === 'create' ? handleChange : handleUpdateChange
              }
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                }
              }}
              readOnly={modeOfModal === 'preview'}
              value={
                modeOfModal === 'preview'
                  ? props.expense?.description
                    ? props.expense.description === 'undefined'
                      ? '-'
                      : props.expense.description
                    : '-'
                  : modeOfModal === 'edit'
                    ? expenseToBeUpdated?.description &&
                      expenseToBeUpdated.description !== 'undefined'
                      ? expenseToBeUpdated.description
                      : ''
                    : newExpense?.description ?? ''
              }
              disabled={modeOfModal === 'preview'}
            />
          </InputLabelContainer>
          <InputLabelContainer>
            <label>Claim Expense</label>
            <SwitchLabel>
              <StyledSwitch
                type="checkbox"
                onChange={
                  modeOfModal === 'create'
                    ? handleClaimCheck
                    : handleUpdateClaimCheck
                }
                name="isClaimed"
                disabled={modeOfModal === 'preview'}
                checked={
                  modeOfModal === 'create'
                    ? props.expense && props.mode === 'preview'
                      ? props.expense.claimed
                      : checkClaim
                    : checkUpdateClaim
                }
              />
              <Slider />
            </SwitchLabel>
          </InputLabelContainer>
        </div>
        <div>
          <InputLabelContainer>
            <label>
              Category{' '}
              {modeOfModal !== 'preview' && (
                <ValidationText className="star">*</ValidationText>
              )}
            </label>
            <select
              className="selectoption largeSelectOption"
              name="category"
              value={categories}
              onChange={(e) => {
                handleCategoryChange(e);
                props.mode === 'create'
                  ? handleChange(e)
                  : handleUpdateChange(e);
              }}
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                }
              }}
              disabled={modeOfModal === 'preview' && true}
            >
              {modeOfModal === 'preview' && props.expense?.category === null ? (
                <option value="-">-</option>
              ) : (
                <>
                  <option value="">Select Category</option>
                  {departmentOptions.categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                      selected={
                        (modeOfModal === 'edit' || modeOfModal === 'preview') &&
                        props.expense?.category === category
                      }
                    >
                      {category}
                    </option>
                  ))}
                </>
              )}
            </select>
          </InputLabelContainer>
          <InputLabelContainer>
            <label>
              Amount{' '}
              {modeOfModal !== 'preview' && (
                <ValidationText className="star">*</ValidationText>
              )}
            </label>
            <TextInput
              className={modeOfModal === 'preview' ? 'disabledPreview' : ''}
              type="text"
              name="amount"
              onChange={
                props.mode === 'create' ? handleChange : handleUpdateChange
              }
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                } else {
                  const isNumeric = /^\d+$/.test(e.key);
                  if (!isNumeric) {
                    e.preventDefault();
                  }
                }
              }}
              // value={
              //   props.expense && props.mode !== 'create'
              //     ? `₹ ${props.expense.amount}`
              //     : 'Enter Amount (₹)'
              // }
              value={
                expenseToBeUpdated
                  ? expenseToBeUpdated.amount
                  : newExpense?.amount
              }
              placeholder={'Enter Amount (₹)'}
              disabled={modeOfModal === 'preview' && true}
            />
          </InputLabelContainer>
          <InputLabelContainer>
            <label>Merchant</label>
            <TextInput
              className={modeOfModal === 'preview' ? 'disabledPreview' : ''}
              type="text"
              placeholder="Example: flipkart"
              name="merchant"
              onChange={
                props.mode === 'create' ? handleChange : handleUpdateChange
              }
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                }
              }}
              value={
                modeOfModal === 'create'
                  ? newExpense?.merchant
                  : expenseToBeUpdated?.merchant != 'undefined'
                    ? expenseToBeUpdated?.merchant
                    : ''
              }
              disabled={modeOfModal === 'preview' && true}
            />
          </InputLabelContainer>
          <InputLabelContainer ref={calendarFromRef}>
            <label>
              Expense Date{' '}
              {modeOfModal !== 'preview' && (
                <ValidationText className="star">*</ValidationText>
              )}
            </label>
            <span ref={calendarFromRef} className="calendarField">
              <TextInput
                type="text"
                placeholder="Enter Date"
                name="expenseDate"
                onKeyPress={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                  }
                }}
                className={modeOfModal === 'preview' ? 'disabledPreview' : ''}
                disabled={modeOfModal === 'preview'}
                value={
                  expenseDate
                    ? formatDate(expenseDate.toString())
                    : modeOfModal === 'preview' && props.expense
                      ? formatDate(props.expense?.expenseDate.toString())
                      : modeOfModal === 'edit' && expenseToBeUpdated
                        ? formatDate(expenseToBeUpdated.expenseDate.toString())
                        : ''
                }
                onFocus={() => handleCalenderOpen(true, 'expense')}
                autoComplete="off"
              />
              <span
                className="iconArea"
                onClick={() => handleCalenderOpen(true, 'expense')}
              >
                <CalenderIconDark />
              </span>
              <div className="calendarSpace" ref={calendarFromRef}>
                {isCalenderOpen && (
                  <Calendar
                    title="Expense Date"
                    minDate={new Date('01-20-2020')}
                    maxDate={new Date()}
                    handleDateInput={(selectedDate) => {
                      setExpenseDate(selectedDate);
                      handleCalenderOpen(false, 'expense');

                      if (
                        selectedDate &&
                        requestedDate &&
                        selectedDate > requestedDate
                      ) {
                        setRequestedDate(null);
                        setPaymentDate(null);
                      }
                      // Clearing requested date if selected date is more
                      // than existing request date
                      if (
                        modeOfModal === 'edit' &&
                        props.expense &&
                        selectedDate &&
                        compareTwoDates(
                          selectedDate.toString(),
                          expenseDate?.toString()
                        )
                      ) {
                        setRequestedDate(null);
                        setPaymentDate(null);
                      }
                    }}
                    selectedDate={expenseDate || null}
                    handleCalenderChange={function (): void {
                      throw new Error('Function not implemented.');
                    }}
                  />
                )}
              </div>
            </span>
          </InputLabelContainer>
          <InputLabelContainer>
            <label>Payment Settled </label>
            <span ref={calendarPaymentRef} className="calendarField">
              <TextInput
                type="text"
                placeholder="Enter Date"
                name="paymentDate"
                onChange={
                  modeOfModal === 'create' ? handleChange : handleUpdateChange
                }
                onKeyPress={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                  }
                }}
                min={
                  modeOfModal === 'edit'
                    ? expenseToBeUpdated?.requestedDate.slice(0, 10)
                    : newExpense?.requestedDate
                }
                max={getCurrentDate()}
                className={modeOfModal === 'preview' ? 'disabledPreview' : ''}
                value={
                  paymentDate
                    ? formatDate(paymentDate.toString())
                    : modeOfModal === 'preview' &&
                        props.expense &&
                        props.expense.paymentDate
                      ? formatDate(props.expense.paymentDate.toString())
                      : ''
                }
                onFocus={() => handleCalenderOpen(true, 'payment')}
                disabled={requestedDate == null}
                autoComplete="off"
              />
              <span
                className="iconArea"
                onClick={() =>
                  requestedDate && handleCalenderOpen(true, 'payment')
                }
              >
                <CalenderIconDark />
              </span>
              <div className="calendarSpace" ref={calendarPaymentRef}>
                {isPaymentCalenderOpen && (
                  <Calendar
                    title="Payment Date"
                    minDate={requestedDate ? requestedDate : null}
                    maxDate={new Date()}
                    handleDateInput={(selectedDate) => {
                      setPaymentDate(selectedDate);
                      handleCalenderOpen(false, 'payment');
                    }}
                    selectedDate={paymentDate ? paymentDate : null}
                    handleCalenderChange={function (): void {
                      throw new Error('Function not implemented.');
                    }}
                  />
                )}
              </div>
            </span>
          </InputLabelContainer>
          {modeOfModal === 'create' ? (
            <InputLabelContainer className="fileInputSelected">
              <div>
                <label>Upload Receipts</label>{' '}
              </div>
              <FileUploadField
                className="expenseReceiptUpload"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <label htmlFor="fileInput">
                  <div>
                    <UploadReceiptIcon />
                    <div>
                      Drag and drop or
                      <span> browse </span>
                    </div>
                  </div>
                </label>
                {selectedFile.length < 3 ? (
                  <input
                    type="file"
                    accept="application/pdf,image/png,image/jpeg"
                    id="fileInput"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    multiple
                    onKeyPress={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                      }
                    }}
                    maxLength={3}
                  />
                ) : (
                  <span title="Maximum 3"></span>
                )}
              </FileUploadField>
              {selectedFile.length > 0 && (
                <div className="selectedFilesMain">
                  {selectedFile.map((file, index) => (
                    <FormFileSelected key={index}>
                      <FileTextIcon />
                      <span>{file.name}</span>
                      <span
                        className="redPointer"
                        onClick={() => removeFile(index, 'create')}
                      >
                        <FormFileCloseIcon />
                      </span>
                    </FormFileSelected>
                  ))}
                </div>
              )}
              <span className="fileFormatText">
                File format : .pdf, .png, .jpeg (Maximum 3 files of 10MB each)
              </span>
            </InputLabelContainer>
          ) : modeOfModal === 'edit' ? (
            <InputLabelContainer className="fileInputSelected">
              <div>
                <label>Upload Receipts</label>{' '}
              </div>
              <FileUploadField
                className="expenseReceiptUpload"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <label htmlFor="fileInput">
                  <div>
                    <UploadReceiptIcon />
                    <div>
                      Drag and drop or
                      <span> browse </span>
                    </div>
                  </div>
                </label>
                {selectedFile.length < 3 ? (
                  <input
                    type="file"
                    accept="application/pdf,image/png,image/jpeg"
                    id="fileInput"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    multiple
                    onKeyPress={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                      }
                    }}
                  />
                ) : (
                  <span title="Maximum 3"></span>
                )}
              </FileUploadField>
              {props.expense &&
                props.expense.files &&
                props.expense?.files.length > 0 && (
                  <div className="selectedFilesMain">
                    {props.expense.files.map((file, index) => (
                      <FormFileSelected
                        key={index}
                        style={{
                          border: `${
                            filedToBeDeletedWhileUpdating.includes(file.id)
                              ? '1.5px dashed #e74d3c9c'
                              : '1.5px dashed white'
                          }`,
                          padding: filedToBeDeletedWhileUpdating.includes(
                            file.id
                          )
                            ? '3px 12.5px 3px 12px'
                            : '6px 12.5px 6px 12px',
                        }}
                        title={
                          filedToBeDeletedWhileUpdating.includes(file.id)
                            ? 'File Deleted'
                            : ''
                        }
                      >
                        {filedToBeDeletedWhileUpdating.includes(file.id) ? (
                          <span
                            title="Undo Delete"
                            onClick={() =>
                              handleFilesToBeDeletedWhileUpdating_Undo(file.id)
                            }
                          >
                            <UndoSVG />
                          </span>
                        ) : (
                          <FileTextIcon />
                        )}
                        <span>{file.name}</span>
                        <span
                          className="redPointer"
                          onClick={() =>
                            handleFilesToBeDeletedWhileUpdating(file.id)
                          }
                        >
                          {!filedToBeDeletedWhileUpdating.includes(file.id) && (
                            <FormFileCloseIcon />
                          )}
                        </span>
                      </FormFileSelected>
                    ))}
                  </div>
                )}
              {selectedFile.length > 0 && (
                <div className="selectedFilesMain">
                  {selectedFile.map((file, index) => (
                    <FormFileSelected key={index}>
                      <FileTextIcon />
                      <span>{file.name}</span>
                      <span
                        className="redPointer"
                        onClick={() => removeFile(index, 'edit')}
                      >
                        <FormFileCloseIcon />
                      </span>
                    </FormFileSelected>
                  ))}
                </div>
              )}
              <span className="fileFormatText">
                File format : .pdf, .png, .jpeg (Maximum 3 files of 10MB each)
              </span>
            </InputLabelContainer>
          ) : (
            <InputLabelContainer>
              <div>
                <label>Uploaded Receipts</label>{' '}
              </div>
              {props.expense &&
                props.expense.files &&
                props.expense?.files.length > 0 && (
                  <div className="selectedFilesMain">
                    {props.expense.files.map((file, index) => (
                      <FormFileSelected key={index}>
                        <FileTextIcon />
                        {!isExpenseReceiptPreviewModalOpen && (
                          <span
                            onClick={() => {
                              handleIsExpenseReceiptPreviewModalOpen();
                              expenseReceiptPreview(
                                file.name,
                                file.id,
                                file.name.split('.').pop()
                              );
                            }}
                          >
                            {file.name}
                          </span>
                        )}
                        {/* <span>{file.name}</span> */}
                      </FormFileSelected>
                    ))}
                  </div>
                )}
            </InputLabelContainer>
          )}
        </div>
      </div>
      <div className="formButtons">
        <Button
          fontSize="16px"
          onClick={() => {
            props.handleClose();
            props.handleModeOfModal &&
              props.handleModeOfModal('Expense Preview');
          }}
        >
          Cancel
        </Button>

        {modeOfModal === 'create' ? (
          <Button fontSize="16px" className="submit">
            Submit
          </Button>
        ) : modeOfModal === 'edit' &&
          user &&
          hasPermission(user, EXPENSE_MODULE.UPDATE_EXPENSE) ? (
          <Button fontSize="16px" className="submit">
            Update
          </Button>
        ) : user && hasPermission(user, EXPENSE_MODULE.UPDATE_EXPENSE) ? (
          // <div className="submitButton">Save Changes</div>
          <div
            className="submitButton"
            onClick={() => {
              handleModeOfModal('edit');
              props.handleModeOfModal &&
                props.handleModeOfModal('Edit Expense');
            }}
          >
            Edit
          </div>
        ) : (
          ''
        )}
      </div>
      {showErrorMessage && (
        <ToastMessage
          messageType="error"
          messageBody={responseErrorMessage}
          messageHeading="Expense is Unsuccessful"
          handleClose={handleShowErrorMessage}
        />
      )}
      {showSuccessMessage && (
        <ToastMessage
          messageType="success"
          messageBody="The Expense has been added successfully"
          messageHeading="Successfully Added"
          handleClose={handleShowSuccessMessage}
        />
      )}
      {isExpenseReceiptPreviewModalOpen &&
        (!isDocumentPreviewResponseLoading && images ? (
          <DocumentPreviewMain
            heading="Receipt Preview"
            subHeading={name}
            modalSVG={
              props.expense &&
              props.expense.files &&
              props.expense?.files.length > 0 && (
                <DocumentDownload
                  fileExtension={fileExtension}
                  fileName={name}
                  fileId={fileId}
                />
              )
            }
            modalClose={handleIsExpenseReceiptPreviewModalOpen}
            fileExtension={fileExtension}
            images={images}
          />
        ) : (
          isDocumentPreviewResponseLoading && <SpinAnimation />
        ))}
      {isResponseLoading && <SpinAnimation />}
    </ExpenseAddFormMainContainer>
  );
};

export default AddExpenseForm;
