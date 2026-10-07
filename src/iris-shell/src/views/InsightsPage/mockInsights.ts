/** Mock data for the Insights dashboard, shaped to match the real Active
 *  Roles KPI Dashboard's Overview tab (localhost:5062). */

export type TrendDirection = 'up' | 'down' | 'warning';
export type TrendTone = 'success' | 'warning' | 'danger';

export interface StatCardData {
  id: string;
  icon: string;
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
    id: 'user-accounts',
    icon: 'Users',
    label: 'User Accounts',
    value: '12,480',
    trend: { direction: 'up', value: '2.4% vs last week', tone: 'success' },
  },
  {
    id: 'groups',
    icon: 'UsersThree',
    label: 'Groups',
    value: '3,450',
    trend: { direction: 'up', value: '1.1% vs last week', tone: 'success' },
  },
  {
    id: 'managed-units',
    icon: 'FolderSimpleStar',
    label: 'Managed Units',
    value: '84',
    trend: { direction: 'down', value: '0.8% vs last week', tone: 'danger' },
  },
  {
    id: 'workflows',
    icon: 'FlowArrow',
    label: 'Workflows',
    value: '37',
    trend: { direction: 'up', value: '3.6% vs last week', tone: 'success' },
  },
];

export const ACCOUNT_STATUS: DonutDatum[] = [
  { label: 'Enabled', value: 11_200, color: 'var(--oi-color-teal-400)' },
  { label: 'Disabled', value: 980, color: 'var(--oi-color-grey-400)' },
  { label: 'Locked', value: 300, color: 'var(--oi-color-red-400)' },
];

export interface ManagedObjectsBySourceDatum {
  label: string;
  activeDirectory: number;
  entraId: number;
}

export const MANAGED_OBJECTS_BY_SOURCE: ManagedObjectsBySourceDatum[] = [
  { label: 'Users', activeDirectory: 8_200, entraId: 4_280 },
  { label: 'Groups', activeDirectory: 2_100, entraId: 1_350 },
  { label: 'Contacts', activeDirectory: 1_420, entraId: 380 },
  { label: 'Computers', activeDirectory: 4_680, entraId: 520 },
];

export const DOMAIN_OPTIONS = [
  { value: 'corp', title: 'corp.example.com', icon: 'TreeStructure' },
  { value: 'emea', title: 'emea.example.com', icon: 'TreeStructure' },
];

export const TENANT_OPTIONS = [
  { value: 'primary', title: 'Contoso', subtitle: 'contoso.onmicrosoft.com', icon: 'CloudCheck' },
  { value: 'partner', title: 'Contoso Partners', subtitle: 'contosopartners.onmicrosoft.com', icon: 'CloudCheck' },
];

interface OverviewSource {
  id: string;
  kind: 'domain' | 'tenant';
  enabled: number;
  disabled: number;
  locked: number;
  groups: number;
  contacts: number;
  computers: number;
  managedUnits: number;
  workflows: number;
  resources: number;
}

const OVERVIEW_SOURCES: OverviewSource[] = [
  { id: 'corp', kind: 'domain', enabled: 4_700, disabled: 380, locked: 120, groups: 1_400, contacts: 1_000, computers: 3_200, managedUnits: 50, workflows: 20, resources: 2_500 },
  { id: 'emea', kind: 'domain', enabled: 2_700, disabled: 220, locked: 80, groups: 700, contacts: 420, computers: 1_480, managedUnits: 20, workflows: 9, resources: 1_000 },
  { id: 'primary', kind: 'tenant', enabled: 3_120, disabled: 300, locked: 80, groups: 1_100, contacts: 300, computers: 400, managedUnits: 10, workflows: 6, resources: 500 },
  { id: 'partner', kind: 'tenant', enabled: 680, disabled: 80, locked: 20, groups: 250, contacts: 80, computers: 120, managedUnits: 4, workflows: 2, resources: 100 },
];

export function getOverviewData(domains: ReadonlySet<string>, tenants: ReadonlySet<string>) {
  const selected = OVERVIEW_SOURCES.filter((source) =>
    (source.kind === 'domain' ? domains : tenants).has(source.id),
  );
  const sum = (getValue: (source: OverviewSource) => number, kind?: OverviewSource['kind']) =>
    selected.reduce((total, source) => total + (!kind || source.kind === kind ? getValue(source) : 0), 0);
  const userCount = (source: OverviewSource) => source.enabled + source.disabled + source.locked;
  const values: Record<string, number> = {
    'user-accounts': sum(userCount),
    groups: sum((source) => source.groups),
    'managed-units': sum((source) => source.managedUnits),
    workflows: sum((source) => source.workflows),
  };
  const statusValues = [
    sum((source) => source.enabled),
    sum((source) => source.disabled),
    sum((source) => source.locked),
  ];
  const objectValues = [userCount, (source: OverviewSource) => source.groups,
    (source: OverviewSource) => source.contacts, (source: OverviewSource) => source.computers];
  return {
    statCards: STAT_CARDS.map((card) => ({ ...card, value: values[card.id].toLocaleString('en-US') })),
    accountStatus: ACCOUNT_STATUS.map((segment, index) => ({ ...segment, value: statusValues[index] })),
    objectDistribution: [
      { label: 'Users', value: sum(userCount), color: 'var(--oi-color-blue-400)' },
      { label: 'Groups', value: sum((source) => source.groups), color: 'var(--oi-color-yellow-400)' },
      { label: 'Computers', value: sum((source) => source.computers), color: 'var(--oi-color-teal-400)' },
      { label: 'Resources', value: sum((source) => source.resources), color: 'var(--oi-color-orange-400)' },
    ],
    managedObjects: MANAGED_OBJECTS_BY_SOURCE.map((item, index) => ({
      ...item,
      activeDirectory: sum(objectValues[index], 'domain'),
      entraId: sum(objectValues[index], 'tenant'),
    })),
  };
}

