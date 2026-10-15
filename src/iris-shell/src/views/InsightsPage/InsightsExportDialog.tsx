import { useEffect, useState, type Ref } from 'react';
import { Button } from '../../components/Button/Button.js';
import { Checkbox } from '../../components/Checkbox/Checkbox.js';
import { Menu, type MenuEntry } from '../../components/Menu/Menu.js';
import { Modal } from '../../components/Modal/Modal.js';
import { Select } from '../../components/Select/Select.js';
import { showToast } from '../../lib/toastStore.js';
import { CURRENT_MANAGED_OBJECTS } from './licensingData.js';
import { AD_CATEGORIES, AD_KPIS } from './activeDirectoryKpis.js';
import { AR_CONFIGURATION_KPIS } from './activeRolesKpis.js';
import { EXCHANGE_CATEGORIES, EXCHANGE_KPIS, EXCHANGE_OVERVIEW } from './exchangeKpis.js';
import { STAT_CARDS } from './mockInsights.js';
import styles from './InsightsExportDialog.module.css';

type ExportScope = 'Dashboard' | 'SubDashboard' | 'Category' | 'Kpi';

const DASHBOARDS = [
  { value: 'overview', label: 'Overview' },
  { value: 'active-roles', label: 'Active Roles' },
  { value: 'active-directory', label: 'Active Directory' },
  { value: 'entra-id', label: 'Entra ID' },
  { value: 'exchange', label: 'Microsoft Exchange' },
  { value: 'licensing', label: 'Licensing' },
];

const CATEGORY_GROUPS = [
  { label: 'Overview', items: [{ value: 'overview', label: 'Overview' }] },
  { label: 'Active Roles', items: [
    { value: 'active-roles/governance', label: 'Governance and Risk' },
    { value: 'active-roles/configuration', label: 'Active Roles Configuration KPIs' },
    { value: 'active-roles/topology', label: 'Database & Replication Topology' },
  ] },
  { label: 'Active Directory', items: [
    { value: 'active-directory/governance', label: 'Governance and Risk' },
    ...AD_CATEGORIES.map((category) => ({ value: `active-directory/${category.id}`, label: category.title })),
  ] },
  { label: 'Microsoft Exchange', items: [
    { value: 'exchange/overview', label: 'Overview' },
    ...EXCHANGE_CATEGORIES.map((category) => ({ value: `exchange/${category.id}`, label: category.title })),
  ] },
  { label: 'Licensing', items: [{ value: 'licensing', label: 'Licensing' }] },
];

const KPI_GROUPS = [
  { label: 'Overview', items: STAT_CARDS.map((kpi) => ({ value: `overview/${kpi.id}`, label: kpi.label })) },
  { label: 'Active Roles', items: AR_CONFIGURATION_KPIS.map((kpi) => ({ value: `active-roles/${kpi.id}`, label: kpi.label })) },
  { label: 'Active Directory', items: AD_KPIS.map((kpi) => ({ value: `active-directory/${kpi.id}`, label: kpi.label })) },
  { label: 'Microsoft Exchange', items: [
    ...EXCHANGE_OVERVIEW.map((kpi) => ({ value: `exchange/${kpi.id}`, label: kpi.label })),
    ...EXCHANGE_KPIS.map((kpi) => ({ value: `exchange/${kpi.id}`, label: kpi.label })),
  ] },
  { label: 'Licensing', items: [{ value: 'licensing/managed-objects', label: `Managed Objects (${CURRENT_MANAGED_OBJECTS.toLocaleString('en-US')})` }] },
].filter((group) => group.items.length > 0);

export function InsightsExportDialog({
  open,
  onClose,
  currentTab,
}: {
  open: boolean;
  onClose: () => void;
  currentTab: string;
}) {
  const [scope, setScope] = useState<ExportScope>('SubDashboard');
  const [dashboard, setDashboard] = useState(DASHBOARDS.some((item) => item.value === currentTab) ? currentTab : DASHBOARDS[0].value);
  const [category, setCategory] = useState(CATEGORY_GROUPS[0].items[0].value);
  const [kpi, setKpi] = useState(KPI_GROUPS[0].items[0].value);
  const [format, setFormat] = useState('Pdf');
  const [includeDetails, setIncludeDetails] = useState(true);
  const showDashboardSelect = scope === 'SubDashboard';

  useEffect(() => {
    if (!open) return;
    setScope('SubDashboard');
    setDashboard(DASHBOARDS.some((item) => item.value === currentTab) ? currentTab : DASHBOARDS[0].value);
    setCategory(CATEGORY_GROUPS[0].items[0].value);
    setKpi(KPI_GROUPS[0].items[0].value);
    setFormat('Pdf');
    setIncludeDetails(true);
  }, [open, currentTab]);

  const handleExport = () => {
    showToast('Export generation is not connected in this prototype yet.');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Export"
      size="s"
      className={styles.modal}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleExport}>Export</Button>
        </>
      )}
    >
      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.label}>What to export</span>
          <ExportDropdown
            label="What to export"
            value={scope}
            groups={[{ items: [
              { value: 'Dashboard', label: 'Entire dashboard' },
              { value: 'SubDashboard', label: 'A dashboard' },
              { value: 'Category', label: 'A category' },
              { value: 'Kpi', label: 'A single KPI' },
            ] }]}
            onChange={(value) => setScope(value as ExportScope)}
          />
        </label>

        {showDashboardSelect && (
          <label className={styles.field}>
            <span className={styles.label}>Dashboard</span>
            <ExportDropdown
              label="Dashboard"
              value={dashboard}
              groups={[{ label: 'Dashboards', items: DASHBOARDS }]}
              onChange={setDashboard}
            />
          </label>
        )}

        {scope === 'Category' && (
          <label className={styles.field}>
            <span className={styles.label}>Category</span>
            <ExportDropdown label="Category" value={category} groups={CATEGORY_GROUPS} onChange={setCategory} />
          </label>
        )}

        {scope === 'Kpi' && (
          <label className={styles.field}>
            <span className={styles.label}>KPI</span>
            <ExportDropdown label="KPI" value={kpi} groups={KPI_GROUPS} onChange={setKpi} />
          </label>
        )}

        <label className={styles.field}>
          <span className={styles.label}>Format</span>
          <ExportDropdown
            label="Format"
            value={format}
            groups={[{ items: [
              { value: 'Pdf', label: 'PDF' },
              { value: 'Word', label: 'Word' },
              { value: 'Excel', label: 'Excel' },
            ] }]}
            onChange={setFormat}
          />
        </label>

        <label className={styles.checkboxField}>
          <Checkbox checked={includeDetails} onChange={setIncludeDetails} ariaLabel="Include detail tables" />
          <span>Include detail tables</span>
        </label>
      </div>
    </Modal>
  );
}

interface ExportOptionGroup {
  label?: string;
  items: { value: string; label: string }[];
}

function ExportDropdown({
  label,
  value,
  groups,
  onChange,
}: {
  label: string;
  value: string;
  groups: ExportOptionGroup[];
  onChange: (value: string) => void;
}) {
  const selectedLabel = groups.flatMap((group) => group.items).find((item) => item.value === value)?.label ?? 'Select';
  const items: MenuEntry[] = groups.flatMap((group, groupIndex) => [
    ...(group.label ? [
      ...(groupIndex > 0 ? [{ kind: 'divider' as const }] : []),
      { kind: 'section' as const, label: group.label },
    ] : []),
    ...group.items.map((item) => ({
      kind: 'item' as const,
      label: item.label,
      selected: item.value === value,
      onSelect: () => onChange(item.value),
    })),
  ]);

  return (
    <Menu
      ariaLabel={label}
      align="start"
      matchTriggerWidth
      items={items}
      trigger={({ ref, onClick, expanded }) => (
        <Select
          ref={ref as Ref<HTMLButtonElement>}
          label={selectedLabel}
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={expanded}
          onClick={onClick}
        />
      )}
    />
  );
}