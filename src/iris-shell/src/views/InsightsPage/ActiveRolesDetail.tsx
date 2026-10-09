import { useEffect, useRef, useState } from 'react';
import { Badge } from '../../components/Badge/Badge.js';
import { CollapsibleSection } from '../../components/CollapsibleSection/CollapsibleSection.js';
import { CardTitleIcon } from '../../components/Card/Card.js';
import { StatCard, type StatCardTrend } from '../../components/StatCard/StatCard.js';
import { TextInput } from '../../components/TextInput/TextInput.js';
import { IconButton } from '../../components/IconButton/IconButton.js';
import { Tooltip } from '../../components/Tooltip/Tooltip.js';
import { prefersReducedMotion } from '../../lib/motion.js';
import { objectUrl } from '../../lib/webInterface.js';
import { DataTable, type DataTableColumn } from '../../components/DataTable/DataTable.js';
import {
  AR_CONFIGURATION_KPIS,
  AR_GOVERNANCE_KPIS,
  DATABASE_TOPOLOGY_ROWS,
  buildKpiRows,
  type KpiDefinition,
  type KpiRow,
} from './activeRolesKpis.js';
import { RiskCheckGrid } from './RiskCheckGrid.js';
import styles from './ActiveRolesDetail.module.css';

const DB_TOPOLOGY_COLUMNS: DataTableColumn<(typeof DATABASE_TOPOLOGY_ROWS)[number]>[] = [
  { key: 'kind', header: 'Database Kind', minWidth: '160px', grow: 1, cell: (r) => <span>{r.kind}</span> },
  { key: 'sqlAlias', header: 'SQL Alias', minWidth: '140px', grow: 1, cell: (r) => <span>{r.sqlAlias}</span> },
  { key: 'databaseName', header: 'Database Name', minWidth: '160px', grow: 1, cell: (r) => <span>{r.databaseName}</span> },
  { key: 'databaseType', header: 'Database Type', minWidth: '120px', grow: 1, cell: (r) => <span>{r.databaseType}</span> },
  { key: 'replicationRole', header: 'Replication Role', minWidth: '130px', grow: 1, cell: (r) => <Badge tone={r.replicationRole === 'Primary' ? 'info' : 'neutral'}>{r.replicationRole}</Badge> },
];

const WEB_INTERFACE_KPIS = new Set(['ar-admins', 'managed-domains', 'dynamic-groups', 'managed-units']);
const SUMMARY_ICONS: Record<string, string> = {
  'ar-servers': 'Devices',
  'managed-domains': 'Globe',
  'managed-units': 'FolderSimple',
  workflows: 'FlowArrow',
};
const SUMMARY_KPIS = ['ar-servers', 'managed-domains', 'managed-units', 'workflows']
  .map((id) => AR_CONFIGURATION_KPIS.find((kpi) => kpi.id === id))
  .filter((kpi): kpi is KpiDefinition => kpi !== undefined);

const SUMMARY_TRENDS: Record<string, StatCardTrend> = {
  'ar-servers': { direction: 'up', value: '2.4% vs last week', tone: 'success' },
  'managed-domains': { direction: 'up', value: '1.1% vs last week', tone: 'success' },
  'managed-units': { direction: 'down', value: '0.8% vs last week', tone: 'danger' },
  workflows: { direction: 'up', value: '3.6% vs last week', tone: 'success' },
};

/**
 * ActiveRolesDetail — full port of the real dashboard's Active Roles KPI
 * page (Pages/ActiveRoles.cshtml): grouped risk metrics, configuration table, per-KPI
 * drill-down (columns vary by KPI — see activeRolesKpis.ts), and the
 * Database & Replication Topology table.
 */
export function ActiveRolesDetail({ webInterfaceUrl }: { webInterfaceUrl?: string } = {}) {
  const [selected, setSelected] = useState<KpiDefinition | null>(null);
  const [configurationSearch, setConfigurationSearch] = useState('');
  const normalizedSearch = configurationSearch.trim().toLowerCase();
  const filteredConfigurationKpis = AR_CONFIGURATION_KPIS.filter((kpi) =>
    kpi.label.toLowerCase().includes(normalizedSearch),
  );
  const toggle = (kpi: KpiDefinition) => {
    setSelected((previous) => previous?.id === kpi.id ? null : kpi);
  };

  const drillDownRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (selected) drillDownRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
  }, [selected]);

  const rows: KpiRow[] = selected ? buildKpiRows(selected) : [];
  const columns: DataTableColumn<KpiRow>[] = selected
    ? selected.columns.map((c) => ({
        key: c.key,
        header: c.header,
        minWidth: '120px',
        grow: c.key === 'name' || c.key === 'distinguishedName' ? 2 : 1,
        cell: (r) => <span>{r[c.key]}</span>,
      }))
    : [];

  return (
    <div className={styles.groups}>
      <div className={styles.summaryGrid}>
        {SUMMARY_KPIS.map((kpi) => (
          <StatCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value.toLocaleString('en-US')}
            icon={SUMMARY_ICONS[kpi.id]}
            trend={SUMMARY_TRENDS[kpi.id]}
            variant="dashboard"
            showOptions={false}
            className={styles.summaryCard}
            actions={
              <IconButton
                icon="CaretRight"
                ariaLabel={`View ${kpi.label}`}
                variant="secondary"
                size="s"
                onClick={() => toggle(kpi)}
              />
            }
          />
        ))}
      </div>

      <RiskCheckGrid checks={AR_GOVERNANCE_KPIS} selectedId={selected?.id} onSelect={toggle} />

      <section className={styles.configurationSection} aria-labelledby="active-roles-configuration-title">
        <header className={styles.riskHeader}>
          <div className={styles.riskTitleGroup}>
            <CardTitleIcon icon="GearSix" />
            <h3 className={styles.riskTitle} id="active-roles-configuration-title">Active Roles Configuration KPIs</h3>
          </div>
          <div className={styles.configurationSearch}>
            <TextInput
              className={styles.search}
              iconLead="MagnifyingGlass"
              aria-label="Search configuration KPIs"
              placeholder="Search configuration KPIs"
              value={configurationSearch}
              onChange={(event) => {
                const value = event.target.value;
                setConfigurationSearch(value);
                if (selected && !selected.label.toLowerCase().includes(value.trim().toLowerCase())) {
                  setSelected(null);
                }
              }}
            />
          </div>
        </header>
        <div className={styles.configurationKpiList}>
          {filteredConfigurationKpis.length === 0 ? (
            <p className={styles.noConfigurationKpis} role="status">No configuration KPIs match your search.</p>
          ) : filteredConfigurationKpis.map((kpi) => (
            <CollapsibleSection
              key={kpi.id}
              title={kpi.label}
              count={kpi.value.toLocaleString('en-US')}
              collapsible
              variant="accordion"
              className={styles.metricAccordion}
              expanded={selected?.id === kpi.id}
              onExpandedChange={(expanded) => setSelected(expanded ? kpi : null)}
            >
              <div ref={selected?.id === kpi.id ? drillDownRef : undefined}>
                {kpi.breakdown && (
                  <p className={styles.breakdown}>
                    {kpi.breakdown.label}:{' '}
                    {kpi.breakdown.items.map((item) => `${item.label} (${item.value})`).join(', ')}
                  </p>
                )}
                <DataTable
                  rows={rows}
                  columns={columns}
                  ariaLabel={kpi.label}
                  rowActions={WEB_INTERFACE_KPIS.has(kpi.id) ? (row) => {
                    const dn = row.distinguishedName;
                    if (typeof dn !== 'string' || !dn.trim()) return null;
                    const url = objectUrl(webInterfaceUrl, dn);
                    const label = `Open ${row.name || dn} in Web Interface`;
                    return (
                      <Tooltip label={url ? 'Open in Web Interface' : 'Web Interface URL is not configured'}>
                        <span className={styles.rowAction} tabIndex={url ? undefined : 0} aria-label={label}>
                          <IconButton
                            icon="ArrowSquareOut"
                            ariaLabel={label}
                            variant="ghost"
                            size="s"
                            disabled={!url}
                            onClick={() => {
                              if (url) window.open(url, 'arWebInterface', 'noopener,noreferrer');
                            }}
                          />
                        </span>
                      </Tooltip>
                    );
                  } : undefined}
                  emptyState={{
                    title: 'No objects',
                    description: 'This KPI currently has no matching objects.',
                  }}
                />
              </div>
            </CollapsibleSection>
          ))}
        </div>
      </section>

      <CollapsibleSection
        title="Database & Replication Topology"
      >
        <div className={styles.topologyTable}>
          <DataTable rows={DATABASE_TOPOLOGY_ROWS} columns={DB_TOPOLOGY_COLUMNS} ariaLabel="Database topology" />
        </div>
      </CollapsibleSection>

    </div>
  );
}

