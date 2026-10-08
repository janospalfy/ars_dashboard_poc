import { cx } from '../../lib/cx.js';
import { Card } from '../Card/Card.js';
import styles from './MetricCardGroup.module.css';

export interface MetricCardGroupItem {
  label: string;
  value: string | number;
  onClick?: () => void;
  selected?: boolean;
}

export interface MetricCardGroupProps {
  title?: string;
  items: MetricCardGroupItem[];
  className?: string;
  layout?: 'row' | 'grid';
  variant?: 'default' | 'dashboard';
}

/**
 * MetricCardGroup — a single card holding several related metrics as
 * divider-separated columns (e.g. "Your current usage" pattern), instead of
 * one tile per metric. Reads as one grouped stat rather than N separate
 * boxes for a small set of closely related headline numbers.
 */
export function MetricCardGroup({ title, items, className, layout = 'row', variant = 'default' }: MetricCardGroupProps) {
  return (
    <Card title={title} className={cx(variant === 'dashboard' && styles.dashboardCard, className)}>
      <div className={cx(styles.row, layout === 'grid' && styles.grid)}>
        {items.map((item) => {
          const content = (
            <>
              <p className={styles.label}>{item.label}</p>
              <p className={styles.value}>{item.value}</p>
            </>
          );
          return item.onClick ? (
            <button
              key={item.label}
              type="button"
              className={cx(styles.column, styles.clickable, item.selected && styles.selected)}
              onClick={item.onClick}
              aria-pressed={item.selected}
            >
              {content}
            </button>
          ) : (
            <div key={item.label} className={styles.column}>
              {content}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
