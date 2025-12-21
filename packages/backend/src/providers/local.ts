import { fetch, Request as FetchRequest } from "caido:http";
import type { SDK } from "caido:plugin";

import type {
  ApiResponse,
  ProviderResponse,
  SendMessageRequest,
  TestConnectionRequest,
} from "../types";

export interface LocalMessage {
  role: "user" | "assistant" | "system";
  content: string;
  images?: string[];
}

export interface LocalRequest {
  model: string;
  messages: LocalMessage[];
  stream?: boolean;
  options?: {
    temperature?: number;
    max_tokens?: number;
  };
}

export interface LocalResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

// Common local models (can be customized by user)
export const LOCAL_MODELS = [
  // Standard LLMs
  "llama3.2",
  "llama3.2:1b",
  "llama3.2:3b",
  "llama3.1",
  "llama3.1:8b",
  "llama3.1:70b",
  "mistral",
  "mistral:7b",
  "codellama",
  "codellama:7b",
  "codellama:13b",
  "phi3",
  "phi3:mini",
  "qwen2.5",
  "qwen2.5:7b",
  // Vision-capable models
  "llava",
  "llava:7b",
  "llava:13b",
  "llava:34b",
  "llama3.2-vision",
  "llama3.2-vision:11b",
  "llama3.2-vision:90b",
  "bakllava",
  "moondream",
  "minicpm-v",
];

export const testLocalConnection = async (
  sdk: SDK,
  request: TestConnectionRequest,
): Promise<ApiResponse> => {
  try {
    // First, test if Ollama server is running
    const url = `${request.baseUrl || "http://localhost:11434"}/api/tags`;

    const fetchRequest = new FetchRequest(url, {
      method: "GET",
      headers: {
        "User-Agent": "Caido-Chatio-Plugin/1.0",
      },
    });

    const response = await fetch(fetchRequest);

    if (!response.ok) {
      sdk.console.error(
        `❌ [Local] Server not accessible: HTTP ${response.status}`,
      );
      return {
        success: false,
        error: `Ollama server not accessible: HTTP ${response.status}. Make sure Ollama is running on ${request.baseUrl || "http://localhost:11434"}`,
      };
    }

    const data = await response.json();
    const availableModels = data.models?.map((model: any) => model.name) || [];

    // If user specified models in settings, test them
    if (request.model && availableModels.length > 0) {
      const testModels = request.model
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);
      const validModels = testModels.filter((model) =>
        availableModels.includes(model),
      );
      const invalidModels = testModels.filter(
        (model) => !availableModels.includes(model),
      );

      return {
        success: true,
        message: `Ollama connection successful! ${validModels.length}/${testModels.length} models available`,
        data: {
          availableModels,
          totalModels: availableModels.length,
          validModels,
          invalidModels,
        },
      };
    }

    return {
      success: true,
      message: "Ollama connection successful!",
      data: {
        availableModels,
        totalModels: availableModels.length,
      },
    };
  } catch (error) {
    sdk.console.error(`❌ [Local] Connection test failed:`, error);
    return {
      success: false,
      error: `Cannot connect to Ollama server: ${error instanceof Error ? error.message : "Unknown error"}. Make sure Ollama is installed and running.`,
    };
  }
};

export const sendLocalMessage = async (
  sdk: SDK,
  request: SendMessageRequest,
): Promise<ProviderResponse> => {
  try {
    const { messages, settings } = request;
    const { baseUrl, model, maxTokens, temperature, systemPrompt } = settings;

    // Convert messages to Local format
    const localMessages: LocalMessage[] = [];

    // Add system prompt if provided
    if (systemPrompt?.trim()) {
      localMessages.push({
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
        const localMessage: LocalMessage = {
          role: msg.role,
          content: msg.content.trim(),
        };

        // Add images if this is a user message and images are present
        if (msg.role === "user" && msg.images && msg.images.length > 0) {
          // Convert data URLs to base64 strings for Ollama
          const imageData = msg.images
            .map((imageUrl: string) => {
              if (imageUrl.startsWith("data:")) {
                // Extract base64 data from data URL
                const parts = imageUrl.split(",");
                const base64Data = parts.length > 1 ? parts[1] : "";
                return base64Data;
              }
              return imageUrl;
            })
            .filter((img): img is string => Boolean(img) && img.length > 0);

          if (imageData.length > 0) {
            localMessage.images = imageData;
          }
        }

        localMessages.push(localMessage);
      }
    });

    // Ensure we have at least one message
    if (localMessages.length === 0) {
      throw new Error("No valid messages to send to Local LLM");
    }

    const requestBody: LocalRequest = {
      model: model || "llama3.2",
      messages: localMessages,
      stream: false,
    };

    // Add options if provided
    if (maxTokens || temperature !== undefined) {
      requestBody.options = {};
      if (maxTokens && maxTokens > 0) {
        requestBody.options.max_tokens = maxTokens;
      }
      if (temperature !== undefined && temperature >= 0 && temperature <= 2) {
        requestBody.options.temperature = temperature;
      }
    }

    const url = `${baseUrl || "http://localhost:11434"}/api/chat`;

    const fetchRequest = new FetchRequest(url, {
      method: "POST",
      headers: {
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
        errorData = { error: errorText };
      }

      const errorMessage =
        errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      sdk.console.error(`❌ [Local] API Error: ${errorMessage}`);

      throw new Error(errorMessage);
    }

    const data: LocalResponse = await response.json();

    if (!data.message || !data.message.content) {
      throw new Error("No response content returned from Local LLM");
    }

    const content = data.message.content;

    // Calculate approximate usage from response metadata
    const promptTokens = data.prompt_eval_count || 0;
    const completionTokens = data.eval_count || 0;
    const totalTokens = promptTokens + completionTokens;

    return {
      content,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens,
      },
      model: data.model,
      provider: "local",
    };
  } catch (error) {
    sdk.console.error(`❌ [Local] Send message failed:`, error);
    throw error;
  }
};
