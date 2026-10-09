export interface ManagedObjectSnapshot {
  label: string;
  items: ManagedObjectSnapshotItem[];
}

export interface ManagedObjectSnapshotItem {
  category: string;
  displayName: string;
  count: number;
}

const HISTORY_LABELS = ['Sep 09', 'Sep 16', 'Sep 23', 'Sep 30', 'Oct 07'];
const OBJECT_SERIES = [
  { category: 'Domain', displayName: 'corp.example.com', counts: [14_800, 15_000, 15_200, 15_400, 15_600] },
  { category: 'Domain', displayName: 'emea.example.com', counts: [8_100, 8_100, 8_200, 8_300, 8_400] },
  { category: 'Partition', displayName: 'Default Partition', counts: [7_600, 7_900, 8_100, 8_500, 8_800] },
  { category: 'Azure', displayName: 'Contoso tenant', counts: [3_800, 4_000, 4_250, 4_500, 4_700] },
  { category: 'SAAS', displayName: 'SaaS objects', counts: [1_500, 1_520, 1_550, 1_560, 1_600] },
];

export const MANAGED_OBJECT_HISTORY: ManagedObjectSnapshot[] = HISTORY_LABELS.map((label, index) => ({
  label,
  items: OBJECT_SERIES.map((series) => ({
    category: series.category,
    displayName: series.displayName,
    count: series.counts[index],
  })),
}));

const latest = MANAGED_OBJECT_HISTORY[MANAGED_OBJECT_HISTORY.length - 1];
const previous = MANAGED_OBJECT_HISTORY[MANAGED_OBJECT_HISTORY.length - 2];
const totalFor = (snapshot: ManagedObjectSnapshot) => snapshot.items.reduce((total, item) => total + item.count, 0);
const categoryTotal = (snapshot: ManagedObjectSnapshot, category: string) => snapshot.items
  .filter((item) => item.category.toLowerCase() === category.toLowerCase())
  .reduce((total, item) => total + item.count, 0);

export const CURRENT_MANAGED_OBJECTS = totalFor(latest);
export const PREVIOUS_MANAGED_OBJECTS = totalFor(previous);
export const MANAGED_OBJECT_WEEKLY_CHANGE = ((CURRENT_MANAGED_OBJECTS - PREVIOUS_MANAGED_OBJECTS) / PREVIOUS_MANAGED_OBJECTS) * 100;

export interface LicensingThreshold {
  id: string;
  label: string;
  actual: number;
  entitlement: number;
}

export const LICENSING_THRESHOLDS: LicensingThreshold[] = [
  { id: 'domain', label: 'Domain', actual: categoryTotal(latest, 'Domain'), entitlement: 25_000 },
  { id: 'partition', label: 'Partition', actual: categoryTotal(latest, 'Partition'), entitlement: 8_500 },
  { id: 'azure', label: 'Azure', actual: categoryTotal(latest, 'Azure'), entitlement: 4_500 },
  { id: 'saas', label: 'SaaS', actual: categoryTotal(latest, 'SAAS'), entitlement: 1_800 },
  { id: 'total', label: 'Total', actual: CURRENT_MANAGED_OBJECTS, entitlement: 40_000 },
];

export interface ManagedObjectRecord {
  id: string;
  category: string;
  name: string;
  count: number;
}

export const MANAGED_OBJECT_RECORDS: ManagedObjectRecord[] = latest.items.map((item, index) => ({
  id: `${item.category.toLowerCase()}-${index}`,
  category: item.category === 'SAAS' ? 'SaaS' : item.category,
  name: item.displayName,
  count: item.count,
}));