import { useEffect, useMemo, useState } from 'react';
import { motionDurationMs, prefersReducedMotion } from './motion.js';

interface ParsedMetric {
  prefix: string;
  suffix: string;
  target: number;
  decimals: number;
  grouped: boolean;
}

function parseMetric(value: string): ParsedMetric | null {
  const match = value.match(/[\d,]+(?:\.\d+)?/);
  if (!match || match.index === undefined) return null;
  const numberText = match[0];
  const target = Number(numberText.replace(/,/g, ''));
  if (!Number.isFinite(target)) return null;
  const decimals = numberText.includes('.') ? numberText.split('.')[1].length : 0;
  return {
    prefix: value.slice(0, match.index),
    suffix: value.slice(match.index + numberText.length),
    target,
    decimals,
    grouped: numberText.includes(','),
  };
}

function formatMetric(value: number, metric: ParsedMetric): string {
  const numberText = value.toLocaleString('en-US', {
    minimumFractionDigits: metric.decimals,
    maximumFractionDigits: metric.decimals,
    useGrouping: metric.grouped,
  });
  return `${metric.prefix}${numberText}${metric.suffix}`;
}

export function useCountUp(value: string, enabled = true): string {
  const parsed = useMemo(() => parseMetric(value), [value]);
  const [display, setDisplay] = useState(() =>
    enabled && parsed && !prefersReducedMotion() ? formatMetric(0, parsed) : value,
  );

  useEffect(() => {
    if (!enabled || !parsed || prefersReducedMotion()) {
      setDisplay(value);
      return;
    }
    const duration = motionDurationMs('--oi-motion-duration-long');
    if (duration <= 0) {
      setDisplay(value);
      return;
    }
    setDisplay(formatMetric(0, parsed));
    let frame = 0;
    let start = 0;
    const tick = (time: number) => {
      if (!start) start = time;
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      if (progress < 1) {
        setDisplay(formatMetric(parsed.target * eased, parsed));
        frame = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [enabled, parsed, value]);

  return display;
}