export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  files?: FileAttachment[];
  images?: string[];
}

export interface FileAttachment {
  name: string;
  type: string;
  content: string;
  size?: number;
}

export interface ChatSettings {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface ProviderResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  provider?: string;
}

export interface TestConnectionRequest {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface SendMessageRequest {
  messages: any[];
  settings: {
    provider: string;
    model: string;
    apiKey: string;
    baseUrl?: string;
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
  };
}
