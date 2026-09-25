import type { MouseEvent } from 'react';
import { Icon } from '../Icon/Icon.js';
import { navigate } from '../../lib/router.js';
import { ACTIVE_ROLES_VERTICAL, type VerticalNavEntry } from '../../lib/verticals.js';
import styles from './QuickLinks.module.css';

/** Maps a nav entry's `value` to a route hash. "directory" reuses AppShell's
 *  GLOBAL_NAV_ROUTES entry; the rest route to WIP placeholder pages so every
 *  quick link card is clickable. */
const QUICK_LINK_ROUTES: Record<string, string | undefined> = {
  directory: '#/users',
  customization: '#/customization',
  settings: '#/settings',
  approval: '#/approval',
};

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

const QUICK_LINK_LABELS: Record<string, string> = {
  directory: 'Open directory view',
  customization: 'Customize UI',
  settings: 'Manage settings',
  approval: 'View approvals',
};

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

function QuickLinkCard({ entry }: { entry: VerticalNavEntry }) {
  const route = QUICK_LINK_ROUTES[entry.value];
  const disabled = !route;

  const body = (
    <>
      <span className={styles.cardBody}>
        <span className={styles.cardTitleRow}>
          <Icon name={entry.icon} size="20px" className={styles.cardTitleIcon} />
          <span className={styles.cardTitle}>{entry.label}</span>
        </span>
        <span className={styles.cardDesc}>{QUICK_LINK_DESCRIPTIONS[entry.value]}</span>
      </span>
      <span className={styles.cardLink}>
        <span>{disabled ? 'Not available yet' : QUICK_LINK_LABELS[entry.value]}</span>
        {!disabled && <Icon name="ArrowRight" size="16px" className={styles.cardLinkArrow} />}
      </span>
    </>
  );

  if (disabled) {
    return (
      <div className={`${styles.card} ${styles.cardDisabled}`} aria-disabled="true">
        {body}
      </div>
    );
  }

  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(route!);
  };

  return (
    <a href={route} className={styles.card} onClick={go}>
      {body}
    </a>
  );
}

/**
 * QuickLinks — the "Quick actions" section (pinned shortcut cards to Directory
 * Management, Customization, Settings, and Approval). Shared between the
 * Insights hub and the Active Roles Home page.
 */
export function QuickLinks() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Quick actions</h2>
      <div className={styles.quickLinkGrid}>
        {QUICK_LINK_VALUES.map((value) => {
          const entry = findNavEntry(value);
          return entry && <QuickLinkCard key={value} entry={entry} />;
        })}
      </div>
    </section>
  );
}
