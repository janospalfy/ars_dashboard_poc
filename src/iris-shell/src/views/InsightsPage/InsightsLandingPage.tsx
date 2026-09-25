import { AppShell } from '../AppShell/AppShell.js';
import { ContentHeader } from '../../components/ContentHeader/ContentHeader.js';
import { Icon } from '../../components/Icon/Icon.js';
import { IconButton } from '../../components/IconButton/IconButton.js';
import { navigate } from '../../lib/router.js';
import styles from './InsightsLandingPage.module.css';

interface HubCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  statLabel?: string;
  statValue?: string;
  trendValue?: string;
  categories?: { value: string; label: string; icon: string }[];
}
const HUB_CARDS: HubCard[] = [
  {
    title: 'Dashboard',
    description: 'KPI dashboards across Active Roles, Active Directory, Entra ID, Microsoft Exchange, and Licensing.',
    icon: 'Gauge',
    route: '#/insights/dashboard',
    categories: [
      { value: 'active-roles', label: 'Active Roles configuration KPIs', icon: 'UsersThree' },
      { value: 'active-directory', label: 'Active Directory KPIs', icon: 'TreeStructure' },
      { value: 'entra-id', label: 'Entra ID KPIs', icon: 'CloudCheck' },
      { value: 'exchange', label: 'Microsoft Exchange (on-premises) KPIs', icon: 'Mailbox' },
      { value: 'licensing', label: 'Licensing and compliance KPIs', icon: 'ShieldCheck' },
    ],
  },
  {
    title: 'Assessments',
    description: 'Run security and compliance assessments against your environment.',
    icon: 'ClipboardText',
    route: '#/assessments',
    statLabel: 'Compliance score',
    statValue: '92%',
    trendValue: '4 pts vs last week',
  },
  {
    title: 'Snapshots',
    description: 'Capture and compare point-in-time KPI snapshots to track how your environment changes over time.',
    icon: 'Camera',
    route: '#/snapshots',
    statLabel: 'Snapshots captured',
    statValue: '18',
    trendValue: '2 vs last month',
  },
];

function HubCardTile({ card, className }: { card: HubCard; className?: string }) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={className ? `${styles.hubCard} ${className}` : styles.hubCard}
      onClick={() => navigate(card.route)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(card.route);
        }
      }}
    >
      <div className={styles.hubCardHeader}>
        <span className={styles.hubIconTile}>
          <Icon name={card.icon} size="20px" />
        </span>
        <span className={styles.hubTitle}>{card.title}</span>
        {!card.categories && (
          <IconButton
            icon="CaretRight"
            ariaLabel=""
            variant="secondary"
            size="s"
            tabIndex={-1}
            className={styles.hubNavButton}
          />
        )}
      </div>
      <div className={styles.hubCardBody}>
        <p className={styles.hubDescription}>{card.description}</p>
        {card.categories && (
          <div className={styles.hubCategoryList}>
            {card.categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                className={styles.hubCategoryRow}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`#/insights/dashboard/${cat.value}`);
                }}
              >
                <span className={styles.hubCategoryIcon}>
                  <Icon name={cat.icon} size="20px" />
                </span>
                <span className={styles.hubCategoryLabel}>{cat.label}</span>
                <IconButton
                  icon="CaretRight"
                  ariaLabel=""
                  variant="secondary"
                  size="s"
                  tabIndex={-1}
                  className={styles.hubCategoryChevron}
                />
              </button>
            ))}
          </div>
        )}
        {card.statLabel && (
          <div className={styles.hubStatRow}>
            <span className={styles.hubStatLabel}>{card.statLabel}</span>
            <div className={styles.hubStatValueRow}>
              <span className={styles.hubStatValue}>{card.statValue}</span>
              <span className={styles.hubStatTrend}>
                <Icon name="TrendUp" size="16px" />
                {card.trendValue}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * InsightsLandingPage — hub for the "Insights" nav item (#/insights): links
 * out to the KPI Dashboard, Assessments, and Snapshots, plus the pinned
 * shortcut tiles from the real Active Roles Web Interface home screen.
 */
export function InsightsLandingPage() {
  return (
    <AppShell
      breadcrumb={[{ label: 'Insights' }]}
      activeGlobalItem="insights"
      showSecondarySidebar={false}
    >
      <div className={styles.page}>
        <div className={styles.headerInset}>
          <ContentHeader
            variant="detail"
            icon="PresentationChart"
            title="Insights"
            subtitle="Dashboards, assessments, and snapshots for your Active Roles environment."
          />
        </div>

        <div className={styles.hubGrid}>
          <HubCardTile card={HUB_CARDS[0]} className={styles.hubCardPrimary} />
          <div className={styles.hubSecondaryStack}>
            <HubCardTile card={HUB_CARDS[1]} />
            <HubCardTile card={HUB_CARDS[2]} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
