import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

type CaptionModel = { api: string; provider: string; baseUrl: string; reasoning: boolean };
const EFFORTS = new Set(["minimal", "low", "medium", "high", "xhigh", "max"]);
const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && [Object.prototype, null].includes(Object.getPrototypeOf(value));

function supportedEndpoint(model: CaptionModel) {
  try {
    const url = new URL(model.baseUrl);
    if (url.username || url.password || url.search || url.hash) return false;
    const path = url.pathname.replace(/\/+$/, "");
    return (model.api === "openai-responses" && model.provider === "openai" && url.origin === "https://api.openai.com" && ["/v1", "/v1/responses"].includes(path))
      || (model.api === "openai-codex-responses" && model.provider === "openai-codex" && url.origin === "https://chatgpt.com" && ["/backend-api", "/backend-api/codex", "/backend-api/codex/responses"].includes(path));
  } catch { return false; }
}

// Pi renders provider-supplied summary text; there is no caption generator to expand.
// Rewrite only an existing automatic summary. Setting an adapter reasoningSummary
// option instead can implicitly select medium effort in the Responses adapter.
export function detailedCaptionPayload(payload: unknown, model?: CaptionModel) {
  if (!model?.reasoning || !supportedEndpoint(model) || !record(payload) || !record(payload.reasoning)) return;
  const reasoning = payload.reasoning;
  if (!EFFORTS.has(reasoning.effort as string) || reasoning.summary !== "auto") return;
  return { ...payload, reasoning: { ...reasoning, summary: "detailed" } };
}

export function registerActivityCaptions(pi: ExtensionAPI, enabled = process.env.PI_TOOLKIT_ACTIVITY_CAPTIONS !== "default") {
  pi.on("before_provider_request", (event, ctx) => {
    if (!enabled || ctx.thinkingLevel === "off") return;
    // Leave inputs, tools, instructions, encrypted content and reasoning effort untouched.
    // No request logging or provider/vendor patching is necessary.
    return detailedCaptionPayload(event.payload, ctx.model);
  });
}
