import { fetch, Request as FetchRequest } from "caido:http";
import type { SDK } from "caido:plugin";

// Import shared types
import type {
  ApiResponse,
  ProviderResponse,
  SendMessageRequest,
  TestConnectionRequest,
} from "../types";

export interface DeepSeekMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Available DeepSeek models
export const DEEPSEEK_MODELS = ["deepseek-chat", "deepseek-reasoner"];

export const testDeepSeekConnection = async (
  sdk: SDK,
  request: TestConnectionRequest,
): Promise<ApiResponse> => {
  try {
    const url = `${request.baseUrl || "https://api.deepseek.com"}/chat/completions`;

    const testBody: DeepSeekRequest = {
      model: request.model || "deepseek-chat",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 10,
    };

    const fetchRequest = new FetchRequest(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${request.apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "Caido-Chatio-Plugin/1.0",
      },
      body: JSON.stringify(testBody),
    });

    const response = await fetch(fetchRequest);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }

      sdk.console.error(
        `❌ [DeepSeek] Connection failed: HTTP ${response.status} - ${errorData.error?.message || errorText}`,
      );
      return {
        success: false,
        error:
          errorData.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      message: "DeepSeek connection successful!",
      data: {
        model: data.model,
        usage: data.usage,
      },
    };
  } catch (error) {
    sdk.console.error(`❌ [DeepSeek] Connection test failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
};

export const sendDeepSeekMessage = async (
  sdk: SDK,
  request: SendMessageRequest,
): Promise<ProviderResponse> => {
  try {
    const { messages, settings } = request;
    const { apiKey, baseUrl, model, maxTokens, temperature, systemPrompt } =
      settings;

    // Convert messages to DeepSeek format
    const deepseekMessages: DeepSeekMessage[] = [];

    // Add system prompt if provided
    if (systemPrompt?.trim()) {
      deepseekMessages.push({
        role: "system",
        content: systemPrompt.trim(),
      });
    }

    // Add conversation messages
    messages.forEach((msg) => {
      if (
        (msg.role === "user" || msg.role === "assistant") &&
        msg.content?.trim()
      ) {
        deepseekMessages.push({
          role: msg.role,
          content: msg.content.trim(),
        });
      }
    });

    // Ensure we have at least one message
    if (deepseekMessages.length === 0) {
      throw new Error("No valid messages to send to DeepSeek");
    }

    const requestBody: DeepSeekRequest = {
      model: model || "deepseek-chat",
      messages: deepseekMessages,
    };

    // Add optional parameters
    if (maxTokens && maxTokens > 0) {
      requestBody.max_tokens = maxTokens;
    }
    if (temperature !== undefined && temperature >= 0 && temperature <= 2) {
      requestBody.temperature = temperature;
    }

    const url = `${baseUrl || "https://api.deepseek.com"}/chat/completions`;

    const fetchRequest = new FetchRequest(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "Caido-Chatio-Plugin/1.0",
      },
      body: JSON.stringify(requestBody),
    });

    const response = await fetch(fetchRequest);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }

      const errorMessage =
        errorData.error?.message ||
        `HTTP ${response.status}: ${response.statusText}`;
      sdk.console.error(`❌ [DeepSeek] API Error: ${errorMessage}`);

      throw new Error(errorMessage);
    }

    const data: DeepSeekResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response choices returned from DeepSeek");
    }

    const content = data.choices[0].message.content;
    const usage = data.usage;

    return {
      content,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
      },
      model: data.model,
      provider: "deepseek",
    };
  } catch (error) {
    sdk.console.error(`❌ [DeepSeek] Send message failed:`, error);
    throw error;
  }
};
