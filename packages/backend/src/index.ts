import type { DefineAPI, DefineEvents, SDK } from "caido:plugin";

import {
  ANTHROPIC_MODELS,
  sendAnthropicMessage,
  testAnthropicConnection,
} from "./providers/anthropic";
import {
  DEEPSEEK_MODELS,
  sendDeepSeekMessage,
  testDeepSeekConnection,
} from "./providers/deepseek";
import {
  GOOGLE_MODELS,
  sendGoogleMessage,
  testGoogleConnection,
} from "./providers/google";
import {
  LOCAL_MODELS,
  sendLocalMessage,
  testLocalConnection,
} from "./providers/local";
import {
  OPENAI_MODELS,
  sendOpenAIMessage,
  testOpenAIConnection,
} from "./providers/openai";
import type {
  ApiResponse,
  ProviderResponse,
  SendMessageRequest,
  TestConnectionRequest,
} from "./types";

export type BackendEvents = DefineEvents<{
  "chatio:projectChange": (projectId: string | null) => void;
}>;

const debugConnection = async (
  sdk: SDK,
): Promise<{ status: string; timestamp: string; backendActive: boolean }> => {
  try {
    return {
      status: "Backend connected successfully",
      timestamp: new Date().toISOString(),
      backendActive: true,
    };
  } catch (error) {
    sdk.console.error("Debug connection test failed:", error);
    return {
      status: "Backend connection failed",
      timestamp: new Date().toISOString(),
      backendActive: false,
    };
  }
};

const getCurrentProjectId = async (sdk: SDK): Promise<string | null> => {
  try {
    const project = await sdk.projects.getCurrent();
    return project?.getId() || null;
  } catch (error) {
    sdk.console.error("Error getting current project ID:", error);
    return null;
  }
};

const getCurrentProject = async (
  sdk: SDK,
): Promise<{ id: string | null; name: string }> => {
  try {
    const project = await sdk.projects.getCurrent();
    if (project) {
      const projectId = project.getId();
      const projectName = project.getName() || projectId;
      return { id: projectId, name: projectName };
    } else {
      return { id: null, name: "Global" };
    }
  } catch (error) {
    sdk.console.error("Error getting current project:", error);
    return { id: null, name: "Global" };
  }
};



const getProviders = async (sdk: SDK): Promise<string[]> => {
  return ["openai", "anthropic", "google", "deepseek", "local"];
};

const getProviderModels = async (
  sdk: SDK,
  provider: string,
): Promise<string[]> => {
  const models = {
    openai: OPENAI_MODELS,
    anthropic: ANTHROPIC_MODELS,
    google: GOOGLE_MODELS,
    deepseek: DEEPSEEK_MODELS,
    local: LOCAL_MODELS,
  };

  return models[provider as keyof typeof models] || [];
};

const supportsImages = async (
  sdk: SDK,
  provider: string,
  model: string,
): Promise<{ supported: boolean; reason?: string }> => {
  try {
    const imageModels = {
      openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4-vision-preview"],
      anthropic: [
        "claude-3-5-sonnet-20241022",
        "claude-3-5-haiku-20241022",
        "claude-3-opus-20240229",
        "claude-3-sonnet-20240229",
        "claude-3-haiku-20240307",
      ],
      google: [
        "gemini-2.5-pro",
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
        "gemini-1.5-flash-latest",
      ],
      deepseek: [
      ],
      local: [
        "llava",
        "llava:7b",
        "llava:13b",
        "llava:34b",
        "llama3.2-vision",
        "llama3.2-vision:11b",
        "llama3.2-vision:90b",
        "bakllava",
        "moondream",
      ],
    };

    const supportedModels =
      imageModels[provider as keyof typeof imageModels] || [];
    const isSupported = supportedModels.some(
      (supportedModel) =>
        model.toLowerCase().includes(supportedModel.toLowerCase()) ||
        supportedModel.toLowerCase().includes(model.toLowerCase()),
    );

    if (!isSupported) {
      const reasons = {
        openai:
          "Only GPT-4 vision models support images. Try gpt-4o or gpt-4o-mini.",
        anthropic: "All Claude 3+ models support images.",
        google:
          "Gemini 2.5 and 1.5 models support images and multimodal inputs.",
        deepseek: "DeepSeek models do not currently support image input.",
        local:
          "Try vision-capable models like llava, llama3.2-vision, or bakllava.",
      };

      return {
        supported: false,
        reason:
          reasons[provider as keyof typeof reasons] ||
          "This model does not support image input.",
      };
    }

    return { supported: true };
  } catch (error) {
    sdk.console.error("Error checking image support:", error);
    return {
      supported: false,
      reason: "Unable to verify image support for this model.",
    };
  }
};

const getProviderCapabilities = async (
  sdk: SDK,
  provider: string,
): Promise<{
  supportsImages: boolean;
  imageModels: string[];
  allModels: string[];
}> => {
  try {
    const imageModels = {
      openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4-vision-preview"],
      anthropic: [
        "claude-3-5-sonnet-20241022",
        "claude-3-5-haiku-20241022",
        "claude-3-opus-20240229",
        "claude-3-sonnet-20240229",
        "claude-3-haiku-20240307",
      ],
      google: [
        "gemini-2.5-pro",
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
        "gemini-1.5-flash-latest",
      ],
      deepseek: [],
      local: [
        "llava",
        "llava:7b",
        "llava:13b",
        "llava:34b",
        "llama3.2-vision",
        "llama3.2-vision:11b",
        "llama3.2-vision:90b",
        "bakllava",
        "moondream",
      ],
    };

    const allModels = await getProviderModels(sdk, provider);
    const supportedImageModels =
      imageModels[provider as keyof typeof imageModels] || [];

    return {
      supportsImages: supportedImageModels.length > 0,
      imageModels: supportedImageModels,
      allModels,
    };
  } catch (error) {
    sdk.console.error("Error getting provider capabilities:", error);
    return {
      supportsImages: false,
      imageModels: [],
      allModels: [],
    };
  }
};

const getCurrentContext = async (
  sdk: SDK,
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const project = await getCurrentProject(sdk);

    const context = {
      timestamp: new Date().toISOString(),
      project: project,
      note: "User is working in Caido security testing tool. Provide security-focused assistance.",
    };

    return { success: true, data: context };
  } catch (error) {
    sdk.console.error("Error getting context:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

const testConnection = async (
  sdk: SDK,
  request: TestConnectionRequest & { provider: string },
): Promise<ApiResponse> => {
  try {
    const { provider, apiKey, baseUrl } = request;

    if (!apiKey?.trim() && provider !== "local") {
      return {
        success: false,
        error: "API key is required",
        message: "Please provide a valid API key",
      };
    }

    switch (provider) {
      case "openai":
        return await testOpenAIConnection(sdk, request);
      case "anthropic":
        return await testAnthropicConnection(sdk, request);
      case "google":
        return await testGoogleConnection(sdk, request);
      case "deepseek":
        return await testDeepSeekConnection(sdk, request);
      case "local":
        return await testLocalConnection(sdk, request);
      default:
        return {
          success: false,
          error: `Unsupported provider: ${provider}`,
        };
    }
  } catch (error) {
    sdk.console.error(`Connection test error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Connection test failed",
    };
  }
};

const sendMessage = async (
  sdk: SDK,
  request: SendMessageRequest,
): Promise<ProviderResponse> => {
  try {
    const { messages, settings } = request;
    const { provider, apiKey, baseUrl, model } = settings;

    if (!apiKey?.trim() && provider !== "local") {
      throw new Error("API key is required");
    }

    switch (provider) {
      case "openai":
        return await sendOpenAIMessage(sdk, request);
      case "anthropic":
        return await sendAnthropicMessage(sdk, request);
      case "google":
        return await sendGoogleMessage(sdk, request);
      case "deepseek":
        return await sendDeepSeekMessage(sdk, request);
      case "local":
        return await sendLocalMessage(sdk, request);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    sdk.console.error(`Send message error:`, error);
    throw error;
  }
};

export type API = DefineAPI<{
  debugConnection: typeof debugConnection;

  getCurrentProjectId: typeof getCurrentProjectId;
  getCurrentProject: typeof getCurrentProject;
  getProviders: typeof getProviders;
  getProviderModels: typeof getProviderModels;
  supportsImages: typeof supportsImages;
  getProviderCapabilities: typeof getProviderCapabilities;
  testConnection: typeof testConnection;
  sendMessage: typeof sendMessage;
  getCurrentContext: typeof getCurrentContext;
}>;

export function init(sdk: SDK<API, BackendEvents>) {
  sdk.api.register("debugConnection", debugConnection);

  sdk.api.register("getCurrentProjectId", getCurrentProjectId);
  sdk.api.register("getCurrentProject", getCurrentProject);
  sdk.api.register("getProviders", getProviders);
  sdk.api.register("getProviderModels", getProviderModels);
  sdk.api.register("supportsImages", supportsImages);
  sdk.api.register("getProviderCapabilities", getProviderCapabilities);
  sdk.api.register("testConnection", testConnection);
  sdk.api.register("sendMessage", sendMessage);
  sdk.api.register("getCurrentContext", getCurrentContext);

  sdk.events.onProjectChange((sdk, project) => {
    const projectId = project?.getId() || null;
    sdk.api.send("chatio:projectChange", projectId);
  });
}
