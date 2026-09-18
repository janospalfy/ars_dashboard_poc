import { useEffect, useState } from 'react';
import { AppShell } from '../AppShell/AppShell.js';
import { Card } from '../../components/Card/Card.js';
import { ContentHeader } from '../../components/ContentHeader/ContentHeader.js';
import { Tabs, type TabItem } from '../../components/Tabs/Tabs.js';
import { Select } from '../../components/Select/Select.js';
import { IconButton } from '../../components/IconButton/IconButton.js';
import { Tooltip } from '../../components/Tooltip/Tooltip.js';
import { Menu, type MenuEntry } from '../../components/Menu/Menu.js';
import { StatCard } from '../../components/StatCard/StatCard.js';
import { DonutChart } from '../../components/DonutChart/DonutChart.js';
import { BarChart } from '../../components/BarChart/BarChart.js';
import { ActiveRolesDetail } from './ActiveRolesDetail.js';
import { PerformanceTestsPanel } from './PerformanceTestsPanel.js';
import { navigate } from '../../lib/router.js';
import { showToast } from '../../lib/toastStore.js';
import { STAT_CARDS, USERS_BY_SOURCE, GROUPS_BY_SOURCE, COMPUTERS_BY_SOURCE } from './mockInsights.js';
import styles from './InsightsPage.module.css';

const OVERVIEW_TAB = 'overview';

type ChartType = 'donut' | 'bar';

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
    description: 'Microsoft Exchange KPIs',
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
export function InsightsPage({ initialTab }: { initialTab?: string }) {
  const [tab, setTabState] = useState(
    initialTab && CATEGORY_DETAILS[initialTab] ? initialTab : OVERVIEW_TAB,
  );
  useEffect(() => {
    if (initialTab && CATEGORY_DETAILS[initialTab]) setTabState(initialTab);
  }, [initialTab]);
  const category = CATEGORY_DETAILS[tab];
  const [chartTypes, setChartTypes] = useState<Record<string, ChartType>>({
    users: 'donut',
    groups: 'donut',
    computers: 'donut',
  });
  const setChartType = (id: string, type: ChartType) =>
    setChartTypes((prev) => ({ ...prev, [id]: type }));

  const setTab = (value: string) => setTabState(value);

  return (
    <AppShell
      breadcrumb={[{ label: 'Insights', onClick: () => navigate('#/insights') }, { label: 'Dashboard' }]}
      activeGlobalItem="insights"
      showSecondarySidebar={false}
    >
      <ContentHeader
        variant="detail"
        icon="Gauge"
        title="Dashboard"
        onBack={() => navigate('#/insights')}
        backLabel="Back to Insights"
      />
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
            </div>
          </>
        )}

        {category && (
          <>
            <div className={styles.titleRow}>
              <h2 className={styles.pageTitle}>{category.title}</h2>
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
              <ActiveRolesDetail />
            ) : (
              <Card>
                <p className={styles.empty}>{category.description} — coming soon.</p>
              </Card>
            )}

            {tab === 'active-roles' && <PerformanceTestsPanel />}
          </>
        )}
      </div>
    </AppShell>
  );
}

