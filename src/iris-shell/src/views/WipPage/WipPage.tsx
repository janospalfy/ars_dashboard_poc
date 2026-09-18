import { type Ref } from 'react';
import { AppShell } from '../AppShell/AppShell.js';
import type { Crumb } from '../../components/AppHeader/AppHeader.js';
import { ContentHeader } from '../../components/ContentHeader/ContentHeader.js';
import { IconButton } from '../../components/IconButton/IconButton.js';
import { Menu, type MenuEntry } from '../../components/Menu/Menu.js';
import { Tooltip } from '../../components/Tooltip/Tooltip.js';
import styles from './WipPage.module.css';

/** Page-level actions shown in the heading's overflow menu. Mirrors UsersPage. */
const PAGE_ACTIONS_MENU_ITEMS: MenuEntry[] = [
  { kind: 'item', label: 'Customize', icon: 'Pencil' },
  { kind: 'item', label: 'Add page to favorites', icon: 'Star' },
];

export interface WipPageProps {
  /** Heading text + breadcrumb leaf. */
  title: string;
  /** Glyph shown in the leading ResourceIcon tile. */
  icon: string;
  /** Overrides the default "Directory Management > {title}" breadcrumb. */
  breadcrumb?: Crumb[];
  /** Which global nav item is current. Defaults to the directory rail. */
  activeGlobalItem?: string;
  /** Render the directory/sub-nav rail. Defaults to true (directory sections). */
  showSecondarySidebar?: boolean;
  /** When set, renders a back button in the header that calls this handler. */
  onBack?: () => void;
  /** aria-label + tooltip for the back button. */
  backLabel?: string;
}

/**
 * WipPage — placeholder for sections that don't have a real view yet.
 * Reuses the UsersPage header treatment (icon + title + page-actions menu)
 * and shows a "WIP" marker in the content area.
 */
export function WipPage({
  title,
  icon,
  breadcrumb,
  activeGlobalItem,
  showSecondarySidebar,
  onBack,
  backLabel,
}: WipPageProps) {
  const actionsMenu = (
    <Menu
      ariaLabel="Page actions"
      align="end"
      items={PAGE_ACTIONS_MENU_ITEMS}
      trigger={({ ref, onClick, expanded }) => (
        <Tooltip label="More options">
          <IconButton
            ref={ref as Ref<HTMLButtonElement>}
            icon="DotsThree"
            ariaLabel="Page actions"
            aria-haspopup="menu"
            aria-expanded={expanded}
            onClick={onClick}
          />
        </Tooltip>
      )}
    />
  );

  return (
    <AppShell
      breadcrumb={breadcrumb ?? [{ label: 'Directory Management' }, { label: title }]}
      activeGlobalItem={activeGlobalItem}
      showSecondarySidebar={showSecondarySidebar}
    >
      {onBack ? (
        <ContentHeader
          variant="detail"
          icon={icon}
          title={title}
          onBack={onBack}
          backLabel={backLabel}
          actions={actionsMenu}
        />
      ) : (
        <ContentHeader icon={icon} title={title} actions={actionsMenu} />
      )}

      <div className={styles.wip}>
        <code className={styles.wipCode}>[WIP]</code>
      </div>
    </AppShell>
  );
}
