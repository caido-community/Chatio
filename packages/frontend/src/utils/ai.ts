import type { LanguageModelV3 } from "@ai-sdk/provider";
import type { AIUpstreamProviderId } from "@caido/sdk-frontend";

import {
  defaultModels,
  Provider,
  supportsProviderReasoning,
} from "@/stores/models";
import type { FrontendSDK } from "@/types";

type ProviderStatus = {
  id: AIUpstreamProviderId;
  isConfigured: boolean;
};

const providerIdMap: Record<Provider, AIUpstreamProviderId> = {
  [Provider.OpenRouter]: "openrouter",
  [Provider.OpenAI]: "openai",
  [Provider.Anthropic]: "anthropic",
  [Provider.Google]: "google",
};

export function getProviderStatuses(sdk: FrontendSDK): ProviderStatus[] {
  return sdk.ai.getUpstreamProviders().map((provider) => ({
    id: provider.id,
    isConfigured: provider.status === "Ready",
  }));
}

type CreateModelOptions = {
  reasoning?: boolean;
};

export function createModel(
  sdk: FrontendSDK,
  modelId: string,
  options: CreateModelOptions = {},
): LanguageModelV3 {
  const { reasoning = true } = options;

  const modelInfo = defaultModels.find((m) => m.id === modelId);
  const modelProvider = modelInfo?.provider ?? Provider.OpenRouter;

  const isReasoningModel =
    reasoning &&
    (modelInfo?.capabilities.reasoning ?? false) &&
    supportsProviderReasoning(modelProvider);

  const provider = sdk.ai.createProvider();

  const baseModelId = modelId.split(":thinking")[0];
  const modelKey = `${providerIdMap[modelProvider]}/${baseModelId}`;

  return provider(modelKey, {
    ...(isReasoningModel && {
      reasoning: {
        effort: "medium",
      },
    }),
    capabilities: {
      reasoning: isReasoningModel,
      structured_output: true,
    },
  });
}
