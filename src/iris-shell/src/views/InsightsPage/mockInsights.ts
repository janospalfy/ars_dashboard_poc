/** Mock data for the Insights dashboard, shaped to match the real Active
 *  Roles KPI Dashboard's Overview tab (localhost:5062). */

export type TrendDirection = 'up' | 'down' | 'warning';
export type TrendTone = 'success' | 'warning' | 'danger';

export interface StatCardData {
  id: string;
  label: string;
  value: string;
  trend: { direction: TrendDirection; value: string; tone: TrendTone };
}

export interface DonutDatum {
  label: string;
  value: number;
}

export const STAT_CARDS: StatCardData[] = [
  {
    id: 'users',
    label: 'Total Users',
    value: '194',
    trend: { direction: 'up', value: '2.4% vs last week', tone: 'success' },
  },
  {
    id: 'groups',
    label: 'Total Groups',
    value: '688',
    trend: { direction: 'up', value: '1.1% vs last week', tone: 'success' },
  },
  {
    id: 'computers',
    label: 'Total Computers',
    value: '279',
    trend: { direction: 'down', value: '0.8% vs last week', tone: 'danger' },
  },
  {
    id: 'mailboxes',
    label: 'Total Mailboxes',
    value: '71',
    trend: { direction: 'up', value: '3.6% vs last week', tone: 'success' },
  },
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

