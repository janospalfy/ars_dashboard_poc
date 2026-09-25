import { AppShell } from '../AppShell/AppShell.js';
import { HomeLauncher } from '../../components/HomeLauncher/HomeLauncher.js';
import { QuickLinks } from '../../components/QuickLinks/QuickLinks.js';
import { PAGE_ITEMS } from '../../lib/commands.js';
import { CURRENT_USER } from '../../lib/currentUser.js';
import styles from './HomePage.module.css';

/**
 * HomePage — Home surface for the Active Roles vertical (`#/home`). Mirrors
 * the Identity Manager Home layout: a greeting + search/ask launcher up top,
 * followed by the "Quick actions" shortcut cards.
 */
export function HomePage() {
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

        <div className={styles.quickLinksWrap}>
          <QuickLinks />
        </div>
      </div>
    </AppShell>
  );
}
