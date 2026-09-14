import { cx } from '../../lib/cx.js';
import styles from './MetricTile.module.css';

export interface MetricTileProps {
  label: string;
  value: string | number;
  /** Makes the tile an interactive drill-down trigger (real dashboard
   *  behavior: clicking a KPI tile reveals a table of the underlying
   *  objects). Omit for a purely informational tile. */
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

/**
 * MetricTile — compact KPI tile: label + a single value, no header actions
 * or trend. Same card/typography styling as `StatCard` (used for the small
 * set of hero Overview metrics), for dense per-category KPI grids (e.g. the
 * Active Roles / Active Directory / Entra ID detail pages).
 */
export function MetricTile({ label, value, onClick, selected, className }: MetricTileProps) {
  const content = (
    <>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
    </>
  );
  if (!onClick) {
    return <section className={cx(styles.tile, className)}>{content}</section>;
  }
  return (
    <button
      type="button"
      className={cx(styles.tile, styles.clickable, selected && styles.selected, className)}
      onClick={onClick}
      aria-pressed={selected}
    >
      {content}
    </button>
  );
}


