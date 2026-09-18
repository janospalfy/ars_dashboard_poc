import { useEffect, useRef, useState } from 'react';
import { Card } from '../../components/Card/Card.js';
import { CollapsibleSection } from '../../components/CollapsibleSection/CollapsibleSection.js';
import { MetricTile } from '../../components/MetricTile/MetricTile.js';
import { DataTable, type DataTableColumn } from '../../components/DataTable/DataTable.js';
import {
  AR_CONFIGURATION_KPIS,
  AR_GOVERNANCE_KPIS,
  DATABASE_TOPOLOGY_ROWS,
  buildKpiRows,
  type KpiDefinition,
  type KpiRow,
} from './activeRolesKpis.js';
import styles from './ActiveRolesDetail.module.css';

const DB_TOPOLOGY_COLUMNS: DataTableColumn<(typeof DATABASE_TOPOLOGY_ROWS)[number]>[] = [
  { key: 'kind', header: 'Database Kind', minWidth: '160px', cell: (r) => <span>{r.kind}</span> },
  { key: 'sqlAlias', header: 'SQL Alias', minWidth: '140px', cell: (r) => <span>{r.sqlAlias}</span> },
  { key: 'databaseName', header: 'Database Name', minWidth: '160px', grow: 1, cell: (r) => <span>{r.databaseName}</span> },
  { key: 'databaseType', header: 'Database Type', minWidth: '120px', cell: (r) => <span>{r.databaseType}</span> },
  { key: 'replicationRole', header: 'Replication Role', minWidth: '130px', cell: (r) => <span>{r.replicationRole}</span> },
];

function KpiGrid({
  kpis,
  selectedId,
  onToggle,
}: {
  kpis: KpiDefinition[];
  selectedId: string | null;
  onToggle: (kpi: KpiDefinition) => void;
}) {
  return (
    <>
      {kpis.map((kpi) => (
        <MetricTile
          key={kpi.id}
          label={kpi.label}
          value={kpi.value}
          selected={selectedId === kpi.id}
          onClick={() => onToggle(kpi)}
        />
      ))}
    </>
  );
}

/**
 * ActiveRolesDetail — full port of the real dashboard's Active Roles KPI
 * page (Pages/ActiveRoles.cshtml): the "Active Roles Configuration" and
 * "Governance and Risk" tile categories, per-KPI drill-down (columns vary by
 * KPI — see activeRolesKpis.ts), and the Database & Replication Topology
 * table.
 */
export function ActiveRolesDetail() {
  const [selected, setSelected] = useState<KpiDefinition | null>(null);
  const toggle = (kpi: KpiDefinition) => setSelected((prev) => (prev?.id === kpi.id ? null : kpi));

  const drillDownRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (selected) drillDownRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selected]);

  const rows: KpiRow[] = selected ? buildKpiRows(selected) : [];
  const columns: DataTableColumn<KpiRow>[] = selected
    ? selected.columns.map((c) => ({
        key: c.key,
        header: c.header,
        minWidth: '120px',
        grow: c.key === 'name' || c.key === 'distinguishedName' ? 1 : undefined,
        cell: (r) => <span>{r[c.key]}</span>,
      }))
    : [];

  return (
    <div className={styles.groups}>
      <CollapsibleSection title="Active Roles Configuration">
        <KpiGrid kpis={AR_CONFIGURATION_KPIS} selectedId={selected?.id ?? null} onToggle={toggle} />
      </CollapsibleSection>

      <CollapsibleSection title="Governance and Risk">
        <KpiGrid kpis={AR_GOVERNANCE_KPIS} selectedId={selected?.id ?? null} onToggle={toggle} />
      </CollapsibleSection>

      <Card title="Database & Replication Topology">
        <DataTable rows={DATABASE_TOPOLOGY_ROWS} columns={DB_TOPOLOGY_COLUMNS} ariaLabel="Database topology" />
      </Card>

      {selected && (
        <div ref={drillDownRef}>
          <Card title={selected.label}>
            {selected.breakdown && (
              <p className={styles.breakdown}>
                {selected.breakdown.label}:{' '}
                {selected.breakdown.items.map((it) => `${it.label} (${it.value})`).join(', ')}
              </p>
            )}
            <DataTable
              rows={rows}
              columns={columns}
              ariaLabel={selected.label}
              emptyState={{
                title: 'No objects',
                description: 'This KPI currently has no matching objects.',
              }}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
