import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { pie, arc, type PieArcDatum } from 'd3-shape';
import { select } from 'd3-selection';
import { interpolate } from 'd3-interpolate';
import { easeCubicOut } from 'd3-ease';
import 'd3-transition';
import { cx } from '../../lib/cx.js';
import { chartSeriesColor } from '../../lib/chartColors.js';
import { motionDurationMs, prefersReducedMotion } from '../../lib/motion.js';
import { useCountUp } from '../../lib/useCountUp.js';
import { Tooltip } from '../Tooltip/Tooltip.js';
import styles from './DonutChart.module.css';

export interface DonutSegment {
  label: string;
  value: number;
  color?: string;
}

export interface DonutChartProps {
  segments: DonutSegment[];
  /** Ring thickness in viewBox units. */
  strokeWidth?: number;
  className?: string;
  variant?: 'full' | 'semicircle';
  size?: 'default' | 'compact';
  legendPosition?: 'side' | 'below';
  totalFormat?: 'compact' | 'full' | 'abbreviated';
  segmentGap?: number;
  cornerRadius?: number;
}

/**
 * DonutChart — minimal SVG donut + legend.
 */
export function DonutChart({ segments, strokeWidth = 22, className, variant = 'full', size = 'default', legendPosition = 'side', totalFormat = 'compact', segmentGap = 0, cornerRadius = segmentGap / 2 }: DonutChartProps) {
  const VB = 160; // viewBox is square
  const R = 60;
  const STROKE = strokeWidth;
  const isSemicircle = variant === 'semicircle';
  const isStacked = isSemicircle || legendPosition === 'below';
  const useFullTotal = isStacked || totalFormat !== 'compact';
  const [hiddenSegments, setHiddenSegments] = useState<Set<string>>(() => new Set());
  const toggleSegment = (label: string) => {
    setHiddenSegments((previous) => {
      const next = new Set(previous);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const makeArc = useMemo(
    () =>
      arc<PieArcDatum<DonutSegment>>()
        .innerRadius(R - STROKE / 2)
        .outerRadius(R + STROKE / 2)
        .padAngle(segmentGap / R)
        .cornerRadius(cornerRadius),
      [STROKE, segmentGap, cornerRadius],
  );

  const { arcs, total } = useMemo<{ arcs: PieArcDatum<DonutSegment>[]; total: number }>(() => {
    const visibleSegments = segments
      .map((segment, index) => ({ ...segment, color: segment.color ?? chartSeriesColor(index) }))
      .filter((segment) => !hiddenSegments.has(segment.label));
    const t = visibleSegments.reduce((s, x) => s + x.value, 0);
    const layout = pie<DonutSegment>()
      .value((s) => s.value)
      .sort(null)
      .startAngle(isSemicircle ? -Math.PI / 2 : 0)
      .endAngle(isSemicircle ? Math.PI / 2 : 2 * Math.PI);
    return { arcs: layout(visibleSegments), total: t };
  }, [segments, isSemicircle, hiddenSegments]);
  const totalText = useFullTotal && totalFormat !== 'abbreviated'
    ? total.toLocaleString('en-US')
    : formatTotal(total);
  const displayedTotal = useCountUp(totalText);

  // Sweep each arc open from its start angle to its end angle by
  // interpolating `endAngle`. React renders the final paths; d3 only drives
  // the transient `d` during the transition. Layout effect sets the
  // collapsed start before paint to avoid a flash of the full ring. Fires on
  // mount and re-animates whenever the derived `arcs`/`makeArc` change (i.e.
  // on `segments` changes).
  const ringRef = useRef<SVGGElement | null>(null);
  useLayoutEffect(() => {
    const g = ringRef.current;
    if (!g) return;
    const paths = select(g).selectAll<SVGPathElement, PieArcDatum<DonutSegment>>('path').data(arcs);
    if (prefersReducedMotion()) return;
    const dur = motionDurationMs('--oi-motion-duration-default');
    paths
      .attr('d', (d) => makeArc({ ...d, endAngle: d.startAngle }) ?? '')
      .transition()
      .duration(dur)
      .ease(easeCubicOut)
      .attrTween('d', (d) => {
        const i = interpolate(d.startAngle, d.endAngle);
        return (t) => makeArc({ ...d, endAngle: i(t) }) ?? '';
      });
    return () => {
      paths.interrupt();
    };
  }, [arcs, makeArc]);

  const chart = (
      <svg viewBox={`0 0 ${VB} ${isSemicircle ? 100 : VB}`} className={styles.svg} role="img" aria-label="Distribution">
        {/* Track */}
        {isSemicircle ? (
          <path
            d="M 20 80 A 60 60 0 0 1 140 80"
            fill="none"
            stroke={segmentGap > 0 && total > 0 ? 'none' : 'var(--oi-border-color-muted)'}
            strokeWidth={STROKE}
          />
        ) : (
          <circle
          cx={VB / 2}
          cy={VB / 2}
          r={R}
          fill="none"
          stroke={segmentGap > 0 && total > 0 ? 'none' : 'var(--oi-border-color-muted)'}
          strokeWidth={STROKE}
          />
        )}
        {/* Segments — rotated -90deg so 0 starts at top */}
        <g ref={ringRef} transform={`translate(${VB / 2} ${VB / 2}) rotate(${isSemicircle ? 0 : -90})`}>
          {arcs.map((a) => (
            <Tooltip key={a.data.label} label={`${a.data.label}: ${a.data.value.toLocaleString('en-US')}`}>
              <path d={makeArc(a) ?? ''} fill={a.data.color ?? chartSeriesColor(a.index)} tabIndex={0} />
            </Tooltip>
          ))}
        </g>
        {/* Center label */}
        {!useFullTotal && <text x={VB / 2} y={VB / 2 - 2} textAnchor="middle" className={styles.centerNum}>
          {displayedTotal}
        </text>}
        {!useFullTotal && <text x={VB / 2} y={VB / 2 + 14} textAnchor="middle" className={styles.centerLbl}>
          Total
        </text>}
      </svg>
  );

  return (
    <div className={cx(styles.wrap, isStacked && styles.stacked, useFullTotal && styles.fullTotal, isSemicircle && styles.semicircle, size === 'compact' && styles.compact, className)}>
      {useFullTotal ? (
        <div className={isSemicircle ? styles.semicircleGraphic : styles.fullGraphic}>
          {chart}
          <div className={styles.total}>
            <Tooltip label={`Total: ${total.toLocaleString('en-US')}`}>
              <p className={styles.totalValue} tabIndex={0}>
                {displayedTotal}
              </p>
            </Tooltip>
            <p className={styles.totalLabel}>Total</p>
          </div>
        </div>
      ) : chart}
      <ul className={styles.legend}>
        {segments.map((s, i) => (
          <DonutLegendItem
            key={s.label}
            segment={s}
            index={i}
            hidden={hiddenSegments.has(s.label)}
            onToggle={toggleSegment}
          />
        ))}
      </ul>
    </div>
  );
}

function DonutLegendItem({
  segment,
  index,
  hidden,
  onToggle,
}: {
  segment: DonutSegment;
  index: number;
  hidden: boolean;
  onToggle: (label: string) => void;
}) {
  const displayedValue = useCountUp(formatTotal(segment.value));

  return (
    <li className={styles.legendItem} title={segment.label}>
      <button
        type="button"
        className={styles.legendButton}
        aria-label={segment.label}
        aria-pressed={!hidden}
        title={`${hidden ? 'Show' : 'Hide'} ${segment.label}`}
        onClick={() => onToggle(segment.label)}
      >
        <span
          className={styles.dot}
          style={{ backgroundColor: segment.color ?? chartSeriesColor(index) }}
          aria-hidden="true"
        />
        <span className={styles.legendLabel}>{segment.label}</span>
        <span className={styles.legendValue}>{displayedValue}</span>
      </button>
    </li>
  );
}

function formatTotal(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}
