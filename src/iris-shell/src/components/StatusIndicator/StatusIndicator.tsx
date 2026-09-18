import type { ReactNode } from 'react';
import { Icon } from '../Icon/Icon.js';
import { cx } from '../../lib/cx.js';
import styles from './StatusIndicator.module.css';

export type StatusIndicatorTone = 'neutral' | 'success' | 'warning' | 'error';

export interface StatusIndicatorProps {
  tone?: StatusIndicatorTone;
  children?: ReactNode;
  className?: string;
}

const ICON_BY_TONE: Record<StatusIndicatorTone, string> = {
  neutral: 'MinusCircle',
  success: 'CheckCircle',
  warning: 'WarningOctagon',
  error: 'XCircle',
};

/**
 * StatusIndicator — compact inline health/status readout: icon + colored
 * text, no pill background. Lighter-weight than `Badge` for dense contexts
 * like a results table (e.g. Performance Tests probe status).
 */
export function StatusIndicator({ tone = 'neutral', children, className }: StatusIndicatorProps) {
  return (
    <span className={cx(styles.indicator, styles[`tone_${tone}`], className)}>
      <Icon name={ICON_BY_TONE[tone]} size="16px" />
      <span>{children}</span>
    </span>
  );
}
