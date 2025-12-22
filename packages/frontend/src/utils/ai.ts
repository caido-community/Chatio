import type { LanguageModel } from "ai";

import type { FrontendSDK } from "@/types";

interface AISDK extends FrontendSDK {
  ai: {
    createProvider: () => (modelId: string) => LanguageModel;
  };
}

export function createModel(sdk: FrontendSDK, modelId: string): LanguageModel {
  const provider = (sdk as unknown as AISDK).ai.createProvider();
  return provider(modelId);
}
