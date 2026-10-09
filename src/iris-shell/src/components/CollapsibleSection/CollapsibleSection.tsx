import { useId, useState, type ReactNode } from 'react';
import { cx } from '../../lib/cx.js';
import { useCountUp } from '../../lib/useCountUp.js';
import { Icon } from '../Icon/Icon.js';
import styles from './CollapsibleSection.module.css';

export interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  variant?: 'section' | 'accordion';
  count?: string | number;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

/**
 * CollapsibleSection — a titled section used to group dense KPI grids on
 * the per-category detail pages (e.g. "Governance and Risk", "Active Roles
 * Configuration").
 */
export function CollapsibleSection({ title, children, className, collapsible = false, variant = 'section', count, expanded, onExpandedChange }: CollapsibleSectionProps) {
  const [localExpanded, setLocalExpanded] = useState(true);
  const isExpanded = expanded ?? localExpanded;
  const bodyId = useId();
  const triggerId = `${bodyId}-trigger`;
  const Heading = variant === 'accordion' ? 'h3' : 'h2';
  const displayedCount = useCountUp(count === undefined ? '' : String(count), count !== undefined);
  return (
    <section className={cx(styles.section, variant === 'accordion' && styles.accordion, className)}>
      <header className={styles.header}>
        <Heading className={cx(styles.title, collapsible && styles.collapsibleTitle)}>
          {collapsible ? (
            <button
              type="button"
              id={triggerId}
              className={styles.toggle}
              aria-expanded={isExpanded}
              aria-controls={bodyId}
              onClick={() => {
                setLocalExpanded(!isExpanded);
                onExpandedChange?.(!isExpanded);
              }}
            >
              {variant === 'accordion' && <Icon name={isExpanded ? 'CaretUp' : 'CaretDown'} size="16px" />}
              <span className={styles.toggleLabel}>{title}</span>
              {count !== undefined && <span className={styles.count}>{displayedCount}</span>}
              {variant !== 'accordion' && <Icon name={isExpanded ? 'CaretDown' : 'CaretRight'} size="16px" />}
            </button>
          ) : title}
        </Heading>
      </header>
      {(!collapsible || isExpanded) && (
        <div
          id={bodyId}
          className={styles.body}
          role={collapsible ? 'region' : undefined}
          aria-labelledby={collapsible ? triggerId : undefined}
        >
          {children}
        </div>
      )}
    </section>
  );
}

