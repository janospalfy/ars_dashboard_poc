import { useEffect, useRef, useState } from 'react';
import { AppShell } from '../AppShell/AppShell.js';
import { Card } from '../../components/Card/Card.js';
import { Tabs, type TabItem } from '../../components/Tabs/Tabs.js';
import { Select } from '../../components/Select/Select.js';
import { IconButton } from '../../components/IconButton/IconButton.js';
import { Tooltip } from '../../components/Tooltip/Tooltip.js';
import { Menu, type MenuEntry } from '../../components/Menu/Menu.js';
import { ResourceIcon } from '../../components/ResourceIcon/ResourceIcon.js';
import { Icon } from '../../components/Icon/Icon.js';
import { StatCard } from '../../components/StatCard/StatCard.js';
import { DonutChart } from '../../components/DonutChart/DonutChart.js';
import { BarChart } from '../../components/BarChart/BarChart.js';
import { MetricTile } from '../../components/MetricTile/MetricTile.js';
import { CollapsibleSection } from '../../components/CollapsibleSection/CollapsibleSection.js';
import { DataTable, type DataTableColumn } from '../../components/DataTable/DataTable.js';
import { Link } from '../../components/Link/Link.js';
import { showToast } from '../../lib/toastStore.js';
import {
  STAT_CARDS,
  USERS_BY_SOURCE,
  GROUPS_BY_SOURCE,
  COMPUTERS_BY_SOURCE,
  ACTIVE_ROLES_METRIC_GROUPS,
  buildDrillDownRows,
  type DrillDownRow,
} from './mockInsights.js';
import styles from './InsightsPage.module.css';

const OVERVIEW_TAB = 'overview';

type ChartType = 'donut' | 'bar';

interface SelectedMetric {
  label: string;
  value: number;
}

const DRILLDOWN_COLUMNS: DataTableColumn<DrillDownRow>[] = [
  {
    key: 'name',
    header: 'Name',
    icon: 'IdentificationCard',
    minWidth: '160px',
    grow: 1,
    cell: (r) => <span>{r.name}</span>,
  },
  {
    key: 'distinguishedName',
    header: 'Distinguished Name',
    icon: 'TreeStructure',
    minWidth: '280px',
    grow: 2,
    cell: (r) => <span>{r.distinguishedName}</span>,
  },
  {
    key: 'membership',
    header: 'Membership',
    icon: 'UsersThree',
    width: '140px',
    cell: (r) => <span>{r.membership}</span>,
  },
  {
    key: 'link',
    header: '',
    width: '48px',
    cell: () => (
      <Link href="#" onClick={(e) => e.preventDefault()}>
        Open
      </Link>
    ),
  },
];

const TABS: TabItem[] = [
  { value: OVERVIEW_TAB, label: 'Overview', icon: 'PresentationChart' },
  { value: 'active-roles', label: 'Active Roles', icon: 'UsersThree' },
  { value: 'active-directory', label: 'Active Directory', icon: 'TreeStructure' },
  { value: 'entra-id', label: 'Entra ID', icon: 'CloudCheck' },
  { value: 'exchange', label: 'Microsoft Exchange', icon: 'Mailbox' },
  { value: 'licensing', label: 'Licensing', icon: 'ShieldCheck' },
];

/** Category tabs (everything but Overview) — placeholder detail pages,
 *  matching the real dashboard's per-category KPI pages which aren't built
 *  in this prototype yet. */
const CATEGORY_DETAILS: Record<string, { title: string; description: string; icon: string }> = {
  'active-roles': {
    title: 'Active Roles',
    description: 'Active Roles configuration KPIs',
    icon: 'UsersThree',
  },
  'active-directory': {
    title: 'Active Directory',
    description: 'Active Directory KPIs',
    icon: 'TreeStructure',
  },
  'entra-id': { title: 'Entra ID', description: 'Entra ID KPIs', icon: 'CloudCheck' },
  exchange: {
    title: 'Microsoft Exchange',
    description: 'Microsoft Exchange (on-premises) KPIs',
    icon: 'Mailbox',
  },
  licensing: {
    title: 'Licensing',
    description: 'Licensing and compliance KPIs',
    icon: 'ShieldCheck',
  },
};

/** Per-chart-card overflow menu — lets each chart card switch its own
 *  visualization between the two shapes the real dashboard's chart data
 *  supports (a two/one-segment source breakdown reads equally well as
 *  either a donut or a bar chart). */
function chartMenuItems(chartType: ChartType, onChange: (type: ChartType) => void): MenuEntry[] {
  return [
    { kind: 'section', label: 'Chart type' },
    {
      kind: 'item',
      label: 'Donut chart',
      icon: 'ChartDonut',
      selected: chartType === 'donut',
      onSelect: () => onChange('donut'),
    },
    {
      kind: 'item',
      label: 'Bar chart',
      icon: 'ChartBar',
      selected: chartType === 'bar',
      onSelect: () => onChange('bar'),
    },
  ];
}

function ChartCardMenu({
  chartLabel,
  chartType,
  onChange,
}: {
  chartLabel: string;
  chartType: ChartType;
  onChange: (type: ChartType) => void;
}) {
  return (
    <Menu
      ariaLabel={`${chartLabel} chart options`}
      align="end"
      items={chartMenuItems(chartType, onChange)}
      trigger={({ ref, onClick, expanded }) => (
        <IconButton
          ref={ref as React.Ref<HTMLButtonElement>}
          icon="DotsThree"
          ariaLabel={`${chartLabel} chart options`}
          size="s"
          aria-haspopup="menu"
          aria-expanded={expanded}
          onClick={onClick}
        />
      )}
    />
  );
}

function SourceChart({ type, data }: { type: ChartType; data: { label: string; value: number }[] }) {
  return type === 'donut' ? <DonutChart segments={data} /> : <BarChart data={data} />;
}

const EXPORT_MENU_ITEMS: MenuEntry[] = [
  {
    kind: 'item',
    label: 'Export as PDF',
    icon: 'FilePdf',
    onSelect: () => showToast('Export as PDF — coming soon'),
  },
  {
    kind: 'item',
    label: 'Export as Excel',
    icon: 'FileXls',
    onSelect: () => showToast('Export as Excel — coming soon'),
  },
  {
    kind: 'item',
    label: 'Export as Word',
    icon: 'FileDoc',
    onSelect: () => showToast('Export as Word — coming soon'),
  },
];

function ExportMenu() {
  return (
    <Menu
      ariaLabel="Export options"
      align="end"
      items={EXPORT_MENU_ITEMS}
      trigger={({ ref, onClick, expanded }) => (
        <IconButton
          ref={ref as React.Ref<HTMLButtonElement>}
          icon="Export"
          ariaLabel="Export options"
          variant="secondary"
          className={styles.filtersGhostAction}
          aria-haspopup="menu"
          aria-expanded={expanded}
          onClick={onClick}
        />
      )}
    />
  );
}

/**
 * InsightsPage — read-only analytics dashboard. Hosted at #/insights.
 */
export function InsightsPage() {
  const [tab, setTabState] = useState(OVERVIEW_TAB);
  const category = CATEGORY_DETAILS[tab];
  const [chartTypes, setChartTypes] = useState<Record<string, ChartType>>({
    users: 'donut',
    groups: 'donut',
    computers: 'donut',
  });
  const setChartType = (id: string, type: ChartType) =>
    setChartTypes((prev) => ({ ...prev, [id]: type }));

  const [selectedMetric, setSelectedMetric] = useState<SelectedMetric | null>(null);
  const setTab = (value: string) => {
    setTabState(value);
    setSelectedMetric(null);
  };
  const toggleMetric = (m: SelectedMetric) =>
    setSelectedMetric((prev) => (prev?.label === m.label ? null : m));

  const drillDownRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (selectedMetric) drillDownRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedMetric]);

  return (
    <AppShell
      breadcrumb={[{ label: 'Insights' }]}
      activeGlobalItem="insights"
      showSecondarySidebar={false}
    >
      <div className={styles.page}>
        <Tabs items={TABS} value={tab} onChange={setTab} ariaLabel="Insights sections" />

        {tab === OVERVIEW_TAB && (
          <>
            <div className={styles.filters}>
              <div className={styles.filtersLeft}>
                <Select label="Domains: All Domains" />
                <Select label="Tenants: All Tenants" />
              </div>
              <div className={styles.filtersRight}>
                <Tooltip label="Refresh">
                  <IconButton
                    icon="ArrowsClockwise"
                    ariaLabel="Refresh"
                    variant="secondary"
                    className={styles.filtersGhostAction}
                    onClick={() => window.location.reload()}
                  />
                </Tooltip>
                <ExportMenu />
              </div>
            </div>

            <div className={styles.cardsGridGroup}>
              <div className={styles.statGrid}>
                {STAT_CARDS.map((s) => (
                  <StatCard
                    key={s.id}
                    label={s.label}
                    value={s.value}
                    trend={s.trend}
                    className={styles.noShadowCard}
                  />
                ))}
              </div>

              <div className={styles.chartGrid}>
                <Card
                  title="Users by Source"
                  className={styles.noShadowCard}
                  actions={
                    <ChartCardMenu
                      chartLabel="Users by Source"
                      chartType={chartTypes.users}
                      onChange={(type) => setChartType('users', type)}
                    />
                  }
                >
                  <SourceChart type={chartTypes.users} data={USERS_BY_SOURCE} />
                </Card>
                <Card
                  title="Groups by Source"
                  className={styles.noShadowCard}
                  actions={
                    <ChartCardMenu
                      chartLabel="Groups by Source"
                      chartType={chartTypes.groups}
                      onChange={(type) => setChartType('groups', type)}
                    />
                  }
                >
                  <SourceChart type={chartTypes.groups} data={GROUPS_BY_SOURCE} />
                </Card>
                <Card
                  title="Computers / Devices by Source"
                  className={styles.noShadowCard}
                  actions={
                    <ChartCardMenu
                      chartLabel="Computers / Devices by Source"
                      chartType={chartTypes.computers}
                      onChange={(type) => setChartType('computers', type)}
                    />
                  }
                >
                  <SourceChart type={chartTypes.computers} data={COMPUTERS_BY_SOURCE} />
                </Card>
              </div>

              <div className={styles.categoryGrid}>
                {Object.entries(CATEGORY_DETAILS).map(([value, c]) => {
                  return (
                    <div
                      key={value}
                      role="button"
                      tabIndex={0}
                      className={styles.categoryCard}
                      onClick={() => setTab(value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setTab(value);
                        }
                      }}
                    >
                      <IconButton
                        icon="CaretRight"
                        ariaLabel=""
                        variant="secondary"
                        size="s"
                        tabIndex={-1}
                        className={styles.categoryNavButton}
                      />
                      <span className={styles.categoryIconTile}>
                        <Icon name={c.icon} size="24px" />
                      </span>
                      <span className={styles.categoryTitle}>{c.title}</span>
                      <span className={styles.categoryDescription}>{c.description}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {category && (
          <>
            <div className={`${styles.filters} ${styles.filtersEnd}`}>
              <div className={styles.filtersRight}>
                <Tooltip label="Refresh">
                  <IconButton
                    icon="ArrowsClockwise"
                    ariaLabel="Refresh"
                    variant="secondary"
                    className={styles.filtersGhostAction}
                    onClick={() => window.location.reload()}
                  />
                </Tooltip>
                <ExportMenu />
              </div>
            </div>

            {tab === 'active-roles' ? (
              <div className={styles.metricGroups}>
                {ACTIVE_ROLES_METRIC_GROUPS.map((group) => (
                  <CollapsibleSection key={group.title} title={group.title}>
                    {group.metrics.map((m) => (
                      <MetricTile
                        key={m.label}
                        label={m.label}
                        value={m.value}
                        selected={selectedMetric?.label === m.label}
                        onClick={() => toggleMetric(m)}
                      />
                    ))}
                  </CollapsibleSection>
                ))}

                {selectedMetric && (
                  <div ref={drillDownRef}>
                    <Card title={selectedMetric.label}>
                      <DataTable
                        rows={buildDrillDownRows(selectedMetric.value)}
                        columns={DRILLDOWN_COLUMNS}
                        ariaLabel={selectedMetric.label}
                        emptyState={{
                          title: 'No objects',
                          description: 'This KPI currently has no matching objects.',
                        }}
                      />
                    </Card>
                  </div>
                )}
              </div>
            ) : (
              <Card
                title={category.title}
                actions={<ResourceIcon icon={category.icon} size="default" ariaLabel="" />}
              >
                <p className={styles.empty}>{category.description} — coming soon.</p>
              </Card>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

