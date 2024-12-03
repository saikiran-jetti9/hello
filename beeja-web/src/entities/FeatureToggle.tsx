export interface IFeatureToggle {
  id: string;
  organizationId: string;
  featureToggles: string[];
}

export const EFeatureToggles = {
  EMPLOYEE_MANAGEMENT: 'EMPLOYEE_MANAGEMENT',
  DOCUMENT_MANAGEMENT: 'DOCUMENT_MANAGEMENT',
  KYC_MANAGEMENT: 'KYC_MANAGEMENT',
  LOAN_MANAGEMENT: 'LOAN_MANAGEMENT',
  INVENTORY_MANAGEMENT: 'INVENTORY_MANAGEMENT',
  BULK_PAY_SLIPS: 'BULK_PAY_SLIPS',
  EXPENSE_MANAGEMENT: 'EXPENSE_MANAGEMENT',
  ORGANIZATION_SETTINGS: 'ORGANIZATION_SETTINGS',
  ORGANIZATION_SETTINGS_PROFILE: 'ORGANIZATION_SETTINGS_PROFILE',
  ORGANIZATION_SETTINGS_DATE_CURRENCY: 'ORGANIZATION_SETTINGS_DATE_CURRENCY',
  ORGANIZATION_SETTINGS_THEMES: 'ORGANIZATION_SETTINGS_THEMES',
  ORGANIZATION_SETTINGS_FONT_NAME: 'ORGANIZATION_SETTINGS_FONT_NAME',
  ORGANIZATION_SETTINGS_FONT_SIZE: 'ORGANIZATION_SETTINGS_FONT_SIZE',
  ORGANIZATION_SETTINGS_ROLES_AND_PERMISSIONS:
    'ORGANIZATION_SETTINGS_ROLES_AND_PERMISSIONS',
};
