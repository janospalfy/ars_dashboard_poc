import { AppShell } from '../AppShell/AppShell.js';
import { ContentHeader } from '../../components/ContentHeader/ContentHeader.js';
import { Icon } from '../../components/Icon/Icon.js';
import { IconButton } from '../../components/IconButton/IconButton.js';
import { Tooltip } from '../../components/Tooltip/Tooltip.js';
import { navigate } from '../../lib/router.js';
import { ACTIVE_ROLES_VERTICAL, type VerticalNavEntry } from '../../lib/verticals.js';
import styles from './InsightsLandingPage.module.css';

/** Maps a nav entry's `value` to a route hash — mirrors AppShell's
 *  GLOBAL_NAV_ROUTES for the one entry ("directory") that's actually wired. */
const QUICK_LINK_ROUTES: Record<string, string | undefined> = {
  directory: '#/users',
};

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

/** The classic Active Roles Web Interface home screen ships a set of pinned
 *  shortcut tiles (Directory Management, Customization, Settings, Approval).
 *  Sourced from the vertical's own nav config so it never drifts out of sync
 *  with the left rail. */
function findNavEntry(value: string): VerticalNavEntry | undefined {
  return (
    ACTIVE_ROLES_VERTICAL.mainNav.find((i) => i.value === value) ??
    ACTIVE_ROLES_VERTICAL.otherNav.find((i) => i.value === value)
  );
}

const QUICK_LINK_VALUES = ['directory', 'customization', 'settings', 'approval'];

/** Copy lifted verbatim from the classic Active Roles Web Interface home
 *  screen (Home.aspx) tile descriptions. */
const QUICK_LINK_DESCRIPTIONS: Record<string, string> = {
  directory:
    'Manage directory data, such as users and groups. The scope of your authority depends upon permissions you are granted by high-level administrators.',
  customization:
    'Add, remove, or modify user interface elements, such as menu items (commands) and pages (forms), intended to manage directory data.',
  settings:
    'View or modify your personal settings that control the display of the Web Interface. You can choose the language and change the look of the pages.',
  approval:
    'Perform the tasks relating to approval of administrative operations. The scope of your responsibilities depends upon your role in the approval workflow processes.',
};

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

function QuickLinkTile({ entry }: { entry: VerticalNavEntry }) {
  const route = QUICK_LINK_ROUTES[entry.value];
  const disabled = entry.disabled || !route;
  return (
    <Tooltip label={disabled ? `${entry.label} — not available yet` : QUICK_LINK_DESCRIPTIONS[entry.value]}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        className={styles.quickLinkTile}
        onClick={disabled ? undefined : () => navigate(route!)}
        onKeyDown={
          disabled
            ? undefined
            : (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(route!);
                }
              }
        }
      >
        <span className={styles.quickLinkIconTile}>
          <Icon name={entry.icon} size="20px" />
        </span>
        <span className={styles.quickLinkLabel}>{entry.label}</span>
        <IconButton
          icon="CaretRight"
          ariaLabel=""
          variant="secondary"
          size="s"
          tabIndex={-1}
          className={styles.quickLinkNavButton}
        />
      </div>
    </Tooltip>
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

        <h2 className={styles.sectionTitle}>Quick links</h2>
        <div className={styles.quickLinkGrid}>
          {QUICK_LINK_VALUES.map((value) => {
            const entry = findNavEntry(value);
            return entry && <QuickLinkTile key={value} entry={entry} />;
          })}
        </div>
      </div>
    </AppShell>
  );
}
