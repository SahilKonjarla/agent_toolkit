// One independently tracked child per background slot prevents nested/composite fan-out
// from multiplying five top-level runs into twenty-five workers.
export const MAX_BACKGROUND_AGENTS = 5;
export const DEFAULT_TIMEOUT_MS = 600000;

export function applyLaunchPolicy(input: Record<string, any>): string | undefined {
  if (input.action) {
    if (input.action === "resume") return "Start a fresh single-agent job; retained jobs may carry older fan-out contracts.";
    return undefined;
  }
  const options = { ...(input.options ?? {}) };
  if (input.workflow !== undefined || input.tasks !== undefined || input.chain !== undefined || input.parallel !== undefined || input.workflowScript !== undefined || (options.count ?? input.count ?? 1) !== 1) {
    return "Launch one independent background_task per task, up to five concurrently; composite/fan-out launches are disabled in this profile.";
  }
  if (options.maxSubagentSpawnsPerRun !== undefined || input.maxSubagentSpawnsPerRun !== undefined) {
    return "Each background slot permits one child, not nested fan-out.";
  }
  if (input.async !== false) return "Use background_task for background dispatch so task kind, permissions and implementation isolation are applied.";
  options.timeoutMs ??= input.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  input.options = options;
  return undefined;
}
