import type { Component } from "vue";

import {
  AnthropicIcon,
  DeepseekIcon,
  GoogleIcon,
  OpenAIIcon,
  OpenRouterIcon,
  XAIIcon,
} from "@/components/icons";

export enum Provider {
  OpenRouter = "OpenRouter",
  OpenAI = "OpenAI",
  Anthropic = "Anthropic",
  Google = "Google",
}

export type ModelCapabilities = {
  reasoning: boolean;
};

export type ModelItem = {
  name: string;
  id: string;
  provider: Provider;
  capabilities: ModelCapabilities;
  contextWindow?: number;
  icon?: Component;
  isCustom?: boolean;
};

export type ModelUserConfig = {
  id: string;
  enabled: boolean;
};

const reasoningDisabledProviders = new Set<Provider>([Provider.OpenAI]);

export const supportsProviderReasoning = (provider: Provider): boolean =>
  !reasoningDisabledProviders.has(provider);

const openAIReasoning = supportsProviderReasoning(Provider.OpenAI);

const openRouterModels: ModelItem[] = [
  {
    name: "GPT 5.6 Luna",
    id: "openai/gpt-5.6-luna",
    provider: Provider.OpenRouter,
    icon: OpenAIIcon,
    contextWindow: 1_050_000,
    capabilities: { reasoning: true },
  },
  {
    name: "GPT 5.6 Terra",
    id: "openai/gpt-5.6-terra",
    provider: Provider.OpenRouter,
    icon: OpenAIIcon,
    contextWindow: 1_050_000,
    capabilities: { reasoning: true },
  },
  {
    name: "GPT 5.6 Sol",
    id: "openai/gpt-5.6-sol",
    provider: Provider.OpenRouter,
    icon: OpenAIIcon,
    contextWindow: 1_050_000,
    capabilities: { reasoning: true },
  },
  {
    name: "GPT 5.5",
    id: "openai/gpt-5.5",
    provider: Provider.OpenRouter,
    icon: OpenAIIcon,
    contextWindow: 1_000_000,
    capabilities: { reasoning: true },
  },
  {
    name: "GPT 5.4",
    id: "openai/gpt-5.4",
    provider: Provider.OpenRouter,
    icon: OpenAIIcon,
    contextWindow: 1_000_000,
    capabilities: { reasoning: true },
  },
  {
    name: "GPT 5.4 Mini",
    id: "openai/gpt-5.4-mini",
    provider: Provider.OpenRouter,
    icon: OpenAIIcon,
    contextWindow: 400_000,
    capabilities: { reasoning: true },
  },
  {
    name: "GPT 5.4 Nano",
    id: "openai/gpt-5.4-nano",
    provider: Provider.OpenRouter,
    icon: OpenAIIcon,
    contextWindow: 400_000,
    capabilities: { reasoning: true },
  },
  {
    name: "GPT 5.3 Codex",
    id: "openai/gpt-5.3-codex",
    provider: Provider.OpenRouter,
    icon: OpenAIIcon,
    capabilities: { reasoning: true },
  },
  {
    name: "Opus 4.8",
    id: "anthropic/claude-opus-4.8",
    provider: Provider.OpenRouter,
    icon: AnthropicIcon,
    contextWindow: 1_000_000,
    capabilities: { reasoning: false },
  },
  {
    name: "Opus 4.8 Thinking",
    id: "anthropic/claude-opus-4.8:thinking",
    provider: Provider.OpenRouter,
    icon: AnthropicIcon,
    contextWindow: 1_000_000,
    capabilities: { reasoning: true },
  },
  {
    name: "Opus 4.7",
    id: "anthropic/claude-opus-4.7",
    provider: Provider.OpenRouter,
    icon: AnthropicIcon,
    contextWindow: 1_000_000,
    capabilities: { reasoning: false },
  },
  {
    name: "Opus 4.7 Thinking",
    id: "anthropic/claude-opus-4.7:thinking",
    provider: Provider.OpenRouter,
    icon: AnthropicIcon,
    contextWindow: 1_000_000,
    capabilities: { reasoning: true },
  },
  {
    name: "Opus 4.6",
    id: "anthropic/claude-opus-4.6",
    provider: Provider.OpenRouter,
    icon: AnthropicIcon,
    contextWindow: 1_000_000,
    capabilities: { reasoning: false },
  },
  {
    name: "Opus 4.6 Thinking",
    id: "anthropic/claude-opus-4.6:thinking",
    provider: Provider.OpenRouter,
    icon: AnthropicIcon,
    contextWindow: 1_000_000,
    capabilities: { reasoning: true },
  },
  {
    name: "Sonnet 4.6",
    id: "anthropic/claude-sonnet-4.6",
    provider: Provider.OpenRouter,
    icon: AnthropicIcon,
    contextWindow: 1_000_000,
    capabilities: { reasoning: false },
  },
  {
    name: "Sonnet 4.6 Thinking",
    id: "anthropic/claude-sonnet-4.6:thinking",
    provider: Provider.OpenRouter,
    icon: AnthropicIcon,
    contextWindow: 1_000_000,
    capabilities: { reasoning: true },
  },
  {
    name: "Gemini 3 Flash",
    id: "google/gemini-3-flash-preview",
    provider: Provider.OpenRouter,
    icon: GoogleIcon,
    capabilities: { reasoning: true },
  },
  {
    name: "Gemini 3.1 Pro",
    id: "google/gemini-3.1-pro-preview-customtools",
    provider: Provider.OpenRouter,
    icon: GoogleIcon,
    capabilities: { reasoning: true },
  },
  {
    name: "Grok 4.5",
    id: "x-ai/grok-4.5",
    provider: Provider.OpenRouter,
    icon: XAIIcon,
    contextWindow: 500_000,
    capabilities: { reasoning: true },
  },
  {
    name: "Mercury 2",
    id: "inception/mercury-2",
    provider: Provider.OpenRouter,
    contextWindow: 128_000,
    capabilities: { reasoning: true },
  },
  {
    name: "DeepSeek V4 Pro",
    id: "deepseek/deepseek-v4-pro",
    provider: Provider.OpenRouter,
    icon: DeepseekIcon,
    contextWindow: 1_000_000,
    capabilities: { reasoning: true },
  },
  {
    name: "DeepSeek V4 Flash",
    id: "deepseek/deepseek-v4-flash",
    provider: Provider.OpenRouter,
    icon: DeepseekIcon,
    contextWindow: 1_000_000,
    capabilities: { reasoning: true },
  },
];

const openAIModels: ModelItem[] = [
  {
    name: "GPT 5.5",
    id: "gpt-5.5",
    provider: Provider.OpenAI,
    icon: OpenAIIcon,
    contextWindow: 1_000_000,
    capabilities: { reasoning: openAIReasoning },
  },
  {
    name: "GPT 5.4",
    id: "gpt-5.4",
    provider: Provider.OpenAI,
    icon: OpenAIIcon,
    contextWindow: 1_000_000,
    capabilities: { reasoning: openAIReasoning },
  },
  {
    name: "GPT 5.4 Mini",
    id: "gpt-5.4-mini",
    provider: Provider.OpenAI,
    icon: OpenAIIcon,
    contextWindow: 400_000,
    capabilities: { reasoning: openAIReasoning },
  },
  {
    name: "GPT 5.4 Nano",
    id: "gpt-5.4-nano",
    provider: Provider.OpenAI,
    icon: OpenAIIcon,
    contextWindow: 400_000,
    capabilities: { reasoning: openAIReasoning },
  },
  {
    name: "GPT 5.3 Codex",
    id: "gpt-5.3-codex",
    provider: Provider.OpenAI,
    icon: OpenAIIcon,
    capabilities: { reasoning: openAIReasoning },
  },
];

const anthropicModels: ModelItem[] = [
  {
    name: "Opus 4.8",
    id: "claude-opus-4-8",
    provider: Provider.Anthropic,
    icon: AnthropicIcon,
    contextWindow: 1_000_000,
    capabilities: { reasoning: true },
  },
  {
    name: "Opus 4.7",
    id: "claude-opus-4-7",
    provider: Provider.Anthropic,
    icon: AnthropicIcon,
    contextWindow: 1_000_000,
    capabilities: { reasoning: true },
  },
  {
    name: "Opus 4.6",
    id: "claude-opus-4-6",
    provider: Provider.Anthropic,
    icon: AnthropicIcon,
    contextWindow: 1_000_000,
    capabilities: { reasoning: true },
  },
  {
    name: "Sonnet 4.6",
    id: "claude-sonnet-4-6",
    provider: Provider.Anthropic,
    icon: AnthropicIcon,
    contextWindow: 1_000_000,
    capabilities: { reasoning: true },
  },
];

const googleModels: ModelItem[] = [
  {
    name: "Gemini 3.1 Pro",
    id: "gemini-3.1-pro-preview-customtools",
    provider: Provider.Google,
    icon: GoogleIcon,
    capabilities: { reasoning: true },
  },
  {
    name: "Gemini 3 Flash",
    id: "gemini-3-flash-preview",
    provider: Provider.Google,
    icon: GoogleIcon,
    capabilities: { reasoning: true },
  },
];

export const defaultModels: ModelItem[] = [
  ...openRouterModels,
  ...openAIModels,
  ...anthropicModels,
  ...googleModels,
];

export const defaultEnabledModels = new Set<string>(defaultModels.map((m) => m.id));

export function getModelById(id: string): ModelItem | undefined {
  return defaultModels.find((m) => m.id === id);
}

export const providers = [
  { id: Provider.OpenRouter, name: "OpenRouter", icon: OpenRouterIcon },
  { id: Provider.OpenAI, name: "OpenAI", icon: OpenAIIcon },
  { id: Provider.Anthropic, name: "Anthropic", icon: AnthropicIcon },
  { id: Provider.Google, name: "Google", icon: GoogleIcon },
];
