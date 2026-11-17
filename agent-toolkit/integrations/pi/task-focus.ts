import { readFileSync } from "node:fs";

// Keep portable workflows, the lead and isolated workers on one policy text.
// The local adapter is installed from the complete toolkit checkout.
export const TASK_FOCUS_GUIDANCE = readFileSync(new URL("../../standards/task-focus-policy.md", import.meta.url), "utf8").trim();
