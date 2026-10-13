import { useEffect, useRef, useState } from 'react';
import { Card, CardTitleIcon } from '../../components/Card/Card.js';
import { CollapsibleSection } from '../../components/CollapsibleSection/CollapsibleSection.js';
import { DataTable, type DataTableColumn } from '../../components/DataTable/DataTable.js';
import { DonutChart, type DonutSegment } from '../../components/DonutChart/DonutChart.js';
import { Pagination } from '../../components/Pagination/Pagination.js';
import { RiskCheckGrid } from './RiskCheckGrid.js';
import { StatCard } from '../../components/StatCard/StatCard.js';
import { IconButton } from '../../components/IconButton/IconButton.js';
import { Tooltip } from '../../components/Tooltip/Tooltip.js';
import { showToast } from '../../lib/toastStore.js';
import { motionDurationMs, prefersReducedMotion } from '../../lib/motion.js';
import {
  buildEntraRows,
  ENTRA_GOVERNANCE_KPIS,
  ENTRA_GROUP_KPIS,
  ENTRA_GROUP_TYPE_CHART,
  ENTRA_PAGE_SIZE,
  ENTRA_SOURCE_CHARTS,
  ENTRA_TOTALS,
  ENTRA_USER_CHARTS,
  ENTRA_USER_KPIS,
  type EntraKpi,
  type EntraRow,
} from './entraIdKpis.js';
import detailStyles from './ActiveRolesDetail.module.css';
import styles from './EntraIdDetail.module.css';

const USER_COLUMNS: DataTableColumn<EntraRow>[] = [
  { key: 'name', header: 'Name', minWidth: '160px', grow: 1, cell: (row) => <span>{row.name}</span> },
  { key: 'tenant', header: 'Tenant', minWidth: '140px', grow: 1, cell: (row) => <span>{row.tenant}</span> },
  { key: 'distinguishedName', header: 'Distinguished Name', minWidth: '260px', grow: 2, cell: (row) => <span>{row.distinguishedName}</span> },
  { key: 'enabled', header: 'Enabled', width: '100px', cell: (row) => <span>{row.enabled}</span> },
];

const GROUP_COLUMNS: DataTableColumn<EntraRow>[] = USER_COLUMNS.slice(0, 3);

export function EntraIdDetail() {
  const [expandedSections, setExpandedSections] = useState<Set<'groups' | 'users'>>(() => new Set());
  const [selectedMetric, setSelectedMetric] = useState<{ key: string; kpi: EntraKpi } | null>(null);
  const [page, setPage] = useState(1);
  const detailsRef = useRef<HTMLElement | null>(null);

  const updateSection = (section: 'groups' | 'users', expanded: boolean) => {
    setExpandedSections((previous) => {
      const next = new Set(previous);
      if (expanded) next.add(section);
      else next.delete(section);
      return next;
    });
  };

  useEffect(() => {
    if (!selectedMetric) return;
    const reduceMotion = prefersReducedMotion();
    const timer = window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        detailsRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
    }, reduceMotion ? 0 : motionDurationMs('--oi-motion-duration-default'));
    return () => window.clearTimeout(timer);
  }, [selectedMetric, expandedSections]);

  const renderTable = (kpi: EntraKpi) => {
    const rows = buildEntraRows(kpi, page);
    return (
      <div className={styles.tableDetails}>
        <DataTable
          rows={rows}
          columns={kpi.objectType === 'user' ? USER_COLUMNS : GROUP_COLUMNS}
          ariaLabel={`${kpi.label} Entra ID objects`}
          rowLabel={(row) => row.name}
          rowActions={(row) => {
            const message = 'Navigation is not connected yet.';
            const label = `Open ${row.name} in Web Interface`;
            return (
              <Tooltip label={message}>
                <span className={detailStyles.rowAction} aria-label={label}>
                  <IconButton
                    icon="ArrowSquareOut"
                    ariaLabel={label}
                    variant="ghost"
                    size="s"
                    onClick={() => showToast(message)}
                  />
                </span>
              </Tooltip>
            );
          }}
          emptyState={{ title: 'No matching objects', description: 'This metric currently has no matching objects.' }}
        />
        {kpi.value > ENTRA_PAGE_SIZE && (
          <Pagination
            page={page}
            pageCount={Math.ceil(kpi.value / ENTRA_PAGE_SIZE)}
            onPageChange={setPage}
            variant="simplified"
            ariaLabel={`${kpi.label} pages`}
          />
        )}
      </div>
    );
  };

  const renderKpis = (section: 'groups' | 'users', kpis: EntraKpi[]) => (
    <>
      {kpis.map((kpi) => {
        const key = `${section}/${kpi.id}`;
        const isSelected = selectedMetric?.key === key;
        return (
          <CollapsibleSection
            key={key}
            title={kpi.label}
            count={kpi.value}
            collapsible
            variant="accordion"
            className={detailStyles.metricAccordion}
            expanded={isSelected}
            sectionRef={isSelected ? detailsRef : undefined}
            onExpandedChange={(expanded) => {
              setSelectedMetric(expanded ? { key, kpi } : null);
              setPage(1);
            }}
          >
            {renderTable(kpi)}
          </CollapsibleSection>
        );
      })}
    </>
  );

  const riskSelectedId = selectedMetric && ENTRA_GOVERNANCE_KPIS.some((kpi) => kpi.id === selectedMetric.kpi.id)
    ? selectedMetric.kpi.id
    : undefined;

  return (
    <div className={detailStyles.groups}>
      <div className={styles.summaryGrid}>
        {ENTRA_TOTALS.map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value.toLocaleString('en-US')}
            icon={metric.icon}
            trend={metric.trend}
            variant="dashboard"
            showOptions={false}
            className={`${detailStyles.summaryCard} ${styles.noShadow}`}
          />
        ))}
      </div>
      <div className={detailStyles.configurationDonutGrid}>
        {ENTRA_SOURCE_CHARTS.map((chart) => (
          <Card key={chart.title} title={chart.title} className={`${detailStyles.configurationDonutCard} ${styles.noShadow}`}>
            <DonutChart segments={chart.segments} totalFormat="full" segmentGap={2} cornerRadius={2} />
          </Card>
        ))}
      </div>

      <RiskCheckGrid
        checks={ENTRA_GOVERNANCE_KPIS}
        columns={4}
        selectedId={riskSelectedId}
        onSelect={(kpi) => {
          const groupKpi = ENTRA_GROUP_KPIS.find((item) => item.id === kpi.id);
          const section = groupKpi ? 'groups' : 'users';
          const targetKpi = groupKpi ?? ENTRA_USER_KPIS.find((item) => item.id === kpi.id);
          if (!targetKpi) return;
          const key = `${section}/${targetKpi.id}`;
          if (selectedMetric?.key === key) {
            setSelectedMetric(null);
            return;
          }
          setExpandedSections((previous) => new Set([...previous, section]));
          setSelectedMetric({ key, kpi: targetKpi });
          setPage(1);
        }}
      />

      <section className={detailStyles.configurationSection} aria-labelledby="entra-kpis-title">
        <header className={detailStyles.riskHeader}>
          <div className={detailStyles.riskTitleGroup}>
            <CardTitleIcon icon="CloudCheck" />
            <h3 className={detailStyles.riskTitle} id="entra-kpis-title">Entra ID KPIs</h3>
          </div>
        </header>
        <div className={detailStyles.configurationKpiList}>
          <CollapsibleSection
            title="Groups"
            collapsible
            variant="accordion"
            className={detailStyles.directoryCategoryAccordion}
            expanded={expandedSections.has('groups')}
            onExpandedChange={(expanded) => updateSection('groups', expanded)}
          >
            <div className={styles.sectionContent}>
              <div className={styles.accordionList}>{renderKpis('groups', ENTRA_GROUP_KPIS)}</div>
              <Card title="Groups by Type" helper="Entra ID groups by type" className={`${detailStyles.configurationDonutCard} ${styles.noShadow}`}>
                <DonutChart segments={ENTRA_GROUP_TYPE_CHART satisfies DonutSegment[]} totalFormat="full" segmentGap={2} cornerRadius={2} />
              </Card>
            </div>
          </CollapsibleSection>
          <CollapsibleSection
            title="User Accounts"
            collapsible
            variant="accordion"
            className={detailStyles.directoryCategoryAccordion}
            expanded={expandedSections.has('users')}
            onExpandedChange={(expanded) => updateSection('users', expanded)}
          >
            <div className={styles.sectionContent}>
              <div className={styles.accordionList}>{renderKpis('users', ENTRA_USER_KPIS)}</div>
              <div className={detailStyles.configurationDonutGrid}>
                {ENTRA_USER_CHARTS.map((chart) => (
                  <Card key={chart.title} title={chart.title} helper={chart.helper} className={`${detailStyles.configurationDonutCard} ${styles.noShadow}`}>
                    <DonutChart segments={chart.segments} totalFormat="full" segmentGap={2} cornerRadius={2} />
                  </Card>
                ))}
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </section>
    </div>
  );
}