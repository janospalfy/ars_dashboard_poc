import type { ReactNode } from 'react';
import { cx } from '../../lib/cx.js';
import { useCountUp } from '../../lib/useCountUp.js';
import { CardTitleIcon } from '../Card/Card.js';
import { Icon } from '../Icon/Icon.js';
import { IconButton } from '../IconButton/IconButton.js';
import { Tooltip } from '../Tooltip/Tooltip.js';
import styles from './StatCard.module.css';

export type StatCardTrendDirection = 'up' | 'down' | 'warning';
export type StatCardTrendTone = 'success' | 'danger' | 'warning';

export interface StatCardTrend {
  direction: StatCardTrendDirection;
  value: string;
  tone: StatCardTrendTone;
}

export interface StatCardProps {
  label: string;
  value: string;
  icon?: string;
  trend?: StatCardTrend;
  animateValue?: boolean;
  valueFirst?: boolean;
  showOptions?: boolean;
  className?: string;
  variant?: 'default' | 'dashboard';
  description?: string;
  actions?: ReactNode;
}

/**
 * StatCard — a single hero metric tile.
 *
 *   <StatCard
 *     label="Managed Users"
 *     value="77,236"
 *     trend={{ direction: 'up', value: '2.4%', tone: 'success' }}
 *   />
 */
export function StatCard({
  label,
  value,
  icon,
  trend,
  animateValue = true,
  valueFirst = false,
  showOptions = true,
  className,
  variant = 'default',
  description,
  actions,
}: StatCardProps) {
  const display = useCountUp(value, animateValue);
  const displayTrend = useCountUp(trend?.value ?? '', !!trend);
  const isDashboard = variant === 'dashboard';
  return (
    <section className={cx(styles.card, valueFirst && styles.valueFirstCard, isDashboard && styles.dashboardCard, className)}>
      {isDashboard ? (
        <header className={cx(styles.header, styles.dashboardHeader)}>
          <div className={styles.dashboardTitleGroup}>
            {icon && <CardTitleIcon icon={icon} />}
            <p className={styles.dashboardTitle}>{label}</p>
            {description && (
              <Tooltip label={description}>
                <span className={styles.info} tabIndex={0} aria-label={`About ${label}`}>
                  <Icon name="Info" size="16px" />
                </span>
              </Tooltip>
            )}
          </div>
          {actions ?? (showOptions && <IconButton icon="DotsThree" ariaLabel={`${label} options`} size="s" />)}
        </header>
      ) : (!valueFirst || showOptions) && (
        <header className={cx(styles.header, valueFirst && styles.headerValueFirst)}>
          {!valueFirst && <p className={styles.label}>{label}</p>}
          {showOptions && <IconButton icon="DotsThree" ariaLabel={`${label} options`} size="s" />}
        </header>
      )}
      <div className={styles.metric}>
        <p className={cx(styles.value, valueFirst && styles.valueFirstValue)}>{display}</p>
        {valueFirst && !isDashboard && (
          <p className={cx(styles.label, styles.valueFirstLabel)}>
            {icon && <Icon name={icon} size="20px" className={styles.valueFirstIcon} />}
            <span>{label}</span>
          </p>
        )}
        {trend && (
          <p className={cx(styles.trend, styles[`tone_${trend.tone}`])}>
            <Icon name={TREND_ICONS[trend.direction]} size={isDashboard ? '24px' : '16px'} />
            <span>{displayTrend}</span>
          </p>
        )}
      </div>
    </section>
  );
}

const TREND_ICONS: Record<StatCardTrendDirection, string> = {
  up: 'TrendUp',
  down: 'TrendDown',
  warning: 'Warning',
};
