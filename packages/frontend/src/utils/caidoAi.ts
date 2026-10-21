import type {
  AIUpstreamProvider,
  AIUpstreamProviderKind,
} from "@caido/sdk-frontend";
import type { Component } from "vue";

import type { FrontendSDK } from "../types";

import {
  AnthropicIcon,
  GoogleIcon,
  OpenAIIcon,
  OpenRouterIcon,
  XAIIcon,
} from "@/components/icons";

export type ProviderInfo = {
  id: string;
  label: string;
  icon: Component | undefined;
};

const PROVIDER_PRESENTATION: Partial<
  Record<AIUpstreamProviderKind, { label: string; icon: Component | undefined }>
> = {
  ANTHROPIC: { label: "Anthropic", icon: AnthropicIcon },
  BEDROCK: { label: "Bedrock", icon: undefined },
  CHATGPT: { label: "ChatGPT", icon: OpenAIIcon },
  GEMINI: { label: "Gemini", icon: GoogleIcon },
  OPENAI: { label: "OpenAI", icon: OpenAIIcon },
  OPENROUTER: { label: "OpenRouter", icon: OpenRouterIcon },
  XAI: { label: "xAI", icon: XAIIcon },
};

function getProviderPresentation(provider: AIUpstreamProvider) {
  if (provider.kind === "XAI" && provider.auth === "OAUTH") {
    return { label: "Grok", icon: XAIIcon };
  }
  return (
    PROVIDER_PRESENTATION[provider.kind] ?? {
      label: provider.id,
      icon: undefined,
    }
  );
}

export function listProviders(sdk: FrontendSDK): ProviderInfo[] {
  const infos = sdk.ai.getUpstreamProviders().map((provider) => ({
    id: provider.id,
    ...getProviderPresentation(provider),
  }));
  return infos.map((info) => ({
    ...info,
    label:
      infos.filter((other) => other.label === info.label).length > 1
        ? `${info.label} (${info.id})`
        : info.label,
  }));
}
