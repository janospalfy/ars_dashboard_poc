/** Full mock model for the "Active Roles" KPI category page, matching
 *  localhost:5062/ActiveRoles (Pages/ActiveRoles.cshtml): every configuration
 *  KPI tile, the Governance and Risk subset, and the Database & Replication
 *  Topology table. Values and drill-down rows are static synthetic data —
 *  this prototype has no backend. */

export type KpiColumnType = 'text' | 'bool' | 'date' | 'count';

export interface KpiColumn {
  key: string;
  header: string;
  type: KpiColumnType;
  /** Fixed values to cycle through for 'text' columns (e.g. version numbers,
   *  database types) instead of the generic name/DN pattern. */
  values?: string[];
}

export interface KpiBreakdown {
  label: string;
  items: { label: string; value: number }[];
}

export interface KpiDefinition {
  id: string;
  label: string;
  value: number;
  /** Also appears in the "Governance and Risk" category. */
  risk?: boolean;
  namePrefix: string;
  columns: KpiColumn[];
  breakdown?: KpiBreakdown;
}

/** Active Roles Configuration — pinned KPIs first (Admins, Servers, Domains),
 *  then the rest A-Z, matching the real page's sort order. */
export const AR_CONFIGURATION_KPIS: KpiDefinition[] = [
  {
    id: 'ar-admins',
    label: 'Active Roles Admins',
    value: 1,
    namePrefix: 'AR-Admin',
    columns: [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'distinguishedName', header: 'Distinguished Name', type: 'text' },
      { key: 'membership', header: 'Membership', type: 'text', values: ['Direct', 'Indirect'] },
    ],
  },
  {
    id: 'ar-servers',
    label: 'AR Servers',
    value: 7,
    namePrefix: 'ARSRV',
    columns: [
      { key: 'name', header: 'Server Name', type: 'text' },
      { key: 'version', header: 'Version', type: 'text', values: ['7.6.1', '7.6.0', '7.5.3'] },
      { key: 'verboseLogging', header: 'Verbose Logging', type: 'text', values: ['On', 'Off'] },
    ],
  },
  {
    id: 'managed-domains',
    label: 'Managed Domains',
    value: 6,
    namePrefix: 'corp',
    columns: [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'dnsName', header: 'DNS Name', type: 'text' },
      { key: 'distinguishedName', header: 'Distinguished Name', type: 'text' },
      { key: 'useOverride', header: 'Use Override', type: 'bool' },
    ],
  },
  {
    id: 'access-template-links',
    label: 'Access Template Links',
    value: 24,
    namePrefix: 'ATLink',
    columns: [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'trustee', header: 'Trustee', type: 'text' },
      { key: 'directoryObject', header: 'Directory Object', type: 'text' },
      { key: 'accessTemplate', header: 'Access Template', type: 'text' },
    ],
  },
  {
    id: 'access-templates',
    label: 'Access Templates',
    value: 7,
    namePrefix: 'AT',
    columns: [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'parent', header: 'Parent', type: 'text' },
      { key: 'type', header: 'Type', type: 'text', values: ['Built-in', 'User'] },
    ],
  },
  {
    id: 'access-templates-deny',
    label: 'Access Templates With Deny Permissions',
    value: 0,
    risk: true,
    namePrefix: 'AT-Deny',
    columns: [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'distinguishedName', header: 'Distinguished Name', type: 'text' },
    ],
  },
  {
    id: 'config-databases',
    label: 'Config Databases',
    value: 24,
    namePrefix: 'ARConfigDb',
    columns: [
      { key: 'sqlAlias', header: 'SQL Alias', type: 'text' },
      { key: 'databaseName', header: 'Database Name', type: 'text' },
      { key: 'databaseType', header: 'Database Type', type: 'text', values: ['SQL Server'] },
      { key: 'replicationSupport', header: 'Replication Support', type: 'bool' },
      { key: 'replicationRole', header: 'Replication Role', type: 'text', values: ['Primary', 'Secondary'] },
    ],
  },
  {
    id: 'dynamic-groups',
    label: 'Dynamic Groups',
    value: 18,
    namePrefix: 'DynGroup',
    columns: [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'distinguishedName', header: 'Distinguished Name', type: 'text' },
      { key: 'originatingService', header: 'Originating Service', type: 'text', values: ['AD MS', 'Entra ID'] },
      { key: 'rules', header: 'Rules', type: 'count' },
      { key: 'expensive', header: 'Expensive', type: 'text', values: ['Yes', 'No'] },
    ],
    breakdown: {
      label: 'Groups per originating service',
      items: [
        { label: 'AD MS', value: 11 },
        { label: 'Entra ID', value: 7 },
      ],
    },
  },
  {
    id: 'dynamic-groups-broken-rules',
    label: 'Dynamic Groups With Broken Rules',
    value: 2,
    risk: true,
    namePrefix: 'DynGroup-Broken',
    columns: [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'distinguishedName', header: 'Distinguished Name', type: 'text' },
    ],
  },
  {
    id: 'empty-access-templates',
    label: 'Empty Access Templates',
    value: 0,
    risk: true,
    namePrefix: 'AT-Empty',
    columns: [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'distinguishedName', header: 'Distinguished Name', type: 'text' },
    ],
  },
  {
    id: 'group-families',
    label: 'Group Families',
    value: 0,
    namePrefix: 'GroupFamily',
    columns: [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'distinguishedName', header: 'Distinguished Name', type: 'text' },
    ],
  },
  {
    id: 'history-databases',
    label: 'History Databases',
    value: 15,
    namePrefix: 'ARHistoryDb',
    columns: [
      { key: 'sqlAlias', header: 'SQL Alias', type: 'text' },
      { key: 'databaseName', header: 'Database Name', type: 'text' },
      { key: 'databaseType', header: 'Database Type', type: 'text', values: ['SQL Server'] },
      { key: 'replicationRole', header: 'Replication Role', type: 'text', values: ['Primary', 'Secondary'] },
    ],
  },
  {
    id: 'managed-units',
    label: 'Managed Units',
    value: 24,
    namePrefix: 'MU',
    columns: [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'distinguishedName', header: 'Distinguished Name', type: 'text' },
      { key: 'rules', header: 'Rules', type: 'count' },
    ],
  },
  {
    id: 'managed-units-broken-rules',
    label: 'Managed Units With Broken Rules',
    value: 1,
    risk: true,
    namePrefix: 'MU-Broken',
    columns: [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'distinguishedName', header: 'Distinguished Name', type: 'text' },
    ],
  },
  {
    id: 'orphaned-access-template-links',
    label: 'Orphaned Access Template Links',
    value: 3,
    risk: true,
    namePrefix: 'ATLink-Orphan',
    columns: [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'distinguishedName', header: 'Distinguished Name', type: 'text' },
      { key: 'missingAttributes', header: 'Missing Attribute(s)', type: 'text', values: ['edsaTrustee', 'edsaObject'] },
    ],
  },
  {
    id: 'orphaned-policy-object-links',
    label: 'Orphaned Policy Object Links',
    value: 1,
    risk: true,
    namePrefix: 'POLink-Orphan',
    columns: [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'distinguishedName', header: 'Distinguished Name', type: 'text' },
      { key: 'missingAttributes', header: 'Missing Attribute(s)', type: 'text', values: ['edsaObject'] },
    ],
  },
  {
    id: 'policy-object-links',
    label: 'Policy Object Links',
    value: 24,
    namePrefix: 'POLink',
    columns: [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'distinguishedName', header: 'Distinguished Name', type: 'text' },
    ],
  },
  {
    id: 'policy-objects',
    label: 'Policy Objects',
    value: 13,
    namePrefix: 'PO',
    columns: [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'distinguishedName', header: 'Distinguished Name', type: 'text' },
      { key: 'rules', header: 'Rules', type: 'count' },
      { key: 'type', header: 'Type', type: 'text', values: ['Built-in', 'User'] },
    ],
  },
  {
    id: 'policy-objects-no-rules',
    label: 'Policy Objects With No Rules',
    value: 13,
    risk: true,
    namePrefix: 'PO-NoRules',
    columns: [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'distinguishedName', header: 'Distinguished Name', type: 'text' },
    ],
  },
  {
    id: 'scheduled-tasks',
    label: 'Scheduled Tasks',
    value: 23,
    namePrefix: 'Task',
    columns: [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'distinguishedName', header: 'Distinguished Name', type: 'text' },
      { key: 'lastRunTime', header: 'Last Run Time (UTC)', type: 'date' },
      { key: 'nextRunTime', header: 'Next Run Time (UTC)', type: 'date' },
      { key: 'enabled', header: 'Enabled', type: 'bool' },
    ],
  },
  {
    id: 'script-modules',
    label: 'Script Modules',
    value: 9,
    namePrefix: 'Script',
    columns: [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'language', header: 'Language', type: 'text', values: ['PowerShell', 'VBScript'] },
      { key: 'type', header: 'Type', type: 'text', values: ['Rule', 'Action'] },
      { key: 'origin', header: 'Origin', type: 'text', values: ['Built-in', 'User'] },
    ],
    breakdown: {
      label: 'By language',
      items: [
        { label: 'PowerShell', value: 7 },
        { label: 'VBScript', value: 2 },
      ],
    },
  },
  {
    id: 'unlinked-access-templates',
    label: 'Unlinked User-Created Access Templates',
    value: 12,
    risk: true,
    namePrefix: 'AT-Unlinked',
    columns: [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'distinguishedName', header: 'Distinguished Name', type: 'text' },
    ],
  },
  {
    id: 'unlinked-policy-objects',
    label: 'Unlinked User-Created Policy Objects',
    value: 21,
    risk: true,
    namePrefix: 'PO-Unlinked',
    columns: [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'distinguishedName', header: 'Distinguished Name', type: 'text' },
    ],
  },
  {
    id: 'virtual-attributes',
    label: 'Virtual Attributes',
    value: 15,
    namePrefix: 'VirtAttr',
    columns: [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'ldapDisplayName', header: 'LDAP Display Name', type: 'text' },
      { key: 'multivalued', header: 'Multivalued', type: 'bool' },
      { key: 'type', header: 'Type', type: 'text', values: ['Built-in', 'User'] },
    ],
  },
  {
    id: 'workflows',
    label: 'Workflows',
    value: 4,
    namePrefix: 'Workflow',
    columns: [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'distinguishedName', header: 'Distinguished Name', type: 'text' },
      { key: 'enabled', header: 'Enabled', type: 'bool' },
      { key: 'automation', header: 'Automation', type: 'bool' },
    ],
  },
];

/** Governance and Risk — the risk-flagged subset, A-Z (derived, not
 *  duplicated by hand, so it always stays in sync with the flags above). */
export const AR_GOVERNANCE_KPIS: KpiDefinition[] = AR_CONFIGURATION_KPIS.filter((k) => k.risk).sort((a, b) =>
  a.label.localeCompare(b.label),
);

export interface DatabaseTopologyRow {
  id: string;
  kind: 'Configuration' | 'Management History';
  sqlAlias: string;
  databaseName: string;
  databaseType: string;
  replicationRole: 'Primary' | 'Secondary';
}

/** Database & Replication Topology — merged Config + History Databases. */
export const DATABASE_TOPOLOGY_ROWS: DatabaseTopologyRow[] = [
  { id: 'db-1', kind: 'Configuration', sqlAlias: 'ARConfigDb01', databaseName: 'ActiveRolesConfig', databaseType: 'SQL Server', replicationRole: 'Primary' },
  { id: 'db-2', kind: 'Configuration', sqlAlias: 'ARConfigDb02', databaseName: 'ActiveRolesConfig', databaseType: 'SQL Server', replicationRole: 'Secondary' },
  { id: 'db-3', kind: 'Management History', sqlAlias: 'ARHistoryDb01', databaseName: 'ActiveRolesHistory', databaseType: 'SQL Server', replicationRole: 'Primary' },
  { id: 'db-4', kind: 'Management History', sqlAlias: 'ARHistoryDb02', databaseName: 'ActiveRolesHistory', databaseType: 'SQL Server', replicationRole: 'Secondary' },
];

export type KpiRow = { id: string } & Record<string, string | number>;

function generateCell(column: KpiColumn, index: number): string | number {
  switch (column.type) {
    case 'bool':
      return index % 2 === 0 ? 'Yes' : 'No';
    case 'count':
      return (index + 1) * 2;
    case 'date': {
      const d = new Date(Date.UTC(2026, 8, 1 + index, 9, 0));
      return d.toISOString().slice(0, 16).replace('T', ' ');
    }
    case 'text':
    default:
      if (column.values?.length) return column.values[index % column.values.length];
      return '';
  }
}

/** Synthetic drill-down rows for a clicked KPI tile, shaped by its own
 *  column set. Capped at 8 rows for display. */
export function buildKpiRows(kpi: KpiDefinition): KpiRow[] {
  const count = Math.min(kpi.value, 8);
  return Array.from({ length: count }, (_, i) => {
    const row: KpiRow = { id: `${kpi.id}-${i}` };
    for (const column of kpi.columns) {
      row[column.key] =
        column.key === 'name' || column.key === 'sqlAlias'
          ? `${kpi.namePrefix}${String(i + 1).padStart(2, '0')}`
          : column.key === 'distinguishedName'
            ? `CN=${kpi.namePrefix}${String(i + 1).padStart(2, '0')},CN=Configuration,DC=demo,DC=local`
            : column.key === 'dnsName'
              ? `${kpi.namePrefix}${String(i + 1).padStart(2, '0')}.demo.local`
              : generateCell(column, i);
    }
    return row;
  });
}
