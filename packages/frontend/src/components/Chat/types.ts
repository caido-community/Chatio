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

// Unused types removed

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
