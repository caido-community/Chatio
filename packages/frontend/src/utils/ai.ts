import type { LanguageModelV2 } from "@ai-sdk/provider";

import { defaultModels, type ModelItem, Provider } from "@/stores/models";
import type { FrontendSDK } from "@/types";

interface AISDK extends FrontendSDK {
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
}

export interface ProviderStatus {
  id: string;
  isConfigured: boolean;
}

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

export function isProviderConfigured(
  sdk: FrontendSDK,
  provider: Provider,
): boolean {
  const statuses = getProviderStatuses(sdk);
  // Map our Provider enum to SDK provider IDs
  const providerIdMap: Record<Provider, string> = {
    [Provider.OpenRouter]: "openrouter",
    [Provider.OpenAI]: "openai",
    [Provider.Anthropic]: "anthropic",
    [Provider.Google]: "google",
  };
  const sdkProviderId = providerIdMap[provider];
  const status = statuses.find((s) => s.id === sdkProviderId);
  return status?.isConfigured ?? false;
}

interface CreateModelOptions {
  reasoning?: boolean;
}

export function createModel(
  sdk: FrontendSDK,
  modelId: string,
  options: CreateModelOptions = {},
): LanguageModelV2 {
  const { reasoning = true } = options;

  const modelInfo = defaultModels.find((m) => m.id === modelId);
  const isReasoningModel = reasoning && (modelInfo?.isReasoningModel ?? false);

  const provider = (sdk as unknown as AISDK).ai.createProvider();

  const providerIdMap: Record<Provider, string> = {
    [Provider.OpenRouter]: "openrouter",
    [Provider.OpenAI]: "openai",
    [Provider.Anthropic]: "anthropic",
    [Provider.Google]: "google",
  };

  const modelProvider = modelInfo?.provider ?? Provider.OpenRouter;
  const providerId = providerIdMap[modelProvider];

  const baseModelId = modelId.split(":thinking")[0];
  const modelKey = `${providerId}/${baseModelId}`;

  const model = provider(modelKey, {
    ...(isReasoningModel && {
      reasoning: {
        effort: "high",
      },
    }),
    capabilities: {
      reasoning: isReasoningModel,
      structured_output: true,
    },
  });

  return model;
}

export function getModelInfo(modelId: string): ModelItem | undefined {
  return defaultModels.find((m) => m.id === modelId);
}
