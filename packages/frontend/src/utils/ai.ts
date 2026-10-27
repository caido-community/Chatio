import type {
  AIUpstreamModel,
  AIUpstreamModelReasoningEffort,
} from "@caido/sdk-frontend";

import type { FrontendSDK } from "@/types";

const LEGACY_PROVIDER_IDS: Record<string, string> = {
  OpenRouter: "openrouter",
  OpenAI: "openai",
  Anthropic: "anthropic",
  Google: "google",
};

const REASONING_EFFORTS: AIUpstreamModelReasoningEffort[] = [
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
];

export function findModel(
  models: AIUpstreamModel[],
  providerId: string,
  modelId: string,
): AIUpstreamModel | undefined {
  const exact = models.find(
    (m) => m.providerId === providerId && m.id === modelId,
  );
  const legacyProviderId = LEGACY_PROVIDER_IDS[providerId];
  if (exact !== undefined || legacyProviderId === undefined) return exact;
  const legacyModelId = modelId.replace(/:thinking$/, "");
  return models.find(
    (m) => m.providerId === legacyProviderId && m.id === legacyModelId,
  );
}

export const resolveModel = (
  models: AIUpstreamModel[],
  providerId: string,
  modelId: string,
) => findModel(models, providerId, modelId) ?? models[0];

function resolveReasoningEffort(model: AIUpstreamModel) {
  if (model.support.reasoning === "UNSUPPORTED") return undefined;
  const efforts = REASONING_EFFORTS.filter(
    (effort) =>
      model.reasoningEfforts.length === 0 ||
      model.reasoningEfforts.includes(effort),
  );
  return (
    efforts.findLast(
      (effort) =>
        REASONING_EFFORTS.indexOf(effort) <=
        REASONING_EFFORTS.indexOf("medium"),
    ) ?? efforts[0]
  );
}

export function createModel(sdk: FrontendSDK, selected: AIUpstreamModel) {
  const model = findModel(
    sdk.ai.getUpstreamModels(),
    selected.providerId,
    selected.id,
  );
  if (model === undefined) {
    throw new Error(
      `Model "${selected.displayName}" is no longer available. Select another model.`,
    );
  }

  const effort = resolveReasoningEffort(model);

  return sdk.ai.createProvider()(model.modelId, {
    reasoning:
      effort === undefined
        ? undefined
        : { kind: "effort", effort, output: "include" },
  });
}
