import type { KpiColumn, KpiDefinition, KpiRow } from './activeRolesKpis.js';

export interface DirectoryKpi extends KpiDefinition {
  categoryId: string;
  objectType: 'user' | 'group' | 'computer' | 'infrastructure';
  webLink: boolean;
}

export const AD_CATEGORIES = [
  { id: 'privileged-groups', title: 'Privileged Groups' },
  { id: 'users', title: 'User Accounts' },
  { id: 'groups', title: 'Groups' },
  { id: 'privileged-users', title: 'Privileged Users' },
  { id: 'infrastructure', title: 'Infrastructure' },
  { id: 'computers', title: 'Computers' },
  { id: 'nhis', title: 'NHIs' },
];

const NAME_DN: KpiColumn[] = [
  { key: 'name', header: 'Name', type: 'text' },
  { key: 'distinguishedName', header: 'Distinguished Name', type: 'text' },
];
const DOMAIN: KpiColumn = { key: 'domain', header: 'Domain', type: 'text' };

type MetricSeed = [id: string, label: string, value: number, risk?: boolean];

const USER_SEEDS: MetricSeed[] = [
  ['cannotchangepassword', 'Cannot Change Password', 6],
  ['disabledusers', 'Disabled Users', 800],
  ['nokerberospreauth', 'Do Not Require Kerberos Preauthentication', 8],
  ['enabledusers', 'Enabled Users', 7400],
  ['expiringusers', 'Expiring Users', 40],
  ['mustchangepassword', 'Must Change Password', 45],
  ['passwordneverexpires', 'Password Never Expires', 320],
  ['passwordnotrequired', 'Password Not Required', 0],
  ['userreversibleencryption', 'Reversible Encryption', 4],
  ['sensitivecannotdelegate', 'Sensitive - Cannot Be Delegated', 64],
  ['smartcardrequired', 'Smart Card Required', 90],
  ['trustedfordelegation', 'Trusted for Delegation', 12],
  ['usedesencryption', 'Use DES Encryption', 0],
  ['deprovisionedusers', 'Deprovisioned Users', 20],
  ['nomanageruser', 'No Manager (User)', 120, true],
  ['accountlockedout', 'User Account Locked Out', 90, true],
  ['neverloggedin', 'Never Logged In', 80, true],
  ['expiredusers', 'Expired Users', 24, true],
  ['reversibleencryption', 'Reversible Encryption', 4, true],
  ['staleusers', 'Stale Accounts (Inactive)', 160, true],
];

const GROUP_SEEDS: MetricSeed[] = [
  ['distributiongroups', 'Distribution Groups', 300],
  ['domainlocalgroups', 'Domain Local Groups', 450],
  ['globalgroups', 'Global Groups', 1200],
  ['mailenabledsecuritygroups', 'Mail Enabled Security Groups', 120],
  ['securitygroups', 'Security Groups', 1800],
  ['universalgroups', 'Universal Groups', 450],
  ['nogroupowner', 'No Group Owner', 48, true],
  ['emptygroups', 'Empty Groups', 72, true],
  ['circulargroupnesting', 'Circular Group Nesting', 3, true],
];

const COMPUTER_SEEDS: MetricSeed[] = [
  ['computerclients', 'Clients', 4000],
  ['computerservers', 'Servers', 680],
  ['winserver2008r2', 'Windows Server 2008 R2', 8],
  ['winserver2012r2', 'Windows Server 2012 R2', 24],
  ['winserver2016', 'Windows Server 2016', 100],
  ['winserver2019', 'Windows Server 2019', 180],
  ['winserver2022', 'Windows Server 2022', 300],
  ['winserver2025', 'Windows Server 2025', 40],
  ['serverother', 'Server (other)', 28],
  ['win7', 'Windows 7', 12],
  ['win81', 'Windows 8.1', 8],
  ['win1022h2', 'Windows 10 22H2', 1200],
  ['win1122h2', 'Windows 11 22H2', 900],
  ['win1123h2', 'Windows 11 23H2', 1200],
  ['win11enterprise', 'Windows 11 Enterprise', 1200],
  ['win11pro', 'Windows 11 Pro', 900],
  ['clientsother', 'Clients (other)', 680],
  ['unconstrainedcomputers', 'Unconstrained Delegation', 6, true],
];

function metrics(categoryId: string, objectType: DirectoryKpi['objectType'], seeds: MetricSeed[]): DirectoryKpi[] {
  return seeds.map(([id, label, value, risk]) => {
    let columns = [...NAME_DN];
    if (categoryId === 'privileged-groups') columns.push({ key: 'membership', header: 'Membership', type: 'text', values: ['Direct', 'Indirect'] });
    if (categoryId === 'infrastructure') columns = [NAME_DN[0], { key: 'netbiosName', header: 'NetBIOS Name', type: 'text' }, NAME_DN[1]];
    if (id === 'staleusers') columns = [NAME_DN[0], { key: 'lastLogon', header: 'Last Logon', type: 'date' }, NAME_DN[1]];
    if (id === 'deprovisionedusers') columns.push({ key: 'description', header: 'Description', type: 'text' });
    if (['emptygroups', 'circulargroupnesting', 'neverloggedin', 'admincount', 'domaincontrollers'].includes(id)) columns = [NAME_DN[0], DOMAIN, NAME_DN[1]];
    if (['neverloggedin', 'admincount'].includes(id)) columns.push({ key: 'enabled', header: 'Enabled', type: 'bool' });
    if (id === 'domaincontrollers') columns.push({ key: 'site', header: 'Site', type: 'text' });
    return { id, label, value, risk, categoryId, objectType, namePrefix: objectType === 'computer' ? 'PC' : objectType === 'group' ? 'Group' : objectType === 'infrastructure' ? 'Site' : 'User', columns, webLink: !['sites', 'sitelinks', 'subnets'].includes(id) };
  });
}

export const AD_KPIS: DirectoryKpi[] = [
  ...metrics('privileged-groups', 'user', [
    ['accountoperators', 'Account Operators', 4], ['administrators', 'Administrators', 12],
    ['backupoperators', 'Backup Operators', 3], ['domainadmins', 'Domain Admins', 8],
    ['serveroperators', 'Server Operators', 5], ['enterpriseadmins', 'Enterprise Admins', 3],
    ['schemaadmins', 'Schema Admins', 2],
  ]),
  ...metrics('users', 'user', USER_SEEDS),
  ...metrics('groups', 'group', GROUP_SEEDS),
  ...metrics('privileged-users', 'user', [['admincount', 'Admin Count', 28]]),
  ...metrics('infrastructure', 'infrastructure', [
    ['sites', 'Sites', 4], ['sitelinks', 'Site Links', 6], ['subnets', 'Subnets', 12],
    ['ous', 'OUs', 84], ['domaincontrollers', 'Domain Controllers', 6],
  ]),
  ...metrics('computers', 'computer', COMPUTER_SEEDS),
  ...metrics('nhis', 'user', [
    ['nomanagersa', 'No Manager (Service Account)', 18, true],
    ['spnuseraccounts', 'Service Accounts (SPN)', 48, true],
    ['serviceaccounts', 'Service Accounts', 120],
    ['gmsaserviceaccounts', 'gMSA Service Accounts', 24],
    ['smsaserviceaccounts', 'sMSA Service Accounts', 8],
  ]),
];

export const AD_RISK_KPIS = AD_KPIS.filter((kpi) => kpi.risk);
export const AD_TOTALS = [
  { label: 'Total Users', value: 8200 },
  { label: 'Total Groups', value: 2100 },
  { label: 'Total Computers', value: 4680 },
];
export const AD_PAGE_SIZE = 25;

export function buildDirectoryRows(kpi: DirectoryKpi, page = 1): KpiRow[] {
  const start = (page - 1) * AD_PAGE_SIZE;
  const count = Math.max(0, Math.min(AD_PAGE_SIZE, kpi.value - start));
  return Array.from({ length: count }, (_, offset) => {
    const index = start + offset;
    const suffix = String(index + 1).padStart(3, '0');
    const name = `${kpi.namePrefix}-${suffix}`;
    const row: KpiRow = { id: `${kpi.id}-${index}`, name, distinguishedName: `CN=${name},OU=${kpi.objectType === 'group' ? 'Groups' : kpi.objectType === 'computer' ? 'Computers' : 'Users'},DC=corp,DC=example,DC=com` };
    for (const column of kpi.columns) {
      if (row[column.key] !== undefined) continue;
      row[column.key] = column.values?.[index % column.values.length] ?? (column.type === 'bool' ? 'Yes' : column.type === 'date' ? '2026-09-01 09:00' : column.key === 'domain' || column.key === 'netbiosName' ? 'CORP' : column.key === 'site' ? 'London' : `${column.key}-${suffix}`);
    }
    return row;
  });
}