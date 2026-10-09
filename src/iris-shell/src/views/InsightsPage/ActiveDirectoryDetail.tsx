import { useEffect, useRef, useState } from 'react';
import { BarChart } from '../../components/BarChart/BarChart.js';
import { Card } from '../../components/Card/Card.js';
import { CardTitleIcon } from '../../components/Card/Card.js';
import { DonutChart } from '../../components/DonutChart/DonutChart.js';
import { StatCard, type StatCardTrend } from '../../components/StatCard/StatCard.js';
import { CollapsibleSection } from '../../components/CollapsibleSection/CollapsibleSection.js';
import { DataTable, type DataTableColumn } from '../../components/DataTable/DataTable.js';
import { Pagination } from '../../components/Pagination/Pagination.js';
import { IconButton } from '../../components/IconButton/IconButton.js';
import { TextInput } from '../../components/TextInput/TextInput.js';
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

interface DirectoryChartConfig {
  categoryId: string;
  title: string;
  population?: string;
  kpiIds: string[];
  scaleToTotal: boolean;
  chartType?: 'bar' | 'donut';
  segmentColors?: Record<string, string>;
}

const DIRECTORY_CHART_CONFIGS: DirectoryChartConfig[] = [
  {
    categoryId: 'privileged-groups',
    title: 'Members by privileged group',
    kpiIds: ['accountoperators', 'administrators', 'backupoperators', 'domainadmins', 'serveroperators', 'enterpriseadmins', 'schemaadmins'],
    scaleToTotal: false,
  },
  {
    categoryId: 'computers',
    title: 'Server OS versions',
    population: 'servers',
    kpiIds: ['winserver2008r2', 'winserver2012r2', 'winserver2016', 'winserver2019', 'winserver2022', 'winserver2025', 'serverother'],
    scaleToTotal: true,
  },
  {
    categoryId: 'computers',
    title: 'Client OS versions',
    population: 'clients',
    kpiIds: ['win7', 'win81', 'win1022h2', 'win1122h2', 'win1123h2', 'clientsother'],
    scaleToTotal: true,
  },
  {
    categoryId: 'users',
    title: 'User account status',
    population: 'users',
    kpiIds: ['enabledusers', 'disabledusers'],
    scaleToTotal: true,
    chartType: 'donut',
    segmentColors: {
      enabledusers: 'var(--oi-color-teal-400)',
      disabledusers: 'var(--oi-color-grey-400)',
    },
  },
  {
    categoryId: 'groups',
    title: 'Group type',
    population: 'groups',
    kpiIds: ['securitygroups', 'distributiongroups'],
    scaleToTotal: true,
  },
  {
    categoryId: 'groups',
    title: 'Group scope',
    population: 'groups',
    kpiIds: ['globalgroups', 'domainlocalgroups', 'universalgroups'],
    scaleToTotal: true,
  },
];

const DIRECTORY_CHARTS = DIRECTORY_CHART_CONFIGS.map(({ segmentColors, ...chart }) => {
  const data = chart.kpiIds.flatMap((id) => {
    const kpi = AD_KPIS.find((item) => item.id === id);
    return kpi ? [{ label: kpi.label, value: kpi.value, color: segmentColors?.[id] }] : [];
  });
  return { ...chart, data, total: data.reduce((sum, item) => sum + item.value, 0) };
});

export function ActiveDirectoryDetail({ webInterfaceUrl }: { webInterfaceUrl?: string } = {}) {
  const [selected, setSelected] = useState<DirectoryKpi | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set());
  const [directorySearch, setDirectorySearch] = useState('');
  const [page, setPage] = useState(1);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const normalizedSearch = directorySearch.trim().toLowerCase();
  const filteredCategories = AD_CATEGORIES.map((category) => ({
    ...category,
    kpis: AD_KPIS
      .filter((kpi) => kpi.categoryId === category.id && kpi.label.toLowerCase().includes(normalizedSearch))
      .sort((first, second) => first.label.localeCompare(second.label)),
  })).filter((category) => category.kpis.length > 0);

  const toggle = (kpi: DirectoryKpi) => {
    const categoryOpen = expandedCategories.has(kpi.categoryId);
    setDirectorySearch('');
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

      <section className={styles.distributionSection} aria-labelledby="directory-distributions-title">
        <h3 className={styles.distributionTitle} id="directory-distributions-title">Distributions</h3>
        <div className={styles.categoryCharts}>
          {DIRECTORY_CHARTS.map((chart) => (
            <Card
              className={styles.categoryChart}
              key={chart.title}
              title={chart.title}
              helper={chart.population && chart.chartType !== 'donut' ? `${chart.total.toLocaleString('en-US')} ${chart.population}` : undefined}
            >
              {chart.chartType === 'donut' ? (
                <DonutChart segments={chart.data} totalFormat="abbreviated" segmentGap={2} cornerRadius={2} />
              ) : (
                <BarChart
                  data={chart.data}
                  orientation="horizontal"
                  horizontalMaxValue={chart.scaleToTotal ? chart.total : undefined}
                  selectedLabel={chart.kpiIds.includes(selected?.id ?? '') ? selected?.label : undefined}
                  onSelect={(datum) => {
                    const kpi = AD_KPIS.find((item) => chart.kpiIds.includes(item.id) && item.label === datum.label);
                    if (kpi) toggle(kpi);
                  }}
                />
              )}
            </Card>
          ))}
        </div>
      </section>

      <section className={styles.configurationSection} aria-labelledby="active-directory-kpis-title">
        <header className={styles.riskHeader}>
          <div className={styles.riskTitleGroup}>
            <CardTitleIcon icon="TreeStructure" />
            <h3 className={styles.riskTitle} id="active-directory-kpis-title">Active Directory KPIs</h3>
          </div>
          <div className={styles.configurationSearch}>
            <TextInput
              className={styles.search}
              iconLead="MagnifyingGlass"
              aria-label="Search Active Directory KPIs"
              placeholder="Search Active Directory KPIs"
              value={directorySearch}
              onChange={(event) => {
                const value = event.target.value;
                setDirectorySearch(value);
                if (selected && !selected.label.toLowerCase().includes(value.trim().toLowerCase())) {
                  setSelected(null);
                }
              }}
            />
          </div>
        </header>
        <div className={styles.configurationKpiList}>
          {filteredCategories.length === 0 ? (
            <p className={styles.noConfigurationKpis} role="status">No Active Directory KPIs match your search.</p>
          ) : filteredCategories.map((category) => (
            <CollapsibleSection
              key={category.id}
              title={category.title}
              collapsible
              variant="accordion"
              className={styles.directoryCategoryAccordion}
              expanded={expandedCategories.has(category.id)}
              onExpandedChange={(expanded) => setExpandedCategories((previous) => {
                const next = new Set(previous);
                if (expanded) next.add(category.id);
                else next.delete(category.id);
                return next;
              })}
            >
              {category.kpis.map((kpi) => (
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
      </section>
    </div>
  );
}