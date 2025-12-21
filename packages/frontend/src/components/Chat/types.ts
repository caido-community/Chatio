export interface AttachedFile {
  name: string;
  content: string;
  type: string;
  size: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider?: string;
  model?: string;
  status?: string;
  files?: AttachedFile[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
  messageCount: number;
  selectedProvider?: string;
  selectedModel?: string;
  selectedModule?: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  images?: string[];
}

export interface ModelOption {
  model: string;
  displayName: string;
}

export const AVAILABLE_MODELS: Record<string, ModelOption[]> = {
  openai: [
    { model: "gpt-4o", displayName: "GPT-4o" },
    { model: "gpt-4o-mini", displayName: "GPT-4o Mini" },
    { model: "gpt-4-turbo", displayName: "GPT-4 Turbo" },
    { model: "gpt-3.5-turbo", displayName: "GPT-3.5 Turbo" },
  ],
  anthropic: [
    { model: "claude-3-5-sonnet-20241022", displayName: "Claude 3.5 Sonnet" },
    { model: "claude-3-5-haiku-20241022", displayName: "Claude 3.5 Haiku" },
    { model: "claude-3-opus-20240229", displayName: "Claude 3 Opus" },
  ],
  google: [
    { model: "gemini-2.5-pro", displayName: "Gemini 2.5 Pro" },
    { model: "gemini-2.5-flash", displayName: "Gemini 2.5 Flash" },
    { model: "gemini-1.5-flash", displayName: "Gemini 1.5 Flash" },
  ],
  deepseek: [
    { model: "deepseek-chat", displayName: "DeepSeek Chat" },
    { model: "deepseek-reasoner", displayName: "DeepSeek Reasoner" },
  ],
  local: [],
};

export const PROVIDER_ICONS: Record<string, string> = {
  openai: "fas fa-brain",
  anthropic: "fas fa-robot",
  google: "fab fa-google",
  deepseek: "fas fa-microchip",
  local: "fas fa-server",
  assistant: "fas fa-robot",
};

export function getProviderIcon(provider: string): string {
  return PROVIDER_ICONS[provider] ?? "fas fa-robot";
}

export function formatDate(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export function generateChatId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
