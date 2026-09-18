import { useState } from 'react';
import { Card } from '../../components/Card/Card.js';
import { Button } from '../../components/Button/Button.js';
import { Badge, type BadgeTone } from '../../components/Badge/Badge.js';
import { MultiSelect } from '../../components/MultiSelect/MultiSelect.js';
import { DataTable, type DataTableColumn } from '../../components/DataTable/DataTable.js';
import { BarChart } from '../../components/BarChart/BarChart.js';
import { Icon } from '../../components/Icon/Icon.js';
import {
  PERF_TARGETS,
  PERF_TEST_TYPES,
  SERVER_TYPE_LABELS,
  runPerformanceTests,
  type PerfProbeResult,
  type PerfStatus,
} from './mockPerformanceTests.js';
import styles from './PerformanceTestsPanel.module.css';

const STATUS_TONE: Record<PerfStatus, BadgeTone> = {
  Ok: 'success',
  Warn: 'warning',
  Fail: 'error',
  Skipped: 'neutral',
};

interface ResultRow extends PerfProbeResult {
  id: string;
}

const RESULT_COLUMNS: DataTableColumn<ResultRow>[] = [
  { key: 'target', header: 'Target', minWidth: '140px', grow: 1, cell: (r) => <span>{r.targetName}</span> },
  {
    key: 'serverType',
    header: 'Server Type',
    minWidth: '150px',
    cell: (r) => <span>{SERVER_TYPE_LABELS[r.serverType]}</span>,
  },
  { key: 'testType', header: 'Test Type', minWidth: '110px', cell: (r) => <span>{r.testType}</span> },
  {
    key: 'status',
    header: 'Status',
    width: '110px',
    cell: (r) => <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>,
  },
  {
    key: 'latency',
    header: 'Latency',
    width: '100px',
    cell: (r) => <span>{r.latencyMs != null ? `${r.latencyMs} ms` : ''}</span>,
  },
  { key: 'detail', header: 'Detail', minWidth: '200px', grow: 1, cell: (r) => <span>{r.message}</span> },
];

/**
 * PerformanceTestsPanel — Active Roles KPI page addition mirroring the real
 * dashboard's on-demand connectivity/latency probes
 * (Pages/Shared/_PerformanceTests.cshtml). Ported to Iris design-system
 * components; results are simulated (see mockPerformanceTests.ts) since this
 * prototype has no backend to probe.
 */
export function PerformanceTestsPanel() {
  const [selectedTestTypes, setSelectedTestTypes] = useState<Set<string>>(
    () => new Set(PERF_TEST_TYPES.map((t) => t.value)),
  );
  const [selectedTargets, setSelectedTargets] = useState<Set<string>>(
    () => new Set(PERF_TARGETS.map((t) => t.id)),
  );
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<PerfProbeResult[] | null>(null);

  const runTests = async () => {
    setRunning(true);
    const next = await runPerformanceTests({ testTypes: selectedTestTypes, targetIds: selectedTargets });
    setResults(next);
    setRunning(false);
  };

  const okCount = results?.filter((r) => r.status === 'Ok').length ?? 0;
  const warnCount = results?.filter((r) => r.status === 'Warn').length ?? 0;
  const failCount = results?.filter((r) => r.status === 'Fail').length ?? 0;

  const rows: ResultRow[] = (results ?? []).map((r) => ({ ...r, id: `${r.targetId}:${r.testType}` }));
  const chartData = (results ?? [])
    .filter((r) => r.latencyMs != null)
    .map((r) => ({ label: `${r.targetName} · ${r.testType}`, value: r.latencyMs as number }));

  return (
    <Card title="Performance Tests" helper="On-demand connectivity and latency probes against live targets.">
      <div className={styles.controls}>
        <div className={styles.selectors}>
          <MultiSelect
            label="Test Type"
            ariaLabel="Test types"
            selected={selectedTestTypes}
            onSelectionChange={setSelectedTestTypes}
            options={PERF_TEST_TYPES.map((t) => ({ value: t.value, title: t.label }))}
          />
          <MultiSelect
            label="Select Targets"
            ariaLabel="Targets"
            selected={selectedTargets}
            onSelectionChange={setSelectedTargets}
            options={PERF_TARGETS.map((t) => ({
              value: t.id,
              title: t.name,
              subtitle: SERVER_TYPE_LABELS[t.serverType],
            }))}
          />
        </div>
        <div className={styles.runRow}>
          <Button
            onClick={runTests}
            disabled={running || selectedTestTypes.size === 0 || selectedTargets.size === 0}
          >
            {running && <Icon name="CircleNotch" size="16px" className={styles.spinner} />}
            {running ? 'Running…' : 'Run tests'}
          </Button>
          {results && (
            <span className={styles.status} role="status" aria-live="polite">
              OK {okCount} / Warn {warnCount} / Fail {failCount}
            </span>
          )}
        </div>
      </div>

      {results && rows.length === 0 && <p className={styles.empty}>No results for the current selection.</p>}

      {rows.length > 0 && (
        <>
          <DataTable rows={rows} columns={RESULT_COLUMNS} ariaLabel="Performance test results" />
          {chartData.length > 0 && (
            <div className={styles.chartWrap}>
              <h4 className={styles.chartTitle}>Latency</h4>
              <BarChart data={chartData} height={240} />
            </div>
          )}
        </>
      )}
    </Card>
  );
}
