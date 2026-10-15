import { useEffect, useRef, useState } from 'react';
import { Card, CardTitleIcon } from '../../components/Card/Card.js';
import { CollapsibleSection } from '../../components/CollapsibleSection/CollapsibleSection.js';
import { DataTable, type DataTableColumn } from '../../components/DataTable/DataTable.js';
import { DonutChart } from '../../components/DonutChart/DonutChart.js';
import { IconButton } from '../../components/IconButton/IconButton.js';
import { Pagination } from '../../components/Pagination/Pagination.js';
import { StatCard } from '../../components/StatCard/StatCard.js';
import { Tooltip } from '../../components/Tooltip/Tooltip.js';
import { showToast } from '../../lib/toastStore.js';
import { motionDurationMs, prefersReducedMotion } from '../../lib/motion.js';
import type { KpiRow } from './activeRolesKpis.js';
import { RiskCheckGrid } from './RiskCheckGrid.js';
import {
  buildExchangeRows,
  EXCHANGE_CATEGORIES,
  EXCHANGE_GROUP_TYPE_CHART,
  EXCHANGE_MAILBOX_DOMAIN_CHART,
  EXCHANGE_MAILBOX_TYPE_CHART,
  EXCHANGE_OVERVIEW,
  EXCHANGE_PAGE_SIZE,
  EXCHANGE_RISK_KPIS,
  type ExchangeKpi,
} from './exchangeKpis.js';
import exchangeStyles from './ExchangeDetail.module.css';
import styles from './ActiveRolesDetail.module.css';

export function ExchangeDetail() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set());
  const [selectedKpi, setSelectedKpi] = useState<ExchangeKpi | null>(null);
  const [page, setPage] = useState(1);
  const detailsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!selectedKpi) return;
    const reduceMotion = prefersReducedMotion();
    const timer = window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        detailsRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
    }, reduceMotion ? 0 : motionDurationMs('--oi-motion-duration-default'));
    return () => window.clearTimeout(timer);
  }, [selectedKpi, expandedCategories]);

  const rows = selectedKpi ? buildExchangeRows(selectedKpi, page) : [];
  const columns: DataTableColumn<KpiRow>[] = selectedKpi
    ? selectedKpi.columns.map((column) => ({
      key: column.key,
      header: column.header,
      minWidth: '140px',
      grow: column.key === 'name' || column.key === 'distinguishedName' ? 2 : 1,
      cell: (row) => <span>{row[column.key]}</span>,
    }))
    : [];

  const selectKpi = (kpi: ExchangeKpi) => {
    setSelectedKpi((previous) => previous?.id === kpi.id ? null : kpi);
    setExpandedCategories((previous) => new Set([...previous, kpi.categoryId]));
    setPage(1);
  };

  return (
    <div className={styles.groups}>
      <div className={exchangeStyles.overview}>
        <div className={exchangeStyles.overviewStats}>
          {EXCHANGE_OVERVIEW.map((metric) => (
            <StatCard
              key={metric.id}
              label={metric.label}
              value={metric.value.toLocaleString('en-US')}
              icon={metric.icon}
              trend={metric.trend}
              variant="dashboard"
              showOptions={false}
                fillHeight
                className={`${styles.summaryCard} ${exchangeStyles.overviewStatCard}`}
            />
          ))}
        </div>
        <Card title="Mailboxes by Domain" helper="Exchange mailboxes by accepted domain" className={`${styles.configurationDonutCard} ${exchangeStyles.overviewChart}`}>
          <DonutChart segments={EXCHANGE_MAILBOX_DOMAIN_CHART} totalFormat="full" segmentGap={2} cornerRadius={2} />
        </Card>
      </div>

      <RiskCheckGrid
        checks={EXCHANGE_RISK_KPIS}
        selectedId={selectedKpi?.id}
        onSelect={selectKpi}
      />

      <section className={styles.configurationSection} aria-labelledby="exchange-kpis-title">
        <header className={styles.riskHeader}>
          <div className={styles.riskTitleGroup}>
            <CardTitleIcon icon="Mailbox" />
            <h3 className={styles.riskTitle} id="exchange-kpis-title">Microsoft Exchange KPIs</h3>
          </div>
        </header>
        <div className={styles.configurationKpiList}>
          {EXCHANGE_CATEGORIES.map((category) => (
            <CollapsibleSection
              key={category.id}
              title={category.title}
              collapsible
              variant="accordion"
              className={styles.directoryCategoryAccordion}
              expanded={expandedCategories.has(category.id)}
              onExpandedChange={(expanded) => {
                setExpandedCategories((previous) => {
                  const next = new Set(previous);
                  if (expanded) next.add(category.id);
                  else next.delete(category.id);
                  return next;
                });
                if (!expanded && selectedKpi?.categoryId === category.id) setSelectedKpi(null);
              }}
            >
              <div className={styles.accordionList}>
                {category.kpis.map((kpi) => {
                  const selected = selectedKpi?.id === kpi.id;
                  return (
                    <CollapsibleSection
                      key={kpi.id}
                      title={kpi.label}
                      count={kpi.value.toLocaleString('en-US')}
                      collapsible
                      variant="accordion"
                      className={styles.metricAccordion}
                      expanded={selected}
                      sectionRef={selected ? detailsRef : undefined}
                      onExpandedChange={(expanded) => {
                        setSelectedKpi(expanded ? kpi : null);
                        setPage(1);
                      }}
                    >
                      <DataTable
                        rows={rows}
                        columns={columns}
                        ariaLabel={`${kpi.label} Exchange objects`}
                        rowLabel={(row) => String(row.name)}
                        rowActions={(row) => {
                          const message = 'Navigation is not connected yet.';
                          const label = `Open ${row.name} in Web Interface`;
                          return (
                            <Tooltip label={message}>
                              <span className={styles.rowAction} aria-label={label}>
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
                        emptyState={{ title: 'No matching objects', description: 'This KPI currently has no matching objects.' }}
                      />
                      {kpi.value > EXCHANGE_PAGE_SIZE && (
                        <Pagination
                          page={page}
                          pageCount={Math.ceil(kpi.value / EXCHANGE_PAGE_SIZE)}
                          onPageChange={setPage}
                          variant="simplified"
                          ariaLabel={`${kpi.label} pages`}
                        />
                      )}
                    </CollapsibleSection>
                  );
                })}
              </div>
              {category.id === 'mailboxes' && (
                <div className={styles.distributionSection}>
                  <Card title="Mailboxes by Type" helper="Exchange mailboxes by type" className={styles.configurationDonutCard}>
                    <DonutChart segments={EXCHANGE_MAILBOX_TYPE_CHART} totalFormat="full" segmentGap={2} cornerRadius={2} />
                  </Card>
                </div>
              )}
              {category.id === 'groups' && (
                <div className={styles.distributionSection}>
                  <Card title="Mail-Enabled Groups by Type" helper="Exchange groups by type" className={styles.configurationDonutCard}>
                    <DonutChart segments={EXCHANGE_GROUP_TYPE_CHART} totalFormat="full" segmentGap={2} cornerRadius={2} />
                  </Card>
                </div>
              )}
            </CollapsibleSection>
          ))}
        </div>
      </section>
    </div>
  );
}