import { fetch, Request as FetchRequest } from "caido:http";
import type { SDK } from "caido:plugin";

// Import shared types
import type {
  ApiResponse,
  ProviderResponse,
  SendMessageRequest,
  TestConnectionRequest,
} from "../types";

export interface GoogleMessage {
  role: "user" | "model";
  parts: Array<{
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
    };
  }>;
}

export interface GoogleRequest {
  contents: GoogleMessage[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
  systemInstruction?: {
    parts: {
      text: string;
    }[];
  };
}

export interface GoogleResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
      role: string;
    };
    finishReason: string;
    index: number;
  }[];
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

// Available Google models - Updated with latest Gemini models (January 2025)
export const GOOGLE_MODELS = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-8b",
];

export const testGoogleConnection = async (
  sdk: SDK,
  request: TestConnectionRequest,
): Promise<ApiResponse> => {
  try {
    // Test with a simple model list request
    const url = `${request.baseUrl || "https://generativelanguage.googleapis.com"}/v1beta/models?key=${request.apiKey}`;

    const fetchRequest = new FetchRequest(url, {
      method: "GET",
      headers: {
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
        `❌ [Google] Connection failed: HTTP ${response.status} - ${errorData.error?.message || errorText}`,
      );
      return {
        success: false,
        error:
          errorData.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    const availableModels =
      data.models?.map((model: any) => model.name.replace("models/", "")) || [];

    return {
      success: true,
      message: "Google Gemini connection successful!",
      data: {
        availableModels: availableModels.slice(0, 10), // Limit for display
        totalModels: availableModels.length,
      },
    };
  } catch (error) {
    sdk.console.error(`❌ [Google] Connection test failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
};

export const sendGoogleMessage = async (
  sdk: SDK,
  request: SendMessageRequest,
): Promise<ProviderResponse> => {
  try {
    const { messages, settings } = request;
    const { apiKey, baseUrl, model, maxTokens, temperature, systemPrompt } =
      settings;

    // Convert messages to Google format (user -> user, assistant -> model)
    const googleMessages: GoogleMessage[] = [];

    messages.forEach((msg) => {
      if (msg.role === "user" && msg.content?.trim()) {
        const parts: Array<any> = [];

        // Add text content
        if (msg.content.trim()) {
          parts.push({ text: msg.content.trim() });
        }

        // Add images if present
        if (msg.images && msg.images.length > 0) {
          msg.images.forEach((imageUrl: string) => {
            // Convert data URL to inline data format for Gemini
            if (imageUrl.startsWith("data:")) {
              const [mimeTypeWithPrefix, base64Data] = imageUrl.split(",");
              if (mimeTypeWithPrefix && base64Data) {
                const mimeType = mimeTypeWithPrefix
                  .replace("data:", "")
                  .replace(";base64", "");

                parts.push({
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                  },
                });
              }
            }
          });
        }

        googleMessages.push({
          role: "user",
          parts: parts,
        });
      } else if (msg.role === "assistant" && msg.content?.trim()) {
        googleMessages.push({
          role: "model",
          parts: [{ text: msg.content.trim() }],
        });
      }
    });

    // Ensure we have at least one message
    if (googleMessages.length === 0) {
      throw new Error("No valid messages to send to Google Gemini");
    }

    // Build request body exactly as per Google Gemini API documentation
    const requestBody: GoogleRequest = {
      contents: googleMessages,
    };

    // Add generation config if provided
    if (maxTokens || temperature !== undefined) {
      requestBody.generationConfig = {};
      if (maxTokens && maxTokens > 0) {
        requestBody.generationConfig.maxOutputTokens = maxTokens;
      }
      if (temperature !== undefined && temperature >= 0 && temperature <= 2) {
        requestBody.generationConfig.temperature = temperature;
      }
    }

    // Add system instruction if provided (Google's specific requirement)
    if (systemPrompt?.trim()) {
      requestBody.systemInstruction = {
        parts: [{ text: systemPrompt.trim() }],
      };
    }

    const modelName = model || "gemini-2.5-flash";

    const url = `${baseUrl || "https://generativelanguage.googleapis.com"}/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    sdk.console.log(`🤖 [Google] Sending message to ${modelName}`);

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
      sdk.console.error(`❌ [Google] Raw error response: ${errorText}`);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }

      let errorMessage =
        errorData.error?.message ||
        `HTTP ${response.status}: ${response.statusText}`;

      // Handle specific Google API errors with user-friendly messages
      if (response.status === 429) {
        errorMessage =
          "Google API rate limit exceeded. Please try again in a few moments.";
      } else if (response.status === 503) {
        errorMessage =
          "Google Gemini service is temporarily overloaded. Please try again later.";
      } else if (response.status === 403) {
        errorMessage =
          "Invalid API key or insufficient permissions for Google Gemini.";
      } else if (
        response.status === 400 &&
        errorMessage.includes("overloaded")
      ) {
        errorMessage =
          "Google Gemini model is currently overloaded. Please try a different model or wait a few minutes.";
      }

      sdk.console.error(`❌ [Google] API Error: ${errorMessage}`);

      throw new Error(errorMessage);
    }

    const responseText = await response.text();

    const data: GoogleResponse = JSON.parse(responseText);

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response candidates returned from Google Gemini");
    }

    const candidate = data.candidates[0];
    const content = candidate?.content?.parts?.[0]?.text;
    const usage = data.usageMetadata;

    // Enhanced error handling for empty responses
    if (!content || content.trim() === "") {
      // Log the full response for debugging
      sdk.console.error(
        "❌ [Google] Empty response details:",
        JSON.stringify({
          candidates: data.candidates,
          finishReason: candidate?.finishReason,
          safetyRatings: candidate?.safetyRatings,
        }),
      );

      // Check if content was blocked by safety filters
      if (candidate?.finishReason === "SAFETY") {
        throw new Error(
          "Content was blocked by Google Gemini safety filters. Please try rephrasing your request.",
        );
      } else if (candidate?.finishReason === "RECITATION") {
        throw new Error(
          "Content was blocked due to recitation concerns. Please try a different approach.",
        );
      } else if (candidate?.finishReason === "OTHER") {
        throw new Error(
          "Google Gemini stopped generation for an unknown reason. Please try again.",
        );
      } else {
        throw new Error(
          "Google Gemini returned an empty response. Please try rephrasing your request or try again.",
        );
      }
    }

    return {
      content,
      usage: {
        promptTokens: usage.promptTokenCount,
        completionTokens: usage.candidatesTokenCount,
        totalTokens: usage.totalTokenCount,
      },
      model: modelName,
      provider: "google",
    };
  } catch (error) {
    sdk.console.error(`❌ [Google] Send message failed:`, error);
    throw error;
  }
};
