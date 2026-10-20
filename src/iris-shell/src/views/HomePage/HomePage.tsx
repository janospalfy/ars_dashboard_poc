import { type MouseEvent } from 'react';
import { AppShell } from '../AppShell/AppShell.js';
import { HomeLauncher } from '../../components/HomeLauncher/HomeLauncher.js';
import { Icon } from '../../components/Icon/Icon.js';
import { Link } from '../../components/Link/Link.js';
import { PAGE_ITEMS } from '../../lib/commands.js';
import { CURRENT_USER } from '../../lib/currentUser.js';
import { navigate } from '../../lib/router.js';
import { type RecentItem } from '../../lib/searchHistoryStore.js';
import { useFavorites, type FavoriteEntry } from '../../lib/useFavorites.js';
import styles from './HomePage.module.css';

const EXAMPLE_FAVORITES: FavoriteEntry[] = [
  { id: 'example-domain-admins', name: 'Domain Admins', type: 'Security group', href: '#/groups' },
  { id: 'example-service-accounts', name: 'Service Accounts', type: 'Organizational unit', href: '#/tree' },
  { id: 'example-enterprise-admins', name: 'Enterprise Admins', type: 'Security group', href: '#/groups' },
  { id: 'example-schema-admins', name: 'Schema Admins', type: 'Security group', href: '#/groups' },
];

const EXAMPLE_VIEW_FAVORITES: FavoriteEntry[] = [
  { id: 'example-isabella-search', name: 'Isabella Clark search', type: 'View', href: '#/users' },
  { id: 'example-users-in-my-ou', name: 'Users in My OU', type: 'View', href: '#/tree/o1d-test-ou' },
];

const FILTERED_VIEW_FAVORITE_ID = 'example-isabella-search';

function isViewFavorite(entry: FavoriteEntry): boolean {
  return entry.type.toLowerCase().includes('view');
}

function favoriteIcon(entry: FavoriteEntry): string {
  const type = entry.type.toLowerCase();
  if (type.includes('view')) return 'Star';
  if (type.includes('organizational unit') || type.includes('folder')) return 'FolderStar';
  if (type.includes('computer') || type.includes('device')) return 'Devices';
  if (type.includes('user')) return 'User';
  if (type.includes('group')) return 'UsersThree';
  return 'Star';
}

function formatLastViewed(timestamp?: number): string | null {
  if (timestamp === undefined) return null;
  const elapsedSeconds = Math.max(0, (Date.now() - timestamp) / 1000);
  const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (elapsedSeconds < 60) return 'Viewed just now';
  if (elapsedSeconds < 3600) return `Viewed ${relativeTime.format(-Math.floor(elapsedSeconds / 60), 'minute')}`;
  if (elapsedSeconds < 86400) return `Viewed ${relativeTime.format(-Math.floor(elapsedSeconds / 3600), 'hour')}`;
  return `Viewed ${relativeTime.format(-Math.floor(elapsedSeconds / 86400), 'day')}`;
}

type HomeRecentItem = Omit<RecentItem, 'kind'> & {
  kind: RecentItem['kind'] | 'group' | 'ou';
  lastViewedAt?: number;
};

function recentIconTone(kind: HomeRecentItem['kind']): 'info' | 'warning' | 'success' | 'brand' {
  if (kind === 'user') return 'info';
  if (kind === 'group') return 'warning';
  if (kind === 'ou') return 'success';
  return 'brand';
}

const EXAMPLE_RECENT_ITEMS: HomeRecentItem[] = [
  {
    id: 'recent-user-isabella-clark',
    kind: 'user',
    label: 'Isabella Clark',
    icon: 'User',
    secondary: 'User · O1D.local',
    hash: '#/users/isabella-clark',
    lastViewedAt: Date.now() - 12 * 60 * 1000,
  },
  {
    id: 'recent-group-domain-admins',
    kind: 'group',
    label: 'Domain Admins',
    icon: 'UsersThree',
    secondary: 'Security group · O1D.local',
    hash: '#/groups',
    lastViewedAt: Date.now() - 42 * 60 * 1000,
  },
  {
    id: 'recent-ou-test-ou',
    kind: 'ou',
    label: 'Test OU',
    icon: 'Folder',
    secondary: 'Organizational unit · O1D.local',
    hash: '#/tree/o1d-test-ou',
    lastViewedAt: Date.now() - 3 * 60 * 60 * 1000,
  },
  {
    id: 'recent-user-liam-bennett',
    kind: 'user',
    label: 'Liam Bennett',
    icon: 'User',
    secondary: 'User · O1D.local',
    hash: '#/users/liam-bennett',
    lastViewedAt: Date.now() - 24 * 60 * 60 * 1000,
  },
  {
    id: 'recent-page-users',
    kind: 'page',
    label: 'Users',
    icon: 'UsersThree',
    secondary: 'Users · O1D.local',
    hash: '#/users',
    lastViewedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'recent-page-o1d-local',
    kind: 'page',
    label: 'O1D.local',
    icon: 'SquaresFour',
    secondary: 'Directory · Active Directory',
    hash: '#/tree/o1d-local',
    lastViewedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
  },
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

/**
 * HomePage — Home surface for the Active Roles vertical (`#/home`). Mirrors
 * the Identity Manager Home layout: a greeting and search launcher followed
 * by approvals, recent items, quick links, and favorites.
 */
export function HomePage() {
  const recentItems: HomeRecentItem[] = EXAMPLE_RECENT_ITEMS;
  const { entries: storedFavoriteEntries } = useFavorites();
  const storedViews = storedFavoriteEntries.filter(isViewFavorite);
  const storedObjects = storedFavoriteEntries.filter((entry) => !isViewFavorite(entry));
  const viewFavorites = storedViews.length
    ? storedViews
    : storedFavoriteEntries.length
      ? []
      : EXAMPLE_VIEW_FAVORITES;
  const objectFavorites = storedObjects.length
    ? storedObjects
    : storedFavoriteEntries.length
      ? []
      : EXAMPLE_FAVORITES;

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

        <section className={`${styles.activitySection} ${styles.recentSection}`} aria-labelledby="pick-up-title">
          <div className={styles.sectionHeader}>
            <div className={styles.headingContext}>
              <h2 className={styles.sectionTitle} id="pick-up-title">Recently opened</h2>
            </div>
          </div>
          <div className={styles.recentTileGrid}>
            {recentItems.slice(0, 6).map((item) => (
              <a
                key={item.id}
                className={styles.infoTile}
                href={item.hash}
                onClick={(event) => open(event, item.hash)}
              >
                <span className={styles.infoTileHeading}>
                  <span className={`${styles.iconWell} ${styles[`iconWell_${recentIconTone(item.kind)}`]}`}>
                    <Icon name={item.icon} size="18px" className={styles.wellIcon} />
                  </span>
                  <span className={styles.infoTileName}>{item.label}</span>
                </span>
                <span className={styles.infoTileMeta}>
                  <span className={styles.infoTileMetaText}>{item.secondary ?? (item.kind === 'user' ? 'User' : 'Page')}</span>
                </span>
                <span className={styles.infoTileFooter}>
                  <span>{formatLastViewed(item.lastViewedAt)}</span>
                  <Icon name="ArrowRight" size="16px" className={styles.itemArrow} />
                </span>
              </a>
            ))}
          </div>
        </section>

        <div className={styles.activityGrid}>
          <div className={styles.primaryWorkArea}>
            <section className={styles.activitySection} aria-labelledby="my-work-title">
              <div className={`${styles.sectionHeader} ${styles.workHeader}`}>
                <div className={styles.headingContext}>
                  <h2 className={styles.sectionTitle} id="my-work-title">My work</h2>
                  <span className={styles.sampleLabel}>Pending approvals</span>
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
                      <span className={styles.itemMeta}>
                        {item.requester}<span className={styles.itemAge}> · {item.age}</span>
                      </span>
                    </span>
                    <Icon name="ArrowRight" size="16px" className={styles.itemArrow} />
                  </a>
                ))}
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
                    <span className={styles.iconWell}>
                      <Icon name={item.icon} size="20px" className={styles.wellIcon} />
                    </span>
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
            <div className={styles.favoriteGroups}>
              <section className={styles.favoriteGroup} aria-labelledby="favorite-views-title">
                <h3 className={styles.favoriteGroupTitle} id="favorite-views-title">Views</h3>
                {viewFavorites.length ? (
                  <div className={styles.itemList}>
                    {viewFavorites.slice(0, 5).map((item) => {
                      const filterCount = item.id === FILTERED_VIEW_FAVORITE_ID ? 1 : undefined;
                      return (
                        <a key={item.id} className={`${styles.itemLink} ${styles.favoriteItemLink}`} href={item.href} onClick={(event) => open(event, item.href)}>
                          <Icon name={favoriteIcon(item)} size="16px" className={styles.itemIcon} />
                          <span className={styles.itemText}>
                            <span className={styles.itemName}>{item.name}</span>
                          </span>
                          {filterCount && (
                            <span className={styles.favoriteFilterIndicator} aria-label={`${filterCount} active filter`}>
                              <Icon name="FunnelSimple" size="14px" />
                              <span className={styles.filterCountBadge}>{filterCount}</span>
                            </span>
                          )}
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p className={styles.emptyState}>No saved views.</p>
                )}
              </section>

              <section className={styles.favoriteGroup} aria-labelledby="favorite-objects-title">
                <h3 className={styles.favoriteGroupTitle} id="favorite-objects-title">Objects and folders</h3>
                {objectFavorites.length ? (
                  <div className={styles.itemList}>
                    {objectFavorites.slice(0, 5).map((item) => (
                      <a key={item.id} className={`${styles.itemLink} ${styles.favoriteItemLink}`} href={item.href} onClick={(event) => open(event, item.href)}>
                        <Icon name={favoriteIcon(item)} size="16px" className={styles.itemIcon} />
                        <span className={styles.itemText}>
                          <span className={styles.itemName}>{item.name}</span>
                        </span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyState}>Star directory objects to keep them close at hand.</p>
                )}
              </section>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
