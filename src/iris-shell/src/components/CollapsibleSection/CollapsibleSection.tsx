import type { ReactNode } from 'react';
import { cx } from '../../lib/cx.js';
import styles from './CollapsibleSection.module.css';

export interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * CollapsibleSection — a titled section used to group dense KPI grids on
 * the per-category detail pages (e.g. "Governance and Risk", "Active Roles
 * Configuration").
 */
export function CollapsibleSection({ title, children, className }: CollapsibleSectionProps) {
  return (
    <section className={cx(styles.section, className)}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

