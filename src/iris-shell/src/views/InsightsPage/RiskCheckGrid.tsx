import { useId } from 'react';
import { Badge } from '../../components/Badge/Badge.js';
import { Icon } from '../../components/Icon/Icon.js';
import type { KpiDefinition } from './activeRolesKpis.js';
import styles from './ActiveRolesDetail.module.css';

type RiskCheck = Pick<KpiDefinition, 'id' | 'label' | 'value'>;

interface RiskCheckGridProps<TCheck extends RiskCheck> {
  checks: TCheck[];
  selectedId?: string;
  onSelect: (check: TCheck) => void;
}

export function RiskCheckGrid<TCheck extends RiskCheck>({ checks, selectedId, onSelect }: RiskCheckGridProps<TCheck>) {
  const titleId = useId();
  const orderedChecks = [...checks].sort((first, second) => second.value - first.value);
  const findingsCount = orderedChecks.filter((check) => check.value > 0).length;
  const maxCount = Math.max(...orderedChecks.map((check) => check.value), 1);

  return (
    <section className={styles.riskSection} aria-labelledby={titleId}>
      <header className={styles.riskHeader}>
        <h3 className={styles.riskTitle} id={titleId}>Governance and Risk</h3>
        <div className={styles.riskBadges}>
          <Badge className={styles.riskHeaderBadge} tone="neutral">{findingsCount} checks with findings</Badge>
          <Badge className={styles.riskHeaderBadge} tone="success">{orderedChecks.length - findingsCount} clear</Badge>
        </div>
      </header>
      <div className={styles.riskTileGrid}>
        {orderedChecks.map((check) => (
          <button
            key={check.id}
            type="button"
            className={styles.riskTile}
            aria-label={`Review ${check.label}: ${check.value} objects`}
            aria-pressed={selectedId === check.id}
            onClick={() => onSelect(check)}
          >
            <span className={styles.riskTileCount}>{check.value.toLocaleString('en-US')}</span>
            <span className={styles.riskTileLabel}>{check.label}</span>
            <span className={styles.riskTileStatus}>
              <Icon
                name={check.value ? 'Warning' : 'CheckCircle'}
                size="20px"
                className={check.value ? styles.riskTileStatusWarning : styles.riskTileStatusClear}
              />
              <span className={check.value ? styles.riskTileStatusWarning : styles.riskTileStatusClear}>
                {check.value ? 'Needs review' : 'No findings'}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}