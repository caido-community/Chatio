import type { LanguageModelV2 } from "@ai-sdk/provider";

import {
  defaultModels,
  Provider,
  supportsProviderReasoning,
} from "@/stores/models";
import type { FrontendSDK } from "@/types";

type AISDK = FrontendSDK & {
  ai: {
    createProvider: () => (
      modelId: string,
      options?: {
        reasoning?: { effort: string };
        capabilities?: { reasoning: boolean; structured_output: boolean };
      },
    ) => LanguageModelV2;
    getUpstreamProviders: () => Array<{
      id: string;
      status: string;
    }>;
  };
};

type ProviderStatus = {
  id: string;
  isConfigured: boolean;
};

const providerIdMap: Record<Provider, string> = {
  [Provider.OpenRouter]: "openrouter",
  [Provider.OpenAI]: "openai",
  [Provider.Anthropic]: "anthropic",
  [Provider.Google]: "google",
};

export function getProviderStatuses(sdk: FrontendSDK): ProviderStatus[] {
  const aiSdk = sdk as unknown as AISDK;
  if (typeof aiSdk.ai?.getUpstreamProviders !== "function") {
    return [];
  }
  return aiSdk.ai.getUpstreamProviders().map((provider) => ({
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
): LanguageModelV2 {
  const { reasoning = true } = options;

  const modelInfo = defaultModels.find((m) => m.id === modelId);
  const modelProvider = modelInfo?.provider ?? Provider.OpenRouter;

  const isReasoningModel =
    reasoning &&
    (modelInfo?.capabilities.reasoning ?? false) &&
    supportsProviderReasoning(modelProvider);

  const provider = (sdk as unknown as AISDK).ai.createProvider();

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
