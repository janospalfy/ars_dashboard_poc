import { useEffect, useRef, useState } from 'react';
import { StatCard, type StatCardTrend } from '../../components/StatCard/StatCard.js';
import { CollapsibleSection } from '../../components/CollapsibleSection/CollapsibleSection.js';
import { DataTable, type DataTableColumn } from '../../components/DataTable/DataTable.js';
import { Pagination } from '../../components/Pagination/Pagination.js';
import { IconButton } from '../../components/IconButton/IconButton.js';
import { Tooltip } from '../../components/Tooltip/Tooltip.js';
import { objectUrl } from '../../lib/webInterface.js';
import { prefersReducedMotion } from '../../lib/motion.js';
import { AD_CATEGORIES, AD_KPIS, AD_PAGE_SIZE, AD_RISK_KPIS, AD_TOTALS, buildDirectoryRows, type DirectoryKpi } from './activeDirectoryKpis.js';
import type { KpiRow } from './activeRolesKpis.js';
import { RiskCheckGrid } from './RiskCheckGrid.js';
import styles from './ActiveRolesDetail.module.css';

const SUMMARY_TRENDS: StatCardTrend[] = [
  { direction: 'up', value: '2.4% vs last week', tone: 'success' },
  { direction: 'up', value: '1.1% vs last week', tone: 'success' },
  { direction: 'down', value: '0.8% vs last week', tone: 'danger' },
];

export function ActiveDirectoryDetail({ webInterfaceUrl }: { webInterfaceUrl?: string } = {}) {
  const [selected, setSelected] = useState<DirectoryKpi | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set());
  const [page, setPage] = useState(1);
  const detailsRef = useRef<HTMLDivElement | null>(null);

  const toggle = (kpi: DirectoryKpi) => {
    const categoryOpen = expandedCategories.has(kpi.categoryId);
    setExpandedCategories((previous) => new Set([...previous, kpi.categoryId]));
    setSelected((previous) => categoryOpen && previous?.id === kpi.id ? null : kpi);
    setPage(1);
  };

  useEffect(() => {
    if (selected) detailsRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
  }, [selected, expandedCategories]);

  const rows = selected ? buildDirectoryRows(selected, page) : [];
  const columns: DataTableColumn<KpiRow>[] = selected ? selected.columns.map((column) => ({
    key: column.key,
    header: column.header,
    minWidth: '120px',
    grow: column.key === 'name' || column.key === 'distinguishedName' ? 2 : 1,
    cell: (row) => <span>{row[column.key]}</span>,
  })) : [];

  return (
    <div className={styles.groups}>
      <div className={styles.directorySummaryGrid}>
        {AD_TOTALS.map((metric, index) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value.toLocaleString('en-US')}
            icon={metric.icon}
            trend={SUMMARY_TRENDS[index]}
            variant="dashboard"
            showOptions={false}
            className={styles.summaryCard}
          />
        ))}
      </div>

      <RiskCheckGrid checks={AD_RISK_KPIS} selectedId={selected?.id} onSelect={toggle} />

      {AD_CATEGORIES.map((category) => (
        <CollapsibleSection
          key={category.id}
          title={category.title}
          collapsible
          variant="accordion"
          className={styles.sectionAccordion}
          expanded={expandedCategories.has(category.id)}
          onExpandedChange={(expanded) => setExpandedCategories((previous) => {
            const next = new Set(previous);
            if (expanded) next.add(category.id);
            else next.delete(category.id);
            return next;
          })}
        >
          {AD_KPIS.filter((kpi) => kpi.categoryId === category.id).sort((first, second) => first.label.localeCompare(second.label)).map((kpi) => (
            <CollapsibleSection
              key={kpi.id}
              title={kpi.label}
              count={kpi.value.toLocaleString('en-US')}
              collapsible
              variant="accordion"
              className={styles.metricAccordion}
              expanded={selected?.id === kpi.id}
              onExpandedChange={(expanded) => {
                setSelected(expanded ? kpi : null);
                setPage(1);
              }}
            >
              <div ref={selected?.id === kpi.id ? detailsRef : undefined}>
                <DataTable
                  rows={rows}
                  columns={columns}
                  ariaLabel={kpi.label}
                  rowLabel={(row) => String(row.name)}
                  rowActions={kpi.webLink ? (row) => {
                    const dn = String(row.distinguishedName || '');
                    if (!dn) return null;
                    const url = objectUrl(webInterfaceUrl, dn);
                    const label = `Open ${row.name} in Web Interface`;
                    return (
                      <Tooltip label={url ? 'Open in Web Interface' : 'Web Interface URL is not configured'}>
                        <span className={styles.rowAction} tabIndex={url ? undefined : 0} aria-label={label}>
                          <IconButton
                            icon="ArrowSquareOut"
                            ariaLabel={label}
                            variant="ghost"
                            size="s"
                            disabled={!url}
                            onClick={() => { if (url) window.open(url, 'arWebInterface', 'noopener,noreferrer'); }}
                          />
                        </span>
                      </Tooltip>
                    );
                  } : undefined}
                  emptyState={{ title: 'No objects', description: 'This metric currently has no matching objects.' }}
                />
                {kpi.value > AD_PAGE_SIZE && (
                  <Pagination
                    page={page}
                    pageCount={Math.ceil(kpi.value / AD_PAGE_SIZE)}
                    onPageChange={setPage}
                    variant="simplified"
                    ariaLabel={`${kpi.label} pages`}
                  />
                )}
              </div>
            </CollapsibleSection>
          ))}
        </CollapsibleSection>
      ))}
    </div>
  );
}