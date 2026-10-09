import { useMemo } from 'react';
import { scaleLinear, scalePoint } from 'd3-scale';
import { line } from 'd3-shape';
import { Badge } from '../../components/Badge/Badge.js';
import { Card } from '../../components/Card/Card.js';
import { CollapsibleSection } from '../../components/CollapsibleSection/CollapsibleSection.js';
import { DataTable, type DataTableColumn } from '../../components/DataTable/DataTable.js';
import { Icon } from '../../components/Icon/Icon.js';
import { StatCard, type StatCardTrend } from '../../components/StatCard/StatCard.js';
import { Tooltip } from '../../components/Tooltip/Tooltip.js';
import { chartSeriesColor } from '../../lib/chartColors.js';
import {
  CURRENT_MANAGED_OBJECTS,
  LICENSING_THRESHOLDS,
  MANAGED_OBJECT_HISTORY,
  MANAGED_OBJECT_RECORDS,
  PREVIOUS_MANAGED_OBJECTS,
  type ManagedObjectRecord,
  type ManagedObjectSnapshotItem,
  type ManagedObjectSnapshot,
} from './licensingData.js';
import styles from './LicensingDetail.module.css';

const SERIES = [...new Map(MANAGED_OBJECT_HISTORY.flatMap((snapshot) => snapshot.items.map((item) => {
  const key = `${item.category}: ${item.displayName}`;
  return [key, { key, label: key }] as const;
}))).values()];

const changePercent = ((CURRENT_MANAGED_OBJECTS - PREVIOUS_MANAGED_OBJECTS) / PREVIOUS_MANAGED_OBJECTS) * 100;
const managedObjectsTrend: StatCardTrend = {
  direction: changePercent >= 0 ? 'up' : 'down',
  value: `${Math.abs(changePercent).toFixed(1)}% vs last week`,
  tone: changePercent >= 0 ? 'success' : 'danger',
};
const totalThreshold = LICENSING_THRESHOLDS.find((item) => item.id === 'total');
const totalActual = totalThreshold?.actual ?? CURRENT_MANAGED_OBJECTS;
const totalEntitlement = totalThreshold?.entitlement ?? 0;
const totalUtilization = totalEntitlement > 0 ? (totalActual / totalEntitlement) * 100 : 0;
const totalExceeded = totalEntitlement > 0 && totalActual > totalEntitlement;
const totalRemaining = Math.max(totalEntitlement - totalActual, 0);
const totalUtilizationColor = totalExceeded
  ? 'var(--oi-content-color-error)'
  : totalUtilization >= 90
    ? 'var(--oi-base-color-warning)'
    : 'var(--oi-chart-color-1)';

const DETAIL_COLUMNS: DataTableColumn<ManagedObjectRecord>[] = [
  { key: 'category', header: 'Category', minWidth: '140px', grow: 1, cell: (row) => <span>{row.category}</span> },
  { key: 'name', header: 'Managed Object', minWidth: '200px', grow: 2, cell: (row) => <span>{row.name}</span> },
  { key: 'count', header: 'Object Count', minWidth: '120px', grow: 1, cell: (row) => <span>{row.count.toLocaleString('en-US')}</span> },
];

export function LicensingDetail() {
  return (
    <div className={styles.pageContent}>
      <div className={styles.summaryGrid}>
        <StatCard
          className={styles.managedObjectsCard}
          label="Managed Objects"
          value={CURRENT_MANAGED_OBJECTS.toLocaleString('en-US')}
          trend={managedObjectsTrend}
          variant="dashboard"
          showOptions={false}
        />
        <Card
          title="Total Entitlement Usage"
          className={styles.usageCard}
          actions={(
            <Tooltip label="Current managed objects compared with total license capacity">
              <span className={styles.usageInfoTrigger} tabIndex={0} aria-label="About total entitlement usage">
                <Icon name="Info" size="16px" />
              </span>
            </Tooltip>
          )}
        >
          {totalEntitlement > 0 ? (
            <div className={styles.usageContent}>
              <p className={styles.usageValues}>
                <strong>{totalActual.toLocaleString('en-US')}</strong>
                <span>of {totalEntitlement.toLocaleString('en-US')}</span>
              </p>
              <div
                className={styles.usageTrack}
                role="progressbar"
                aria-label="Total licensing entitlement used"
                aria-valuemin={0}
                aria-valuemax={totalEntitlement}
                aria-valuenow={Math.min(totalActual, totalEntitlement)}
                aria-valuetext={`${totalActual.toLocaleString('en-US')} of ${totalEntitlement.toLocaleString('en-US')} objects, ${totalUtilization.toFixed(1)}% used`}
              >
                <span
                  className={styles.usageFill}
                  style={{
                    width: `${Math.min(totalUtilization, 100)}%`,
                    backgroundColor: totalUtilizationColor,
                  }}
                />
              </div>
              <div className={styles.usageMeta}>
                <span>{totalUtilization.toFixed(1)}% used</span>
                <span>{totalExceeded ? 'Over entitlement' : `${totalRemaining.toLocaleString('en-US')} remaining`}</span>
              </div>
            </div>
          ) : (
            <p className={styles.usageUnconfigured}>Total entitlement is not configured.</p>
          )}
        </Card>
      </div>

      <div className={styles.chartGrid}>
        <Card title="Managed Objects Over Time" helper="Counts by managed object" className={styles.chartCard}>
          <ManagedObjectsHistoryChart data={MANAGED_OBJECT_HISTORY} />
        </Card>
        <Card title="Licensing Thresholds" helper="Actual usage compared with configured entitlement" className={styles.chartCard}>
          <LicensingThresholdChart />
        </Card>
      </div>

      <CollapsibleSection
        title="Managed Objects Details"
        className={styles.detailsSection}
      >
        <DataTable
          rows={MANAGED_OBJECT_RECORDS}
          columns={DETAIL_COLUMNS}
          ariaLabel="Managed object details"
          rowLabel={(row) => row.name}
        />
      </CollapsibleSection>
    </div>
  );
}

function ManagedObjectsHistoryChart({ data }: { data: ManagedObjectSnapshot[] }) {
  const width = 640;
  const height = 280;
  const padding = { top: 16, right: 18, bottom: 36, left: 48 };
  const yMax = Math.max(...data.flatMap((point) => SERIES.map((series) => getItemCount(point.items, series.key))));
  const x = useMemo(
    () => scalePoint<string>().domain(data.map((point) => point.label)).range([padding.left, width - padding.right]).padding(0.2),
    [data],
  );
  const y = useMemo(
    () => scaleLinear().domain([0, yMax]).nice(4).range([height - padding.bottom, padding.top]),
    [yMax],
  );

  return (
    <>
      <svg className={styles.historyChart} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Managed object counts by item over time">
        {y.ticks(4).map((tick) => {
          const tickY = y(tick);
          return (
            <g key={tick}>
              <line x1={padding.left} x2={width - padding.right} y1={tickY} y2={tickY} className={styles.gridline} />
              <text x={padding.left - 8} y={tickY + 3} textAnchor="end" className={styles.axisLabel}>{formatCount(tick)}</text>
            </g>
          );
        })}
        {data.map((point) => (
          <text key={point.label} x={x(point.label)} y={height - 10} textAnchor="middle" className={styles.axisLabel}>{point.label}</text>
        ))}
        {SERIES.map((series, index) => {
          const points = line<ManagedObjectSnapshot>()
            .x((point) => x(point.label) ?? 0)
            .y((point) => y(getItemCount(point.items, series.key)))(data) ?? '';
          return (
            <g key={series.key}>
              <path
                d={points}
                pathLength={1}
                className={styles.seriesLine}
                style={{ stroke: chartSeriesColor(index), animationDelay: `${index * 90}ms` }}
              />
              {data.map((point, pointIndex) => (
                <circle
                  key={`${series.key}-${point.label}`}
                  cx={x(point.label)}
                  cy={y(getItemCount(point.items, series.key))}
                  r="3"
                  className={styles.seriesPoint}
                  style={{ fill: chartSeriesColor(index), animationDelay: `${index * 90 + pointIndex * 40}ms` }}
                >
                  <title>{`${series.label}, ${point.label}: ${getItemCount(point.items, series.key).toLocaleString('en-US')}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
      <ul className={styles.historyLegend}>
        {SERIES.map((series, index) => (
          <li className={styles.historyLegendItem} key={series.key}>
            <span className={styles.legendMark} style={{ backgroundColor: chartSeriesColor(index) }} />
            {series.label}
          </li>
        ))}
      </ul>
    </>
  );
}

function LicensingThresholdChart() {
  const maxValue = Math.max(...LICENSING_THRESHOLDS.flatMap((item) => [item.actual, item.entitlement]));
  const scale = maxValue > 0 ? maxValue * 1.08 : 1;

  return (
    <div className={styles.thresholdList} role="list" aria-label="Actual managed objects versus licensing entitlement">
      <div className={styles.thresholdLegend} aria-hidden="true">
        <span className={styles.thresholdLegendItem}><span className={styles.actualMark} />Actual</span>
        <span className={styles.thresholdLegendItem}><span className={styles.limitMark} />Entitlement</span>
      </div>
      {LICENSING_THRESHOLDS.map((item, index) => {
        const exceeded = item.actual > item.entitlement;
        return (
          <div className={styles.thresholdRow} key={item.id} role="listitem" aria-label={`${item.label}: ${item.actual.toLocaleString('en-US')} actual, ${item.entitlement.toLocaleString('en-US')} entitlement`}>
            <span className={styles.thresholdLabel}>{item.label}</span>
            <span className={styles.thresholdTrack} aria-hidden="true">
              <span
                className={styles.thresholdFill}
                style={{
                  width: `${Math.min((item.actual / scale) * 100, 100)}%`,
                  backgroundColor: exceeded ? 'var(--oi-content-color-error)' : chartSeriesColor(index),
                  animationDelay: `${index * 70}ms`,
                }}
              />
              <span className={styles.thresholdLimit} style={{ left: `${Math.min((item.entitlement / scale) * 100, 100)}%` }} />
            </span>
            <span className={styles.thresholdValues}>
              {item.actual.toLocaleString('en-US')} <span>/ {item.entitlement.toLocaleString('en-US')}</span>
            </span>
            <span className={styles.thresholdStatus}>
              <Badge tone={exceeded ? 'error' : 'success'}>{exceeded ? 'Over' : 'Within'}</Badge>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function formatCount(value: number): string {
  return value >= 1000 ? `${Math.round(value / 1000)}k` : String(value);
}

function getItemCount(items: ManagedObjectSnapshotItem[], key: string): number {
  return items.find((item) => `${item.category}: ${item.displayName}` === key)?.count ?? 0;
}