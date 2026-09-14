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

export interface MetricGroup {
  title: string;
  metrics: { label: string; value: number }[];
}

/** Active Roles category page, matching localhost:5062/ActiveRoles. */
export const ACTIVE_ROLES_METRIC_GROUPS: MetricGroup[] = [
  {
    title: 'Governance and Risk',
    metrics: [
      { label: 'Access Templates With Deny Permissions', value: 0 },
      { label: 'Empty Access Templates', value: 0 },
      { label: 'Policy Objects With No Rules', value: 13 },
      { label: 'Unlinked User-Created Access Templates', value: 12 },
      { label: 'Unlinked User-Created Policy Objects', value: 21 },
    ],
  },
  {
    title: 'Active Roles Configuration',
    metrics: [
      { label: 'AR Admins', value: 1 },
      { label: 'AR Servers', value: 7 },
      { label: 'Managed Domains', value: 6 },
      { label: 'Access Template Links', value: 24 },
      { label: 'Access Templates', value: 7 },
      { label: 'Access Templates With Deny Permissions', value: 0 },
      { label: 'Config Databases', value: 24 },
      { label: 'Dynamic Groups', value: 18 },
      { label: 'Empty Access Templates', value: 0 },
      { label: 'Group Families', value: 0 },
      { label: 'History Databases', value: 15 },
      { label: 'Managed Units', value: 24 },
      { label: 'Policy Object Links', value: 24 },
      { label: 'Policy Objects', value: 13 },
      { label: 'Policy Objects With No Rules', value: 13 },
      { label: 'Scheduled Tasks', value: 23 },
      { label: 'Unlinked User-Created Access Templates', value: 12 },
      { label: 'Unlinked User-Created Policy Objects', value: 21 },
      { label: 'Virtual Attributes', value: 15 },
      { label: 'Workflows', value: 4 },
    ],
  },
];

export interface DrillDownRow {
  id: string;
  name: string;
  distinguishedName: string;
  membership: 'Direct' | 'Indirect';
}

/** Synthetic drill-down rows for a clicked KPI tile — matches the naming
 *  convention the real dashboard's demo objects use (Object-NNNNN under
 *  CN=Users,DC=demo,DC=local), since no live directory backs this
 *  prototype. Capped at 8 rows for display. */
export function buildDrillDownRows(count: number): DrillDownRow[] {
  return Array.from({ length: Math.min(count, 8) }, (_, i) => {
    const n = String(i + 1).padStart(5, '0');
    return {
      id: `object-${n}`,
      name: `Object-${n}`,
      distinguishedName: `CN=Object-${n},CN=Users,DC=demo,DC=local`,
      membership: i % 3 === 0 ? 'Indirect' : 'Direct',
    };
  });
}
