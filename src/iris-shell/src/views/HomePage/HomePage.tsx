import type { MouseEvent } from 'react';
import { AppShell } from '../AppShell/AppShell.js';
import { Badge } from '../../components/Badge/Badge.js';
import { CardTitleIcon } from '../../components/Card/Card.js';
import { HomeLauncher } from '../../components/HomeLauncher/HomeLauncher.js';
import { Icon } from '../../components/Icon/Icon.js';
import { Link } from '../../components/Link/Link.js';
import { PAGE_ITEMS } from '../../lib/commands.js';
import { CURRENT_USER } from '../../lib/currentUser.js';
import { navigate } from '../../lib/router.js';
import { useFavorites, type FavoriteEntry } from '../../lib/useFavorites.js';
import { AR_GOVERNANCE_KPIS } from '../InsightsPage/activeRolesKpis.js';
import styles from './HomePage.module.css';

const EXAMPLE_FAVORITES: FavoriteEntry[] = [
  { id: 'example-domain-admins', name: 'Domain Admins', type: 'Security group', href: '#/groups' },
  { id: 'example-service-accounts', name: 'Service Accounts', type: 'Organizational unit', href: '#/tree' },
  { id: 'example-enterprise-admins', name: 'Enterprise Admins', type: 'Security group', href: '#/groups' },
  { id: 'example-schema-admins', name: 'Schema Admins', type: 'Security group', href: '#/groups' },
];

const EXAMPLE_APPROVALS = [
  { id: 'add-domain-admin', action: 'Add member to Domain Admins', requester: 'Sophia Martinez', age: '12 min ago' },
  { id: 'create-service-account', action: 'Create service account', requester: 'Liam Bennett', age: '42 min ago' },
  { id: 'disable-user-account', action: 'Disable user account', requester: 'Ava Thompson', age: '2 hr ago' },
];

const EXAMPLE_CUSTOM_LINKS = [
  {
    id: 'admin-guide',
    title: 'Active Roles Admin Guide',
    description: 'Administration and configuration reference',
    href: 'https://example.com/active-roles/admin-guide',
    icon: 'BookOpen',
  },
  {
    id: 'service-account-portal',
    title: 'Service Account Request Portal',
    description: 'Request a managed service account',
    href: 'https://example.com/identity/service-accounts',
    icon: 'Key',
  },
  {
    id: 'directory-change-standards',
    title: 'Directory Change Standards',
    description: 'Review change and naming guidelines',
    href: 'https://example.com/directory/change-standards',
    icon: 'ClipboardText',
  },
];

const NEEDS_ATTENTION_KPIS = AR_GOVERNANCE_KPIS
  .filter((kpi) => kpi.value > 0)
  .sort((first, second) => second.value - first.value || first.label.localeCompare(second.label))
  .slice(0, 3);

const SAMPLE_ENVIRONMENT = [
  {
    id: 'servers',
    label: 'Active Roles servers',
    detail: '6 of 7 responding',
    status: '1 unavailable',
    tone: 'warning' as const,
  },
  {
    id: 'configuration',
    label: 'Configuration database',
    detail: 'ARConfigDb01 · Primary',
    status: 'Connected',
    tone: 'success' as const,
  },
  {
    id: 'history',
    label: 'Management History database',
    detail: 'ARHistoryDb01 · Primary',
    status: 'Connected',
    tone: 'success' as const,
  },
];

/**
 * HomePage — Home surface for the Active Roles vertical (`#/home`). Mirrors
 * the Identity Manager Home layout: a greeting and search launcher followed
 * by My work and Favorites.
 */
export function HomePage() {
  const { entries: storedFavoriteEntries } = useFavorites();
  const favoriteEntries = storedFavoriteEntries.length ? storedFavoriteEntries : EXAMPLE_FAVORITES;

  const open = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    navigate(href);
  };

  return (
    <AppShell breadcrumb={[{ label: 'Home' }]} activeGlobalItem="arHome" showSecondarySidebar={false}>
      <div className={styles.page}>
        <section className={styles.hero}>
          <h1 className={styles.greeting}>
            Welcome, {CURRENT_USER.name}! Ask anything or tell us what you need.
          </h1>

          <HomeLauncher
            commandItems={PAGE_ITEMS}
            placeholder="Search or ask Active Roles AI anything"
            aiName="Active Roles AI"
          />
        </section>

        <hr className={styles.divider} />

        <section className={styles.environmentStatus} aria-labelledby="environment-status-title">
          <div className={styles.environmentHeader}>
            <CardTitleIcon icon="Devices" />
            <h2 className={styles.environmentTitle} id="environment-status-title">Environment status</h2>
          </div>
          <div className={styles.environmentPanel}>
            <div className={styles.environmentGrid}>
              {SAMPLE_ENVIRONMENT.map((component) => (
                <div className={styles.environmentItem} key={component.id}>
                  <span className={styles.environmentLabel}>{component.label}</span>
                  <span className={styles.environmentDetail}>{component.detail}</span>
                  <Badge tone={component.tone}>{component.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className={styles.activityGrid}>
          <div className={styles.primaryWorkArea}>
            <section className={styles.activitySection} aria-labelledby="my-work-title">
              <div className={`${styles.sectionHeader} ${styles.workHeader}`}>
                <div className={styles.headingContext}>
                  <h2 className={styles.sectionTitle} id="my-work-title">My work</h2>
                  <span className={styles.sampleLabel}>Sample data · Pending approvals</span>
                </div>
                <Link href="#/approval" onClick={(event) => open(event, '#/approval')}>
                  View approvals
                </Link>
              </div>
              <div className={styles.itemList}>
                {EXAMPLE_APPROVALS.map((item) => (
                  <a
                    key={item.id}
                    className={styles.itemLink}
                    href="#/approval"
                    onClick={(event) => open(event, '#/approval')}
                  >
                    <Icon name="ClipboardText" size="20px" className={styles.itemIcon} />
                    <span className={styles.itemText}>
                      <span className={styles.itemName}>{item.action}</span>
                      <span className={styles.itemMeta}>{item.requester} · {item.age}</span>
                    </span>
                    <Icon name="ArrowRight" size="16px" className={styles.itemArrow} />
                  </a>
                ))}
              </div>
            </section>

            <section className={styles.needsAttention} aria-labelledby="needs-attention-title">
              <div className={styles.sectionHeader}>
                <div className={styles.headingContext}>
                  <h2 className={styles.sectionTitle} id="needs-attention-title">Needs attention</h2>
                  <span className={styles.sampleLabel}>Sample Governance and Risk data</span>
                </div>
                <Link href="#/insights/dashboard/active-roles" onClick={(event) => open(event, '#/insights/dashboard/active-roles')}>
                  View all
                </Link>
              </div>
              <div className={styles.attentionList}>
                {NEEDS_ATTENTION_KPIS.map((kpi) => {
                  const href = `#/insights/dashboard/active-roles/${encodeURIComponent(kpi.id)}`;
                  return (
                    <a key={kpi.id} className={styles.itemLink} href={href} onClick={(event) => open(event, href)}>
                      <Icon name="Warning" size="20px" className={styles.attentionIcon} />
                      <span className={styles.itemText}>
                        <span className={styles.itemName}>{kpi.label}</span>
                        <span className={styles.itemMeta}>{kpi.value.toLocaleString('en-US')} objects · Governance and Risk</span>
                      </span>
                      <Badge tone="warning">Review</Badge>
                      <Icon name="ArrowRight" size="16px" className={styles.itemArrow} />
                    </a>
                  );
                })}
              </div>
            </section>

            <section className={styles.customLinks} aria-labelledby="quick-links-title">
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle} id="quick-links-title">Quick links</h2>
              </div>
              <div className={styles.customLinkGrid}>
                {EXAMPLE_CUSTOM_LINKS.map((item) => (
                  <a
                    key={item.id}
                    className={styles.customLinkCard}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Icon name={item.icon} size="20px" className={styles.itemIcon} />
                    <span className={styles.customLinkText}>
                      <span className={styles.customLinkTitle}>{item.title}</span>
                      <span className={styles.itemMeta}>{item.description}</span>
                    </span>
                    <Icon name="ArrowSquareOut" size="16px" className={styles.itemArrow} />
                  </a>
                ))}
              </div>
            </section>
          </div>

          <section className={`${styles.activitySection} ${styles.favoritesSection}`} aria-labelledby="favorites-title">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle} id="favorites-title">Favorites</h2>
              {storedFavoriteEntries.length > 0 && (
                <Link href="#/favorites" onClick={(event) => open(event, '#/favorites')}>
                  View all
                </Link>
              )}
            </div>
            {favoriteEntries.length ? (
              <div className={styles.itemList}>
                {favoriteEntries.slice(0, 5).map((item) => (
                  <a
                    key={item.id}
                    className={styles.itemLink}
                    href={item.href}
                    onClick={(event) => open(event, item.href)}
                  >
                    <Icon name="Star" size="20px" className={styles.itemIcon} />
                    <span className={styles.itemText}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemMeta}>{item.type}</span>
                    </span>
                    <Icon name="ArrowRight" size="16px" className={styles.itemArrow} />
                  </a>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>Star directory objects to keep them close at hand.</p>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
