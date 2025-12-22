import type { Component } from "vue";

import {
  AnthropicIcon,
  DeepseekIcon,
  GoogleIcon,
  OpenAIIcon,
  OpenRouterIcon,
  QwenIcon,
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
}

const openRouterModels: ModelItem[] = [
  {
    name: "Sonnet 4.5",
    id: "openrouter/anthropic/claude-sonnet-4.5",
    provider: Provider.OpenRouter,
    icon: AnthropicIcon,
  },
  {
    name: "Sonnet 4",
    id: "openrouter/anthropic/claude-sonnet-4",
    provider: Provider.OpenRouter,
    icon: AnthropicIcon,
  },
  {
    name: "Sonnet 3.7",
    id: "openrouter/anthropic/claude-3.7-sonnet",
    provider: Provider.OpenRouter,
    icon: AnthropicIcon,
  },
  {
    name: "Opus 4",
    id: "openrouter/anthropic/claude-opus-4",
    provider: Provider.OpenRouter,
    icon: AnthropicIcon,
  },
  {
    name: "GPT-5.1",
    id: "openrouter/openai/gpt-5.1",
    provider: Provider.OpenRouter,
    icon: OpenAIIcon,
  },
  {
    name: "GPT-5",
    id: "openrouter/openai/gpt-5",
    provider: Provider.OpenRouter,
    icon: OpenAIIcon,
  },
  {
    name: "GPT-5 mini",
    id: "openrouter/openai/gpt-5-mini",
    provider: Provider.OpenRouter,
    icon: OpenAIIcon,
  },
  {
    name: "GPT-4.1",
    id: "openrouter/openai/gpt-4.1",
    provider: Provider.OpenRouter,
    icon: OpenAIIcon,
  },
  {
    name: "Gemini 3 Pro",
    id: "openrouter/google/gemini-3-pro-preview",
    provider: Provider.OpenRouter,
    icon: GoogleIcon,
  },
  {
    name: "Gemini 2.5 Pro",
    id: "openrouter/google/gemini-2.5-pro",
    provider: Provider.OpenRouter,
    icon: GoogleIcon,
  },
  {
    name: "Gemini 2.5 Flash",
    id: "openrouter/google/gemini-2.5-flash",
    provider: Provider.OpenRouter,
    icon: GoogleIcon,
  },
  {
    name: "Grok 4 Fast",
    id: "openrouter/x-ai/grok-4-fast",
    provider: Provider.OpenRouter,
    icon: XAIIcon,
  },
  {
    name: "Grok Code",
    id: "openrouter/x-ai/grok-code-fast-1",
    provider: Provider.OpenRouter,
    icon: XAIIcon,
  },
  {
    name: "DeepSeek R1",
    id: "openrouter/deepseek/deepseek-r1-0528",
    provider: Provider.OpenRouter,
    icon: DeepseekIcon,
  },
  {
    name: "DeepSeek V3",
    id: "openrouter/deepseek/deepseek-chat-v3-0324",
    provider: Provider.OpenRouter,
    icon: DeepseekIcon,
  },
  {
    name: "Kimi K2",
    id: "openrouter/moonshotai/kimi-k2-thinking",
    provider: Provider.OpenRouter,
    icon: DeepseekIcon,
  },
  {
    name: "Qwen3 Coder",
    id: "openrouter/qwen/qwen3-coder",
    provider: Provider.OpenRouter,
    icon: QwenIcon,
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
  },
];

const anthropicModels: ModelItem[] = [
  {
    name: "Sonnet 4.5",
    id: "anthropic/claude-sonnet-4-5-20250929",
    provider: Provider.Anthropic,
    icon: AnthropicIcon,
  },
  {
    name: "Sonnet 4",
    id: "anthropic/claude-sonnet-4-20250514",
    provider: Provider.Anthropic,
    icon: AnthropicIcon,
  },
  {
    name: "Sonnet 3.7",
    id: "anthropic/claude-3-7-sonnet-20250219",
    provider: Provider.Anthropic,
    icon: AnthropicIcon,
  },
  {
    name: "Opus 4.1",
    id: "anthropic/claude-opus-4-1-20250805",
    provider: Provider.Anthropic,
    icon: AnthropicIcon,
  },
  {
    name: "Opus 4",
    id: "anthropic/claude-opus-4-20250514",
    provider: Provider.Anthropic,
    icon: AnthropicIcon,
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
  },
  {
    name: "Gemini 2.5 Pro",
    id: "google/gemini-2.5-pro",
    provider: Provider.Google,
    icon: GoogleIcon,
  },
  {
    name: "Gemini 2.5 Flash",
    id: "google/gemini-2.5-flash",
    provider: Provider.Google,
    icon: GoogleIcon,
  },
];

export const allModels: ModelItem[] = [
  ...openRouterModels,
  ...openAIModels,
  ...anthropicModels,
  ...googleModels,
];

export function getModelById(id: string): ModelItem | undefined {
  return allModels.find((m) => m.id === id);
}

export const providers = [
  { id: Provider.OpenRouter, name: "OpenRouter", icon: OpenRouterIcon },
  { id: Provider.OpenAI, name: "OpenAI", icon: OpenAIIcon },
  { id: Provider.Anthropic, name: "Anthropic", icon: AnthropicIcon },
  { id: Provider.Google, name: "Google", icon: GoogleIcon },
];
