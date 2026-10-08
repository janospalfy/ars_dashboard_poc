import type { MouseEvent } from 'react';
import { AppShell } from '../AppShell/AppShell.js';
import { HomeLauncher } from '../../components/HomeLauncher/HomeLauncher.js';
import { Icon } from '../../components/Icon/Icon.js';
import { Link } from '../../components/Link/Link.js';
import { PAGE_ITEMS } from '../../lib/commands.js';
import { CURRENT_USER } from '../../lib/currentUser.js';
import { navigate } from '../../lib/router.js';
import { useFavorites, type FavoriteEntry } from '../../lib/useFavorites.js';
import styles from './HomePage.module.css';

const EXAMPLE_FAVORITES: FavoriteEntry[] = [
  { id: 'example-domain-admins', name: 'Domain Admins', type: 'Security group', href: '#/groups' },
  { id: 'example-service-accounts', name: 'Service Accounts', type: 'Organizational unit', href: '#/tree' },
  { id: 'example-enterprise-admins', name: 'Enterprise Admins', type: 'Security group', href: '#/groups' },
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

        <div className={styles.activityGrid}>
          <section className={styles.activitySection} aria-labelledby="my-work-title">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle} id="my-work-title">My work</h2>
              <span className={styles.sampleLabel}>Sample data · Pending approvals</span>
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

          <section className={styles.activitySection} aria-labelledby="favorites-title">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle} id="favorites-title">Favorites</h2>
              {!storedFavoriteEntries.length && <span className={styles.sampleLabel}>Examples</span>}
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

        <section className={styles.customLinks} aria-labelledby="quick-links-title">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} id="quick-links-title">Quick links</h2>
            <span className={styles.sampleLabel}>Examples</span>
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
    </AppShell>
  );
}
