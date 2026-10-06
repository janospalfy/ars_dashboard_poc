/** Mock data for the Insights dashboard, shaped to match the real Active
 *  Roles KPI Dashboard's Overview tab (localhost:5062). */

export type TrendDirection = 'up' | 'down' | 'warning';
export type TrendTone = 'success' | 'warning' | 'danger';

export interface StatCardData {
  id: string;
  label: string;
  value: string;
  trend?: { direction: TrendDirection; value: string; tone: TrendTone };
}

export interface DonutDatum {
  label: string;
  value: number;
  color?: string;
}

const ACTIVE_DIRECTORY_CHART_COLOR = 'var(--oi-chart-color-1)';
const ENTRA_ID_CHART_COLOR = 'var(--oi-chart-color-6)';

export const STAT_CARDS: StatCardData[] = [
  {
    id: 'users',
    label: 'Total Users',
    value: '194',
  },
  {
    id: 'groups',
    label: 'Total Groups',
    value: '688',
  },
  {
    id: 'computers',
    label: 'Total Computers',
    value: '279',
  },
];

export const USERS_BY_SOURCE: DonutDatum[] = [
  { label: 'Active Directory', value: 74, color: ACTIVE_DIRECTORY_CHART_COLOR },
  { label: 'Entra ID', value: 120, color: ENTRA_ID_CHART_COLOR },
];

export const GROUPS_BY_SOURCE: DonutDatum[] = [
  { label: 'Active Directory', value: 365, color: ACTIVE_DIRECTORY_CHART_COLOR },
  { label: 'Entra ID', value: 323, color: ENTRA_ID_CHART_COLOR },
];

export const COMPUTERS_BY_SOURCE: DonutDatum[] = [
  { label: 'Active Directory', value: 279, color: ACTIVE_DIRECTORY_CHART_COLOR },
];

