/** Mock data + simulated run behaviour for the Active Roles "Performance
 *  Tests" panel, mirroring `/api/diagnostics/targets` and `/api/diagnostics/run`
 *  from the real Active Roles Dashboard (localhost:5062). No network calls —
 *  this POC has no backend, so `runPerformanceTests` resolves from a fixed
 *  lookup table after a short delay to simulate a live probe round-trip. */

export type PerfTestType = 'Ping' | 'LdapBind' | 'RestGet' | 'RstsAuth' | 'WebHttp' | 'SqlQuery';
export type PerfServerType =
  | 'ActiveRolesServer'
  | 'Rsts'
  | 'WebInterface'
  | 'DomainController'
  | 'SqlServer';
export type PerfStatus = 'Ok' | 'Warn' | 'Fail' | 'Skipped';

export interface PerfTestTypeInfo {
  value: PerfTestType;
  label: string;
}

export interface PerfTarget {
  id: string;
  name: string;
  serverType: PerfServerType;
  applicableTests: PerfTestType[];
}

export interface PerfProbeResult {
  targetId: string;
  targetName: string;
  serverType: PerfServerType;
  testType: PerfTestType;
  status: PerfStatus;
  latencyMs: number | null;
  message: string;
}

export const SERVER_TYPE_LABELS: Record<PerfServerType, string> = {
  ActiveRolesServer: 'AR Server',
  Rsts: 'RSTS',
  WebInterface: 'Web Interface',
  DomainController: 'Domain Controller',
  SqlServer: 'SQL Server',
};

/** Test types applicable to the Active Roles dashboard scope (mirrors the
 *  `_PerformanceTests.cshtml` `applicableByDashboard["ActiveRoles"]` list). */
export const PERF_TEST_TYPES: PerfTestTypeInfo[] = [
  { value: 'Ping', label: 'Ping' },
  { value: 'LdapBind', label: 'LDAP bind' },
  { value: 'RestGet', label: 'REST GET' },
  { value: 'RstsAuth', label: 'RSTS auth' },
  { value: 'WebHttp', label: 'Web HTTP' },
  { value: 'SqlQuery', label: 'SQL query' },
];

export const PERF_TARGETS: PerfTarget[] = [
  { id: 'ar-srv-01', name: 'ARSRV01', serverType: 'ActiveRolesServer', applicableTests: ['Ping', 'RestGet'] },
  { id: 'rsts-01', name: 'RSTS01', serverType: 'Rsts', applicableTests: ['Ping', 'RstsAuth'] },
  { id: 'web-01', name: 'WEBUI01', serverType: 'WebInterface', applicableTests: ['Ping', 'WebHttp'] },
  { id: 'dc-01', name: 'DC01', serverType: 'DomainController', applicableTests: ['Ping', 'LdapBind'] },
  { id: 'dc-02', name: 'DC02', serverType: 'DomainController', applicableTests: ['Ping', 'LdapBind'] },
  { id: 'sql-01', name: 'SQLDB01', serverType: 'SqlServer', applicableTests: ['Ping', 'SqlQuery'] },
];

/** Fixed synthetic probe outcomes, keyed by `${targetId}:${testType}`. Stable
 *  across runs (no randomness), matching the POC's mock-data convention. */
const RESULTS_BY_KEY: Record<string, { status: PerfStatus; latencyMs: number | null; message: string }> = {
  'ar-srv-01:Ping': { status: 'Ok', latencyMs: 4, message: 'Reachable' },
  'ar-srv-01:RestGet': { status: 'Ok', latencyMs: 118, message: 'HTTP 200' },
  'rsts-01:Ping': { status: 'Ok', latencyMs: 6, message: 'Reachable' },
  'rsts-01:RstsAuth': { status: 'Warn', latencyMs: 812, message: 'Token issued, elevated latency' },
  'web-01:Ping': { status: 'Ok', latencyMs: 5, message: 'Reachable' },
  'web-01:WebHttp': { status: 'Ok', latencyMs: 63, message: 'HTTP 200' },
  'dc-01:Ping': { status: 'Ok', latencyMs: 2, message: 'Reachable' },
  'dc-01:LdapBind': { status: 'Ok', latencyMs: 21, message: 'Bind succeeded' },
  'dc-02:Ping': { status: 'Fail', latencyMs: null, message: 'Request timed out' },
  'dc-02:LdapBind': { status: 'Skipped', latencyMs: null, message: 'Skipped after failed ping' },
  'sql-01:Ping': { status: 'Ok', latencyMs: 3, message: 'Reachable' },
  'sql-01:SqlQuery': { status: 'Ok', latencyMs: 47, message: 'SELECT 1 succeeded' },
};

export interface RunPerformanceTestsRequest {
  testTypes: Set<string>;
  targetIds: Set<string>;
}

/** Simulates the `/api/diagnostics/run` POST: filters mock results down to
 *  the selected targets/test types, applying the same applicability rules
 *  the real target provider enforces. */
export function runPerformanceTests({
  testTypes,
  targetIds,
}: RunPerformanceTestsRequest): Promise<PerfProbeResult[]> {
  const results: PerfProbeResult[] = [];
  for (const target of PERF_TARGETS) {
    if (!targetIds.has(target.id)) continue;
    for (const testType of target.applicableTests) {
      if (!testTypes.has(testType)) continue;
      const outcome = RESULTS_BY_KEY[`${target.id}:${testType}`];
      if (!outcome) continue;
      results.push({
        targetId: target.id,
        targetName: target.name,
        serverType: target.serverType,
        testType,
        ...outcome,
      });
    }
  }
  return new Promise((resolve) => setTimeout(() => resolve(results), 700));
}
