import type { AIUpstreamModel } from "@caido/sdk-frontend";
import { type ShallowRef, shallowRef } from "vue";

import type { FrontendSDK } from "@/types";
import { listProviders, type ProviderInfo } from "@/utils/caidoAi";

let registry:
  | {
      models: ShallowRef<AIUpstreamModel[]>;
      providers: ShallowRef<ProviderInfo[]>;
    }
  | undefined;

export const useModels = (sdk: FrontendSDK) => {
  if (registry === undefined) {
    const models = shallowRef(sdk.ai.getUpstreamModels());
    const providers = shallowRef(listProviders(sdk));
    sdk.ai.onUpstreamModelsChange((upstreamModels) => {
      models.value = upstreamModels;
      providers.value = listProviders(sdk);
    });
    registry = { models, providers };
  }
  return registry;
};
