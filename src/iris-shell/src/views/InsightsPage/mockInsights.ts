/** Mock data for the Insights dashboard, shaped to match the real Active
 *  Roles KPI Dashboard's Overview tab (localhost:5062). */

export interface StatCardData {
  id: string;
  label: string;
  value: string;
}

export interface DonutDatum {
  label: string;
  value: number;
}

export const STAT_CARDS: StatCardData[] = [
  { id: 'users', label: 'Total Users', value: '194' },
  { id: 'groups', label: 'Total Groups', value: '688' },
  { id: 'computers', label: 'Total Computers', value: '279' },
  { id: 'mailboxes', label: 'Total Mailboxes', value: '71' },
];

export const USERS_BY_SOURCE: DonutDatum[] = [
  { label: 'Active Directory', value: 74 },
  { label: 'Entra ID', value: 120 },
];

export const GROUPS_BY_SOURCE: DonutDatum[] = [
  { label: 'Active Directory', value: 365 },
  { label: 'Entra ID', value: 323 },
];

export const COMPUTERS_BY_SOURCE: DonutDatum[] = [{ label: 'Active Directory', value: 279 }];
