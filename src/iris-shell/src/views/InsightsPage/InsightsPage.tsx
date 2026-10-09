import { useEffect, useState } from 'react';
import { AppShell } from '../AppShell/AppShell.js';
import { Card } from '../../components/Card/Card.js';
import { ContentHeader } from '../../components/ContentHeader/ContentHeader.js';
import { Tabs, type TabItem } from '../../components/Tabs/Tabs.js';
import { MultiSelect } from '../../components/MultiSelect/MultiSelect.js';
import { Select } from '../../components/Select/Select.js';
import { IconButton } from '../../components/IconButton/IconButton.js';
import { Tooltip } from '../../components/Tooltip/Tooltip.js';
import { Menu, type MenuEntry } from '../../components/Menu/Menu.js';
import { StatCard } from '../../components/StatCard/StatCard.js';
import { DonutChart } from '../../components/DonutChart/DonutChart.js';
import { GroupedBarChart } from '../../components/GroupedBarChart/GroupedBarChart.js';
import { navigate } from '../../lib/router.js';
import { showToast } from '../../lib/toastStore.js';
import { ActiveRolesDetail } from './ActiveRolesDetail.js';
import { ActiveDirectoryDetail } from './ActiveDirectoryDetail.js';
import { LicensingDetail } from './LicensingDetail.js';
import { DOMAIN_OPTIONS, TENANT_OPTIONS, getOverviewData } from './mockInsights.js';
import styles from './InsightsPage.module.css';

const OVERVIEW_TAB = 'overview';

const TABS: TabItem[] = [
  { value: OVERVIEW_TAB, label: 'Overview', icon: 'SquaresFour' },
  { value: 'active-roles', label: 'Active Roles', icon: 'UsersThree' },
  { value: 'active-directory', label: 'Active Directory', icon: 'TreeStructure' },
  { value: 'entra-id', label: 'Entra ID', icon: 'CloudCheck' },
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
  licensing: {
    title: 'Licensing',
    description: 'Licensing and compliance KPIs',
    icon: 'ShieldCheck',
  },
};

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
  const [selectedDomains, setSelectedDomains] = useState(() => new Set(DOMAIN_OPTIONS.map((option) => option.value)));
  const [selectedTenants, setSelectedTenants] = useState(() => new Set(TENANT_OPTIONS.map((option) => option.value)));
  const overview = getOverviewData(selectedDomains, selectedTenants);
  useEffect(() => {
    setTabState(initialTab && CATEGORY_DETAILS[initialTab] ? initialTab : OVERVIEW_TAB);
  }, [initialTab]);
  const category = CATEGORY_DETAILS[tab];
  const setTab = (value: string) => {
    setTabState(value);
    navigate(value === OVERVIEW_TAB ? '#/insights' : `#/insights/dashboard/${value}`);
  };

  return (
    <AppShell
      breadcrumb={
        category
          ? [{ label: 'Insights', onClick: () => navigate('#/insights') }, { label: category.title }]
          : [{ label: 'Insights' }]
      }
      activeGlobalItem="insights"
      showSecondarySidebar={false}
    >
      <ContentHeader
        variant="detail"
        icon="PresentationChart"
        iconTileSize="xl"
        iconGlyphSize="24px"
        title="Insights"
        subtitle="Monitor identity health, configuration, exposure, and key KPIs across your environment."
        tabs={<Tabs items={TABS} value={tab} onChange={setTab} ariaLabel="Insights sections" />}
      />
      <div className={styles.page}>
        {tab === OVERVIEW_TAB && (
          <>
            <div className={styles.filters}>
              <div className={styles.filtersLeft}>
                <MultiSelect
                  label={selectedDomains.size ? 'Domains' : 'Domains: None'}
                  ariaLabel="Filter domains"
                  searchPlaceholder="Search domains"
                  options={DOMAIN_OPTIONS}
                  selected={selectedDomains}
                  onSelectionChange={setSelectedDomains}
                />
                <MultiSelect
                  label={selectedTenants.size ? 'Tenants' : 'Tenants: None'}
                  ariaLabel="Filter tenants"
                  searchPlaceholder="Search tenants"
                  options={TENANT_OPTIONS}
                  selected={selectedTenants}
                  onSelectionChange={setSelectedTenants}
                />
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
                {overview.statCards.map((s) => (
                  <StatCard
                    key={s.id}
                    className={styles.overviewStatCard}
                    label={s.label}
                    value={s.value}
                    icon={s.icon}
                    trend={s.trend}
                    animateValue
                    variant="dashboard"
                    showOptions={false}
                    actions={
                      <IconButton
                        icon="CaretRight"
                        ariaLabel={`View ${s.label}`}
                        variant="secondary"
                        size="s"
                      />
                    }
                  />
                ))}
              </div>

              <div className={styles.chartGrid}>
                <Card title="Managed Object Distribution" className={styles.overviewCard}>
                  <DonutChart segments={overview.objectDistribution} totalFormat="abbreviated" segmentGap={2} cornerRadius={2} />
                </Card>
                <Card title="User Account Status" className={styles.overviewCard}>
                  <DonutChart segments={overview.accountStatus} totalFormat="abbreviated" segmentGap={2} cornerRadius={2} />
                </Card>
                <Card title="Managed Objects by Source" className={styles.overviewCard}>
                  <GroupedBarChart data={overview.managedObjects} />
                </Card>
              </div>
            </div>
          </>
        )}

        {category && (
          <>
            <div className={
              tab === 'active-roles' || tab === 'active-directory'
                ? styles.filters
                : tab === 'licensing'
                  ? `${styles.titleRow} ${styles.licensingTitleRow}`
                  : styles.titleRow
            }>
              {tab === 'active-roles' || tab === 'active-directory' ? (
                <div className={styles.filtersLeft}>
                  <Select label="Domains: All Domains" />
                </div>
              ) : tab !== 'licensing' ? (
                <h2 className={styles.pageTitle}>{category.title}</h2>
              ) : null}
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
            ) : tab === 'active-directory' ? (
              <ActiveDirectoryDetail />
            ) : tab === 'licensing' ? (
              <LicensingDetail />
            ) : (
              <Card>
                <p className={styles.empty}>{category.description} — coming soon.</p>
              </Card>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

