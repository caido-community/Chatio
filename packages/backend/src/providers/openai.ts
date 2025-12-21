import { fetch, Request as FetchRequest } from "caido:http";
import type { SDK } from "caido:plugin";

import type {
  ApiResponse,
  ProviderResponse,
  SendMessageRequest,
  TestConnectionRequest,
} from "../types";

export interface OpenAIMessage {
  role: "user" | "assistant" | "system";
  content:
    | string
    | Array<{
        type: "text" | "image_url";
        text?: string;
        image_url?: {
          url: string;
          detail?: "low" | "high" | "auto";
        };
      }>;
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface OpenAIResponse {
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

export const OPENAI_MODELS = [
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-4-turbo",
  "gpt-4",
  "gpt-3.5-turbo",
];

export const testOpenAIConnection = async (
  sdk: SDK,
  request: TestConnectionRequest,
): Promise<ApiResponse> => {
  try {
    const url = `${request.baseUrl || "https://api.openai.com/v1"}/models`;

    const fetchRequest = new FetchRequest(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${request.apiKey}`,
        "User-Agent": "Caido-Chatio-Plugin/1.0",
      },
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
        `OpenAI connection failed: HTTP ${response.status} - ${errorData.error?.message || errorText}`,
      );
      return {
        success: false,
        error:
          errorData.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    const availableModels = data.data?.map((model: any) => model.id) || [];

    return {
      success: true,
      message: "OpenAI connection successful!",
      data: {
        availableModels: availableModels.slice(0, 10),
        totalModels: availableModels.length,
      },
    };
  } catch (error) {
    sdk.console.error(`OpenAI connection test failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
};

export const sendOpenAIMessage = async (
  sdk: SDK,
  request: SendMessageRequest,
): Promise<ProviderResponse> => {
  try {
    const { messages, settings } = request;
    const { apiKey, baseUrl, model, maxTokens, temperature, systemPrompt } =
      settings;

    const openaiMessages: OpenAIMessage[] = [];

    if (systemPrompt?.trim()) {
      openaiMessages.push({
        role: "system",
        content: systemPrompt.trim(),
      });
    }

    messages.forEach((msg) => {
      if (
        (msg.role === "user" || msg.role === "assistant") &&
        msg.content?.trim()
      ) {
        if (msg.role === "user" && msg.images && msg.images.length > 0) {
          const contentParts: Array<any> = [];

          if (msg.content.trim()) {
            contentParts.push({
              type: "text",
              text: msg.content.trim(),
            });
          }

          msg.images.forEach((imageUrl: string) => {
            contentParts.push({
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high",
              },
            });
          });

          openaiMessages.push({
            role: msg.role,
            content: contentParts,
          });
        } else {
          openaiMessages.push({
            role: msg.role,
            content: msg.content.trim(),
          });
        }
      }
    });

    if (openaiMessages.length === 0) {
      throw new Error("No valid messages to send to OpenAI");
    }

    const requestBody: OpenAIRequest = {
      model: model || "gpt-4o",
      messages: openaiMessages,
    };

    if (maxTokens && maxTokens > 0) {
      requestBody.max_tokens = maxTokens;
    }
    if (temperature !== undefined && temperature >= 0 && temperature <= 2) {
      requestBody.temperature = temperature;
    }

    const url = `${baseUrl || "https://api.openai.com/v1"}/chat/completions`;

    const fetchRequest = new FetchRequest(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
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
      sdk.console.error(`OpenAI API Error: ${errorMessage}`);

      throw new Error(errorMessage);
    }

    const responseText = await response.text();
    const data: OpenAIResponse = JSON.parse(responseText);

    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response choices returned from OpenAI");
    }

    const choice = data.choices[0];
    const content = choice.message?.content || "";

    if (!content.trim()) {
      throw new Error("Empty response from OpenAI");
    }

    return {
      content: content.trim(),
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
      model: data.model,
      provider: "openai",
    };
  } catch (error) {
    sdk.console.error("OpenAI send message error:", error);
    throw error;
  }
};
