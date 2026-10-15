import type { KpiColumn, KpiDefinition, KpiRow } from './activeRolesKpis.js';
import type { StatCardTrend } from '../../components/StatCard/StatCard.js';

export type ExchangeCategoryId = 'infrastructure' | 'mailboxes' | 'groups' | 'permissions';
export type ExchangeObjectType = 'server' | 'database' | 'domain' | 'mailbox' | 'group' | 'permission';

export interface ExchangeKpi extends KpiDefinition {
  categoryId: ExchangeCategoryId;
  objectType: ExchangeObjectType;
}

export interface ExchangeOverviewMetric {
  id: string;
  label: string;
  value: number;
  icon: string;
  trend: StatCardTrend;
}

const DOMAIN_COLUMN: KpiColumn = {
  key: 'domain',
  header: 'Domain',
  type: 'text',
  values: ['corp.example.com', 'emea.example.com', 'apac.example.com'],
};

const DIRECTORY_COLUMNS: KpiColumn[] = [
  { key: 'name', header: 'Name', type: 'text' },
  DOMAIN_COLUMN,
  { key: 'distinguishedName', header: 'Distinguished Name', type: 'text' },
];

function exchangeKpi(
  id: string,
  label: string,
  value: number,
  categoryId: ExchangeCategoryId,
  objectType: ExchangeObjectType,
  namePrefix: string,
  options: { risk?: boolean; columns?: KpiColumn[] } = {},
): ExchangeKpi {
  return {
    id,
    label,
    value,
    categoryId,
    objectType,
    namePrefix,
    columns: options.columns ?? DIRECTORY_COLUMNS,
    ...(options.risk ? { risk: true } : {}),
  };
}

// Static synthetic counts follow the reference dashboard's KPI definitions.
export const EXCHANGE_OVERVIEW: ExchangeOverviewMetric[] = [
  { id: 'servers', label: 'Exchange Servers', value: 7, icon: 'Devices', trend: { direction: 'up', value: '2.4% vs last week', tone: 'success' } },
  { id: 'mailboxes', label: 'Total Mailboxes', value: 4800, icon: 'Mailbox', trend: { direction: 'up', value: '1.1% vs last week', tone: 'success' } },
  { id: 'databases', label: 'Mailbox Databases', value: 12, icon: 'Stack', trend: { direction: 'down', value: '0.8% vs last week', tone: 'danger' } },
  { id: 'domains', label: 'Accepted Domains', value: 8, icon: 'Globe', trend: { direction: 'up', value: '3.6% vs last week', tone: 'success' } },
];

export const EXCHANGE_INFRASTRUCTURE_KPIS: ExchangeKpi[] = [
  exchangeKpi('mailbox-servers', 'Mailbox Servers', 6, 'infrastructure', 'server', 'EXCH'),
  exchangeKpi('database-availability-groups', 'Database Availability Groups', 2, 'infrastructure', 'server', 'DAG'),
];

export const EXCHANGE_MAILBOX_KPIS: ExchangeKpi[] = [
  exchangeKpi('user-mailboxes', 'User Mailboxes', 3760, 'mailboxes', 'mailbox', 'UserMailbox', {
    columns: [...DIRECTORY_COLUMNS, { key: 'mailboxDatabase', header: 'Mailbox Database', type: 'text', values: ['MDB-01', 'MDB-02', 'MDB-03'] }],
  }),
  exchangeKpi('shared-mailboxes', 'Shared Mailboxes', 720, 'mailboxes', 'mailbox', 'SharedMailbox'),
  exchangeKpi('room-mailboxes', 'Room Mailboxes', 180, 'mailboxes', 'mailbox', 'RoomMailbox'),
  exchangeKpi('equipment-mailboxes', 'Equipment Mailboxes', 140, 'mailboxes', 'mailbox', 'EquipmentMailbox'),
  exchangeKpi('mail-enabled-users', 'Mail Enabled User', 85, 'mailboxes', 'mailbox', 'MailUser'),
  exchangeKpi('mail-enabled-contacts', 'Mail Enabled Contact', 64, 'mailboxes', 'mailbox', 'MailContact'),
  exchangeKpi('unmanaged-mailboxes', 'Unmanaged Mailboxes', 24, 'mailboxes', 'mailbox', 'UnmanagedMailbox', { risk: true }),
  exchangeKpi('orphaned-mailboxes', 'Orphaned Mailboxes (Disabled)', 9, 'mailboxes', 'mailbox', 'OrphanedMailbox', { risk: true }),
  exchangeKpi('litigation-hold-disabled', 'Litigation Hold Disabled', 31, 'mailboxes', 'mailbox', 'Mailbox', { risk: true }),
];

export const EXCHANGE_GROUP_KPIS: ExchangeKpi[] = [
  exchangeKpi('distribution-groups', 'Distribution Groups', 320, 'groups', 'group', 'DistributionGroup'),
  exchangeKpi('mail-enabled-security-groups', 'Mail-Enabled Security Groups', 94, 'groups', 'group', 'MailSecurityGroup'),
  exchangeKpi('dynamic-distribution-groups', 'Dynamic Distribution Groups', 28, 'groups', 'group', 'DynamicDistributionGroup'),
  exchangeKpi('groups-with-no-owner', 'Groups With No Owner', 19, 'groups', 'group', 'GroupNoOwner', { risk: true }),
  exchangeKpi('empty-distribution-groups', 'Empty Distribution Groups', 12, 'groups', 'group', 'EmptyDistributionGroup', { risk: true }),
];

export const EXCHANGE_PERMISSION_KPIS: ExchangeKpi[] = [
  exchangeKpi('full-access-permissions', 'Mailbox Permissions (Full Access)', 286, 'permissions', 'permission', 'FullAccess'),
  exchangeKpi('send-on-behalf-permissions', 'Mailbox Permissions (Send on Behalf)', 74, 'permissions', 'permission', 'SendOnBehalf'),
  exchangeKpi('send-as-permissions', 'Mailbox Permissions (Send As)', 46, 'permissions', 'permission', 'SendAs'),
];

export const EXCHANGE_KPIS: ExchangeKpi[] = [
  ...EXCHANGE_INFRASTRUCTURE_KPIS,
  ...EXCHANGE_MAILBOX_KPIS,
  ...EXCHANGE_GROUP_KPIS,
  ...EXCHANGE_PERMISSION_KPIS,
];

export const EXCHANGE_CATEGORIES = [
  { id: 'infrastructure' as const, title: 'Infrastructure', kpis: EXCHANGE_INFRASTRUCTURE_KPIS },
  { id: 'mailboxes' as const, title: 'Mailboxes', kpis: EXCHANGE_MAILBOX_KPIS },
  { id: 'groups' as const, title: 'Distribution Groups', kpis: EXCHANGE_GROUP_KPIS },
  { id: 'permissions' as const, title: 'Permissions', kpis: EXCHANGE_PERMISSION_KPIS },
];

export const EXCHANGE_RISK_KPIS = [...EXCHANGE_MAILBOX_KPIS, ...EXCHANGE_GROUP_KPIS].filter((kpi) => kpi.risk);

export const EXCHANGE_MAILBOX_TYPE_CHART = [
  { label: 'User Mailboxes', value: EXCHANGE_MAILBOX_KPIS[0].value },
  { label: 'Shared Mailboxes', value: EXCHANGE_MAILBOX_KPIS[1].value },
  { label: 'Room Mailboxes', value: EXCHANGE_MAILBOX_KPIS[2].value },
  { label: 'Equipment Mailboxes', value: EXCHANGE_MAILBOX_KPIS[3].value },
];

export const EXCHANGE_GROUP_TYPE_CHART = EXCHANGE_GROUP_KPIS.slice(0, 3).map((kpi, index) => ({
  label: kpi.label,
  value: kpi.value,
}));

export const EXCHANGE_MAILBOX_DOMAIN_CHART = [
  { label: 'corp.example.com', value: 2880 },
  { label: 'emea.example.com', value: 1200 },
  { label: 'apac.example.com', value: 720 },
];

export const EXCHANGE_PAGE_SIZE = 25;

export function buildExchangeRows(kpi: ExchangeKpi, page = 1): KpiRow[] {
  const start = (page - 1) * EXCHANGE_PAGE_SIZE;
  const count = Math.max(0, Math.min(EXCHANGE_PAGE_SIZE, kpi.value - start));
  const domains = DOMAIN_COLUMN.values ?? [];
  return Array.from({ length: count }, (_, offset) => {
    const index = start + offset;
    const suffix = String(index + 1).padStart(3, '0');
    const name = `${kpi.namePrefix}-${suffix}`;
    const container = kpi.objectType === 'group' ? 'Distribution Groups' : kpi.objectType === 'mailbox' ? 'Mailboxes' : 'Exchange';
    const row: KpiRow = {
      id: `${kpi.id}-${index}`,
      name,
      domain: domains[index % domains.length],
      distinguishedName: `CN=${name},OU=${container},DC=corp,DC=example,DC=com`,
    };
    for (const column of kpi.columns) {
      if (row[column.key] !== undefined) continue;
      row[column.key] = column.values?.[index % column.values.length]
        ?? (column.type === 'count' ? (index % 12) + 1 : `${column.key}-${suffix}`);
    }
    return row;
  });
}