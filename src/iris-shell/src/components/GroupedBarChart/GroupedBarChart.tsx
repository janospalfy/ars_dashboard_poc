import { useLayoutEffect, useMemo, useRef } from 'react';
import { scaleBand, scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { easeCubicOut } from 'd3-ease';
import 'd3-transition';
import { motionDurationMs, prefersReducedMotion } from '../../lib/motion.js';
import { Tooltip } from '../Tooltip/Tooltip.js';
import styles from './GroupedBarChart.module.css';

export interface GroupedBarDatum {
  label: string;
  activeDirectory: number;
  entraId: number;
}

interface Series {
  key: 'activeDirectory' | 'entraId';
  label: string;
  color: string;
}

interface BarGeometry {
  id: string;
  label: string;
  seriesLabel: string;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const SERIES: Series[] = [
  { key: 'activeDirectory', label: 'Active Directory', color: 'var(--oi-color-blue-400)' },
  { key: 'entraId', label: 'Entra ID', color: 'var(--oi-color-teal-400)' },
];

const VIEWBOX_WIDTH = 640;
const PADDING = { top: 12, right: 12, bottom: 34, left: 46 };

export function GroupedBarChart({ data }: { data: GroupedBarDatum[] }) {
  const viewboxHeight = 264;
  const { bars, ticks, xCenters, baseline } = useMemo(() => {
    const groupScale = scaleBand<string>()
      .domain(data.map((item) => item.label))
      .range([PADDING.left, VIEWBOX_WIDTH - PADDING.right])
      .padding(0.24);
    const seriesScale = scaleBand<string>()
      .domain(SERIES.map((series) => series.key))
      .range([0, groupScale.bandwidth()])
      .padding(0.1);
    const maxValue = Math.max(0, ...data.flatMap((item) => SERIES.map((series) => item[series.key])));
    const yScale = scaleLinear()
      .domain([0, maxValue || 1])
      .nice(4)
      .range([viewboxHeight - PADDING.bottom, PADDING.top]);
    const bars = data.flatMap((item) => SERIES.map((series): BarGeometry => {
      const value = item[series.key];
      return {
        id: `${item.label}-${series.key}`,
        label: item.label,
        seriesLabel: series.label,
        value,
        x: (groupScale(item.label) ?? 0) + (seriesScale(series.key) ?? 0),
        y: yScale(value),
        width: seriesScale.bandwidth(),
        height: yScale(0) - yScale(value),
        color: series.color,
      };
    }));
    return {
      bars,
      ticks: yScale.ticks(4).map((value) => ({ value, y: yScale(value) })),
      xCenters: data.map((item) => ({
        label: item.label,
        x: (groupScale(item.label) ?? 0) + groupScale.bandwidth() / 2,
      })),
      baseline: yScale(0),
    };
  }, [data, viewboxHeight]);

  const barsRef = useRef<SVGGElement | null>(null);
  useLayoutEffect(() => {
    const group = barsRef.current;
    if (!group || prefersReducedMotion()) return;
    const rects = select(group).selectAll<SVGRectElement, BarGeometry>('rect').data(bars);
    const duration = motionDurationMs('--oi-motion-duration-default');
    rects
      .attr('y', baseline)
      .attr('height', 0)
      .transition()
      .duration(duration)
      .delay((_bar, index) => (bars.length ? (index * duration) / bars.length : 0))
      .ease(easeCubicOut)
      .attr('y', (bar) => bar.y)
      .attr('height', (bar) => bar.height);
    return () => {
      rects.interrupt();
    };
  }, [bars, baseline]);

  return (
    <div className={styles.wrap}>
      <svg
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${viewboxHeight}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Managed objects by source"
        className={styles.svg}
      >
        {ticks.map((tick) => (
          <g key={tick.value}>
            <line
              x1={PADDING.left}
              x2={VIEWBOX_WIDTH - PADDING.right}
              y1={tick.y}
              y2={tick.y}
              className={styles.gridline}
            />
            <text x={PADDING.left - 8} y={tick.y + 4} className={styles.tick} textAnchor="end">
              {formatTick(tick.value)}
            </text>
          </g>
        ))}
        <g ref={barsRef}>
          {bars.map((bar) => (
            <Tooltip key={bar.id} label={`${bar.label}, ${bar.seriesLabel}: ${bar.value.toLocaleString('en-US')}`}>
              <rect
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                rx={Math.min(2, bar.height / 4)}
                ry={Math.min(2, bar.height / 4)}
                fill={bar.color}
                className={styles.bar}
              />
            </Tooltip>
          ))}
        </g>
        {xCenters.map((item) => (
          <text key={item.label} x={item.x} y={viewboxHeight - 8} className={styles.axisLabel} textAnchor="middle">
            {item.label}
          </text>
        ))}
      </svg>
      <ul className={styles.legend}>
        {SERIES.map((series) => (
          <li key={series.key} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: series.color }} aria-hidden="true" />
            <span>{series.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatTick(value: number): string {
  return value >= 1000 ? `${Math.round(value / 1000)}k` : String(value);
}