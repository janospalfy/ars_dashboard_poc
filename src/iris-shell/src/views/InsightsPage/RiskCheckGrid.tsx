import { useId } from 'react';
import { Badge } from '../../components/Badge/Badge.js';
import { CardTitleIcon } from '../../components/Card/Card.js';
import { Icon } from '../../components/Icon/Icon.js';
import { useCountUp } from '../../lib/useCountUp.js';
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
  const orderedChecks = [...checks].sort((first, second) =>
    second.value - first.value || first.label.localeCompare(second.label),
  );
  const findingsCount = orderedChecks.filter((check) => check.value > 0).length;
  const displayedFindingsCount = useCountUp(String(findingsCount));
  const displayedClearCount = useCountUp(String(orderedChecks.length - findingsCount));

  return (
    <section className={styles.riskSection} aria-labelledby={titleId}>
      <header className={styles.riskHeader}>
        <div className={styles.riskTitleGroup}>
          <CardTitleIcon icon="ShieldWarning" />
          <h3 className={styles.riskTitle} id={titleId}>Governance and Risk</h3>
        </div>
        <div className={styles.riskBadges}>
          <Badge className={styles.riskHeaderBadge} tone="warning">{displayedFindingsCount} checks with findings</Badge>
          <Badge className={styles.riskHeaderBadge} tone="success">{displayedClearCount} clear</Badge>
        </div>
      </header>
      <div className={styles.riskMatrix} data-columns={orderedChecks.length > 9 ? 4 : 3}>
        {orderedChecks.map((check) => (
          <RiskCheckTile
            key={check.id}
            check={check}
            selected={selectedId === check.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

function RiskCheckTile<TCheck extends RiskCheck>({
  check,
  selected,
  onSelect,
}: { check: TCheck; selected: boolean; onSelect: (check: TCheck) => void }) {
  const displayedCount = useCountUp(check.value.toLocaleString('en-US'));

  return (
    <button
      type="button"
      className={styles.riskTile}
      aria-label={`Review ${check.label}: ${check.value} objects`}
      aria-pressed={selected}
      onClick={() => onSelect(check)}
    >
      <span className={styles.riskTileCount}>{displayedCount}</span>
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
  );
}