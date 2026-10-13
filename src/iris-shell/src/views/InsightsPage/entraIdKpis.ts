import { getEntraSourceData, STAT_CARDS } from './mockInsights.js';

const entraSources = getEntraSourceData();

export interface EntraKpi {
  id: string;
  label: string;
  value: number;
  objectType: 'user' | 'group';
}

export interface EntraRow {
  id: string;
  name: string;
  tenant: string;
  distinguishedName: string;
  enabled?: string;
}

export const ENTRA_TOTALS = [
  {
    label: 'Total Users',
    value: entraSources.reduce((total, source) => total + source.users, 0),
    icon: 'Users',
    trend: STAT_CARDS.find((card) => card.id === 'user-accounts')?.trend,
  },
  {
    label: 'Total Groups',
    value: entraSources.reduce((total, source) => total + source.groups, 0),
    icon: 'UsersThree',
    trend: STAT_CARDS.find((card) => card.id === 'groups')?.trend,
  },
];

export const ENTRA_GOVERNANCE_KPIS: EntraKpi[] = [
  { id: 'empty-groups', label: 'Empty Groups', value: 53, objectType: 'group' },
  { id: 'guest-containing-groups', label: 'Guest-Containing Groups', value: 0, objectType: 'group' },
  { id: 'large-groups', label: 'Large Groups', value: 0, objectType: 'group' },
  { id: 'no-group-owner', label: 'No Group Owner', value: 0, objectType: 'group' },
  { id: 'no-manager-user', label: 'No Manager (User)', value: 64, objectType: 'user' },
  { id: 'public-m365-groups', label: 'Public M365 Groups', value: 40, objectType: 'group' },
  { id: 'single-owner-groups', label: 'Single-Owner Groups', value: 321, objectType: 'group' },
];

export const ENTRA_GROUP_KPIS: EntraKpi[] = [
  { id: 'distribution-groups', label: 'Distribution Groups', value: 63, objectType: 'group' },
  { id: 'dynamic-distribution-groups', label: 'Dynamic Distribution Groups', value: 68, objectType: 'group' },
  { id: 'empty-groups', label: 'Empty Groups', value: 53, objectType: 'group' },
  { id: 'guest-containing-groups', label: 'Guest-Containing Groups', value: 0, objectType: 'group' },
  { id: 'large-groups', label: 'Large Groups', value: 0, objectType: 'group' },
  { id: 'microsoft-365-groups', label: 'Microsoft 365 Groups', value: 87, objectType: 'group' },
  { id: 'no-group-owner', label: 'No Group Owner', value: 0, objectType: 'group' },
  { id: 'on-premises-synced-groups', label: 'On-Premises Synced Groups', value: 156, objectType: 'group' },
  { id: 'public-m365-groups', label: 'Public M365 Groups', value: 40, objectType: 'group' },
  { id: 'security-groups', label: 'Security Groups', value: 103, objectType: 'group' },
  { id: 'single-owner-groups', label: 'Single-Owner Groups', value: 321, objectType: 'group' },
];

export const ENTRA_USER_KPIS: EntraKpi[] = [
  { id: 'disabled-users', label: 'Disabled Users', value: 7, objectType: 'user' },
  { id: 'enabled-users', label: 'Enabled Users', value: 113, objectType: 'user' },
  { id: 'external-users', label: 'External Users', value: 0, objectType: 'user' },
  { id: 'guest-users', label: 'Guest Users', value: 110, objectType: 'user' },
  { id: 'internal-users', label: 'Internal Users', value: 230, objectType: 'user' },
  { id: 'no-manager-user', label: 'No Manager (User)', value: 64, objectType: 'user' },
];

export const ENTRA_SOURCE_CHARTS = [
  { title: 'Users by Source', segments: entraSources.map((source) => ({ label: source.label, value: source.users })) },
  { title: 'Groups by Source', segments: entraSources.map((source) => ({ label: source.label, value: source.groups })) },
];

export const ENTRA_GROUP_TYPE_CHART = [
  { label: 'Distribution Groups', value: 63 },
  { label: 'Dynamic Distribution Groups', value: 68 },
  { label: 'Microsoft 365 Groups', value: 87 },
  { label: 'Security Groups', value: 103 },
];

export const ENTRA_USER_CHARTS = [
  {
    title: 'Users by Account State',
    helper: 'Enabled versus disabled Entra ID users',
    segments: [
      { label: 'Enabled Users', value: 113 },
      { label: 'Disabled Users', value: 7 },
    ],
  },
  {
    title: 'Users by Origin',
    helper: 'Internal versus external Entra ID users',
    segments: [
      { label: 'Internal Users', value: 230 },
      { label: 'External Users', value: 0 },
    ],
  },
];

export const ENTRA_PAGE_SIZE = 25;

export function buildEntraRows(kpi: EntraKpi, page = 1): EntraRow[] {
  const start = (page - 1) * ENTRA_PAGE_SIZE;
  const count = Math.max(0, Math.min(ENTRA_PAGE_SIZE, kpi.value - start));
  return Array.from({ length: count }, (_, offset) => {
    const index = start + offset;
    const suffix = String(index + 1).padStart(3, '0');
    const name = `${kpi.objectType === 'group' ? 'EntraGroup' : 'EntraUser'}-${suffix}`;
    return {
      id: `${kpi.id}-${index}`,
      name,
      tenant: `Tenant-${String((index % 4) + 1).padStart(2, '0')}`,
      distinguishedName: `CN=${name},OU=${kpi.objectType === 'group' ? 'Groups' : 'Users'},OU=Entra,DC=example,DC=com`,
      ...(kpi.objectType === 'user'
        ? { enabled: kpi.id === 'disabled-users' ? 'No' : kpi.id === 'enabled-users' ? 'Yes' : index % 2 === 0 ? 'Yes' : 'No' }
        : {}),
    };
  });
}