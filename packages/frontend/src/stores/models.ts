import type { Component } from "vue";

import {
  AnthropicIcon,
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

export interface ModelItem {
  name: string;
  id: string;
  provider: Provider;
  icon?: Component;
  isCustom?: boolean;
  isReasoningModel?: boolean;
}

export interface ModelUserConfig {
  id: string;
  enabled: boolean;
}

const openRouterModels: ModelItem[] = [
  {
    name: "Opus 4.5",
    id: "anthropic/claude-opus-4.5",
    provider: Provider.OpenRouter,
    icon: AnthropicIcon,
  },
  {
    name: "Opus 4.5",
    id: "anthropic/claude-opus-4.5:thinking",
    provider: Provider.OpenRouter,
    icon: AnthropicIcon,
    isReasoningModel: true,
  },
  {
    name: "Sonnet 4.5",
    id: "anthropic/claude-sonnet-4.5",
    provider: Provider.OpenRouter,
    icon: AnthropicIcon,
  },
  {
    name: "Sonnet 4.5",
    id: "anthropic/claude-sonnet-4.5:thinking",
    provider: Provider.OpenRouter,
    icon: AnthropicIcon,
    isReasoningModel: true,
  },
  {
    name: "Gemini 3 Flash",
    id: "google/gemini-3-flash-preview",
    provider: Provider.OpenRouter,
    icon: GoogleIcon,
  },
  {
    name: "Gemini 3 Flash",
    id: "google/gemini-3-flash-preview:thinking",
    provider: Provider.OpenRouter,
    icon: GoogleIcon,
    isReasoningModel: true,
  },
  {
    name: "Gemini 3 Pro",
    id: "google/gemini-3-pro-preview",
    provider: Provider.OpenRouter,
    icon: GoogleIcon,
  },
  {
    name: "GPT 5.2",
    id: "openai/gpt-5.2",
    provider: Provider.OpenRouter,
    icon: OpenAIIcon,
  },
  {
    name: "GPT 5.1",
    id: "openai/gpt-5.1",
    provider: Provider.OpenRouter,
    icon: OpenAIIcon,
  },
  {
    name: "GPT 4.1",
    id: "openai/gpt-4.1",
    provider: Provider.OpenRouter,
    icon: OpenAIIcon,
  },
  {
    name: "Grok 4.1 Fast",
    id: "x-ai/grok-4.1-fast",
    provider: Provider.OpenRouter,
    icon: XAIIcon,
  },
];

const openAIModels: ModelItem[] = [
  {
    name: "GPT-4o",
    id: "openai/gpt-4o",
    provider: Provider.OpenAI,
    icon: OpenAIIcon,
  },
  {
    name: "GPT-4.1",
    id: "openai/gpt-4.1",
    provider: Provider.OpenAI,
    icon: OpenAIIcon,
  },
  {
    name: "GPT-5.1",
    id: "openai/gpt-5.1",
    provider: Provider.OpenAI,
    icon: OpenAIIcon,
    isReasoningModel: true,
  },
];

const anthropicModels: ModelItem[] = [
  {
    name: "Sonnet 4.5",
    id: "anthropic/claude-sonnet-4-5-20250929",
    provider: Provider.Anthropic,
    icon: AnthropicIcon,
    isReasoningModel: true,
  },
  {
    name: "Sonnet 4",
    id: "anthropic/claude-sonnet-4-20250514",
    provider: Provider.Anthropic,
    icon: AnthropicIcon,
    isReasoningModel: true,
  },
  {
    name: "Sonnet 3.7",
    id: "anthropic/claude-3-7-sonnet-20250219",
    provider: Provider.Anthropic,
    icon: AnthropicIcon,
    isReasoningModel: true,
  },
  {
    name: "Opus 4.1",
    id: "anthropic/claude-opus-4-1-20250805",
    provider: Provider.Anthropic,
    icon: AnthropicIcon,
    isReasoningModel: true,
  },
  {
    name: "Opus 4",
    id: "anthropic/claude-opus-4-20250514",
    provider: Provider.Anthropic,
    icon: AnthropicIcon,
    isReasoningModel: true,
  },
  {
    name: "Haiku 3.5",
    id: "anthropic/claude-3-5-haiku-20241022",
    provider: Provider.Anthropic,
    icon: AnthropicIcon,
  },
];

const googleModels: ModelItem[] = [
  {
    name: "Gemini 3 Pro",
    id: "google/gemini-3-pro-preview",
    provider: Provider.Google,
    icon: GoogleIcon,
    isReasoningModel: true,
  },
  {
    name: "Gemini 2.5 Pro",
    id: "google/gemini-2.5-pro",
    provider: Provider.Google,
    icon: GoogleIcon,
    isReasoningModel: true,
  },
  {
    name: "Gemini 2.5 Flash",
    id: "google/gemini-2.5-flash",
    provider: Provider.Google,
    icon: GoogleIcon,
    isReasoningModel: true,
  },
];

export const defaultModels: ModelItem[] = [
  ...openRouterModels,
  ...openAIModels,
  ...anthropicModels,
  ...googleModels,
];

export const defaultEnabledModels = new Set<string>(
  defaultModels.map((m) => m.id),
);

export function getModelById(id: string): ModelItem | undefined {
  return defaultModels.find((m) => m.id === id);
}

export const providers = [
  { id: Provider.OpenRouter, name: "OpenRouter", icon: OpenRouterIcon },
  { id: Provider.OpenAI, name: "OpenAI", icon: OpenAIIcon },
  { id: Provider.Anthropic, name: "Anthropic", icon: AnthropicIcon },
  { id: Provider.Google, name: "Google", icon: GoogleIcon },
];
