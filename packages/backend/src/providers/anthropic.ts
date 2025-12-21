import { fetch, Request as FetchRequest } from "caido:http";
import type { SDK } from "caido:plugin";

// Import shared types
import type {
  ApiResponse,
  ProviderResponse,
  SendMessageRequest,
  TestConnectionRequest,
} from "../types";

export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnthropicRequest {
  model: string;
  max_tokens: number;
  messages: AnthropicMessage[];
  temperature?: number;
  system?: string;
}

export interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: {
    type: string;
    text: string;
  }[];
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Available Anthropic models
export const ANTHROPIC_MODELS = [
  "claude-3-5-sonnet-20241022",
  "claude-3-5-haiku-20241022",
  "claude-3-opus-20240229",
  "claude-3-sonnet-20240229",
  "claude-3-haiku-20240307",
];

export const testAnthropicConnection = async (
  sdk: SDK,
  request: TestConnectionRequest,
): Promise<ApiResponse> => {
  try {
    const url = `${request.baseUrl || "https://api.anthropic.com"}/v1/messages`;

    const testBody: AnthropicRequest = {
      model: request.model || "claude-3-5-sonnet-20241022",
      max_tokens: 10,
      messages: [{ role: "user", content: "Hi" }],
    };

    const fetchRequest = new FetchRequest(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": request.apiKey,
        "anthropic-version": "2023-06-01",
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
        `❌ [Anthropic] Connection failed: HTTP ${response.status} - ${errorData.error?.message || errorText}`,
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
      message: "Anthropic connection successful!",
      data: {
        model: data.model,
        usage: data.usage,
      },
    };
  } catch (error) {
    sdk.console.error(`❌ [Anthropic] Connection test failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
};

export const sendAnthropicMessage = async (
  sdk: SDK,
  request: SendMessageRequest,
): Promise<ProviderResponse> => {
  try {
    const { messages, settings } = request;
    const { apiKey, baseUrl, model, maxTokens, temperature, systemPrompt } =
      settings;

    // Convert messages to Anthropic format (exclude system messages from messages array)
    const anthropicMessages: AnthropicMessage[] = [];

    messages.forEach((msg) => {
      if (
        (msg.role === "user" || msg.role === "assistant") &&
        msg.content?.trim()
      ) {
        anthropicMessages.push({
          role: msg.role,
          content: msg.content.trim(),
        });
      }
    });

    // Ensure we have at least one message
    if (anthropicMessages.length === 0) {
      throw new Error("No valid messages to send to Anthropic");
    }

    // Build request body exactly as per Anthropic API documentation
    const requestBody: AnthropicRequest = {
      model: model || "claude-3-5-sonnet-20241022",
      max_tokens: maxTokens || 4000,
      messages: anthropicMessages,
    };

    // Add optional parameters
    if (temperature !== undefined && temperature >= 0 && temperature <= 1) {
      requestBody.temperature = temperature;
    }

    // Add system prompt as separate field if provided (Anthropic's specific requirement)
    if (systemPrompt?.trim()) {
      requestBody.system = systemPrompt.trim();
    }

    const url = `${baseUrl || "https://api.anthropic.com"}/v1/messages`;

    const fetchRequest = new FetchRequest(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "User-Agent": "Caido-Chatio-Plugin/1.0",
      },
      body: JSON.stringify(requestBody),
    });

    const response = await fetch(fetchRequest);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      sdk.console.error(`❌ [Anthropic] Raw error response: ${errorText}`);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }

      const errorMessage =
        errorData.error?.message ||
        `HTTP ${response.status}: ${response.statusText}`;
      sdk.console.error(`❌ [Anthropic] API Error: ${errorMessage}`);

      throw new Error(errorMessage);
    }

    const responseText = await response.text();

    const data: AnthropicResponse = JSON.parse(responseText);

    if (!data.content || data.content.length === 0) {
      throw new Error("No response content returned from Anthropic");
    }

    const content = data.content[0].text;
    const usage = data.usage;

    return {
      content,
      usage: {
        promptTokens: usage.input_tokens,
        completionTokens: usage.output_tokens,
        totalTokens: usage.input_tokens + usage.output_tokens,
      },
      model: data.model,
      provider: "anthropic",
    };
  } catch (error) {
    sdk.console.error(`❌ [Anthropic] Send message failed:`, error);
    throw error;
  }
};
