import axios, { AxiosResponse } from 'axios';
import { OriginURL, ProdOriginURL } from '../constants/UrlConstants';
import { IFeatureToggle } from '../entities/FeatureToggle';
/* eslint-disable */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const { pathname, origin } = window.location;
      const loginPath = '/login';
      const loginURL =
        origin === OriginURL || origin === ProdOriginURL
          ? `${origin}${loginPath}`
          : `${import.meta.env.VITE_API_BASE_URL}${loginPath}`;

      if (
        pathname !== '/login' &&
        pathname !== '/service-unavailable' &&
        pathname !== '/' &&
        pathname !== ''
      ) {
        window.location.href = loginURL;
      }
    }
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 503) {
      if (window.location.pathname !== '/service-unavailable') {
        window.location.href = '/service-unavailable';
      }
    }
    return Promise.reject(error);
  }
);

export const fetchMe = (): Promise<AxiosResponse> => {
  return axiosInstance.get('/accounts/v1/users/me');
};

export const updateEmployeeStatusByEmployeeId = (
  employeeId: string
): Promise<AxiosResponse> => {
  return axiosInstance.put(`/accounts/v1/users/${employeeId}/status`);
};

export const getEmployeesCount = (): Promise<AxiosResponse> => {
  return axiosInstance.get('/accounts/v1/users/count');
};

export const updateEmployeeRolesByEmployeeId = (
  employeeId: string,
  roles: string[]
): Promise<AxiosResponse> => {
  return axiosInstance.patch(`/accounts/v1/users/${employeeId}/roles`, {
    roles,
  });
};

export const createEmployee = (data: any): Promise<AxiosResponse> => {
  return axiosInstance.post('/accounts/v1/users', data);
};

export const fetchEmployeeDetailsByEmployeeId = (
  employeeId: string
): Promise<AxiosResponse> => {
  return axiosInstance.get(`/employees/v1/users/${employeeId}`);
};

export const updateEmployeeDetailsByEmployeeId = (
  employeeId: string,
  data?: any
): Promise<AxiosResponse> => {
  return axiosInstance.put(`/employees/v1/users/${employeeId}`, data);
};
export const getAllEmployees = (
  page: number,
  pageSize: number
): Promise<AxiosResponse> => {
  return axiosInstance.get(
    `/employees/v1/users?pageNumber=${page}&pageSize=${pageSize}`
  );
};

export const uploadProfilePicture = (
  file: File,
  entityId: string
): Promise<AxiosResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityId', entityId);
  return axiosInstance.post('employees/v1/files/profile-pic', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const uploadEmployeeFiles = (
  formData: FormData
): Promise<AxiosResponse> => {
  return axiosInstance.post('/employees/v1/files', formData);
};

export const getAllFilesByEmployeeId = (
  url: string
): Promise<AxiosResponse> => {
  return axiosInstance.get(url);
};

export const deleteEmployeeFile = (fileId: string): Promise<AxiosResponse> => {
  return axiosInstance.delete(`/employees/v1/files/${fileId}`);
};

export const downloadEmployeeFile = (
  fileId: string
): Promise<AxiosResponse<Blob>> => {
  return axiosInstance.get(`/employees/v1/files/download/${fileId}`, {
    responseType: 'blob',
  });
};

export const getAllExpenses = (url?: string): Promise<AxiosResponse> => {
  return axiosInstance.get(url || '/expenses/v1');
};

export const expenseReceiptDownload = (
  fileId: string
): Promise<AxiosResponse<Blob>> => {
  return axiosInstance.get(`/expenses/v1/receipts/${fileId}`, {
    responseType: 'blob',
  });
};

export const createExpense = (expense: FormData): Promise<AxiosResponse> => {
  return axiosInstance.post(`/expenses/v1`, expense, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteExpense = (expenseId: string): Promise<AxiosResponse> => {
  return axiosInstance.delete(`/expenses/v1/${expenseId}`);
};

export const updateExpense = (
  expenseId: string,
  data: any
): Promise<AxiosResponse> => {
  return axiosInstance.put(`/expenses/v1/${expenseId}`, data);
};
export const postLoan = (data: any): Promise<AxiosResponse> => {
  return axiosInstance.post(`/finance/v1/loans`, data);
};
export const postCompanyProfile = (data: any): Promise<AxiosResponse> => {
  return axiosInstance.post(`/accounts/v1/organization`, data);
};

export const uploadBulkPayslip = (data: FormData): Promise<AxiosResponse> => {
  return axiosInstance.post(`/finance/v1/payslips`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const getAllLoans = (employeeId?: string): Promise<AxiosResponse> => {
  if (employeeId) {
    return axiosInstance.get(`/finance/v1/loans/${employeeId}`);
  } else {
    return axiosInstance.get('/finance/v1/loans');
  }
};
export const statusChange = (
  Id: string,
  status: string,
  message?: string
): Promise<AxiosResponse> => {
  return axiosInstance.put(
    `/finance/v1/loans/${Id}?status=${status}&message=${message}`
  );
};

export const getHealthInsuranceDetails = (
  employeeId: string
): Promise<AxiosResponse> => {
  return axiosInstance.get(`/finance/v1/health-insurance/${employeeId}`);
};

export const updateHealthInsuranceDetails = (
  employeeId: string,
  data: any
): Promise<AxiosResponse> => {
  return axiosInstance.put(`/finance/v1/health-insurance/${employeeId}`, data);
};

export const postHealthInsuranceDetails = (
  data: any
): Promise<AxiosResponse> => {
  return axiosInstance.post(`/finance/v1/health-insurance`, data);
};

export const postInventory = (data: any): Promise<AxiosResponse> => {
  return axiosInstance.post(`/finance/v1/inventory`, data);
};

export const getInventory = (url?: string): Promise<AxiosResponse> => {
  return axiosInstance.get(url || `/finance/v1/inventory`);
};
export const putInventory = (id: string, data: any): Promise<AxiosResponse> => {
  return axiosInstance.put(`/finance/v1/inventory/${id}`, data);
};
export const deleteInventory = (id: string): Promise<AxiosResponse> => {
  return axiosInstance.delete(`/finance/v1/inventory/${id}`);
};

export const getAllRolesInOrganization = (): Promise<AxiosResponse> => {
  return axiosInstance.get('/accounts/v1/roles');
};

export const getOrganizationById = (id: string): Promise<AxiosResponse> => {
  return axiosInstance.get(`/accounts/v1/organizations/${id}`);
};

export const updateOrganizationById = (
  id: string,
  data: any
): Promise<AxiosResponse> => {
  return axiosInstance.patch(`/accounts/v1/organizations/${id}`, data);
};

export const downloadOrgFile = (): Promise<AxiosResponse<Blob>> => {
  return axiosInstance.get('accounts/v1/organizations/logo', {
    responseType: 'blob',
  });
};

export const getFeatureToggles = (): Promise<AxiosResponse> => {
  return axiosInstance.get('/accounts/v1/features');
};

export const updateFeatureTogglesByOrgId = (
  organizationId: string,
  data: IFeatureToggle
): Promise<AxiosResponse> => {
  return axiosInstance.put(`/accounts/v1/features/${organizationId}`, data);
};

export const postRole = (data: any): Promise<AxiosResponse> => {
  return axiosInstance.post(`/accounts/v1/roles`, data);
};

export const putRole = (id: string, data: any): Promise<AxiosResponse> => {
  return axiosInstance.put(`/accounts/v1/roles/${id}`, data);
};

export const deleteRole = (id: string): Promise<AxiosResponse> => {
  return axiosInstance.delete(`/accounts/v1/roles/${id}`);
};

export const updateKycDetails = (
  employeeId: string,
  data?: any
): Promise<AxiosResponse> => {
  return axiosInstance.patch(`/employees/v1/users/${employeeId}/kyc`, data);
};
