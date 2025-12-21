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

const getReplaySessions = async (
  sdk: SDK,
): Promise<Array<{ id: string; name: string }>> => {
  try {
    // Use GraphQL to fetch collections and ensure we get sessionIds
    const collectionsQuery = `
      query GetCollections {
        replayCollections {
          nodes {
            id
            name
            sessionIds
          }
        }
      }
    `;

    let collections: any[] = [];
    try {
      const result: any = await sdk.graphql.query(collectionsQuery, {});
      collections = result?.replayCollections?.nodes || [];
    } catch (e) {
      sdk.console.error(`[Backend] GraphQL collections query failed: ${e}`);
      // Fallback to SDK method
      collections = await sdk.replay.getCollections();
    }

    // Collect all session IDs from all collections
    const sessionsToFetch: { id: string; collectionName: string }[] = [];

    collections.forEach((c: any) => {
      const collectionName =
        c.name || (typeof c.getName === "function" ? c.getName() : "Unknown");
      const sessionIds =
        c.sessionIds ||
        (typeof c.getSessionIds === "function" ? c.getSessionIds() : []);

      if (Array.isArray(sessionIds)) {
        sessionIds.forEach((sessionId: string) => {
          sessionsToFetch.push({
            id: sessionId,
            collectionName: collectionName,
          });
        });
      }
    });

    if (sessionsToFetch.length === 0) {
      // Fallback: Return collections
      return collections.map((c: any) => ({
        id: c.id || (typeof c.getId === "function" ? c.getId() : "unknown"),
        name: `[Collection] ${c.name || (typeof c.getName === "function" ? c.getName() : "Unknown")}`,
      }));
    }

    // Helper to fetch session details
    const getSessionDetails = async (sessionId: string) => {
      try {
        const query = `
          query GetReplaySession($id: ID!) {
            replaySession(id: $id) {
              id
              name
            }
          }
        `;
        const result: any = await sdk.graphql.query(query, { id: sessionId });
        return result?.replaySession;
      } catch (e) {
        return null;
      }
    };

    // Fetch details for all sessions in parallel
    const sessionDetails = await Promise.all(
      sessionsToFetch.map(async (item) => {
        const details = await getSessionDetails(item.id);
        if (!details) return null;
        return {
          id: details.id,
          name: `${item.collectionName} - ${details.name}`,
        };
      }),
    );

    // Filter out nulls
    const validSessions = sessionDetails.filter((s) => s !== null) as Array<{
      id: string;
      name: string;
    }>;

    return validSessions;
  } catch (error) {
    sdk.console.error("Error getting replay sessions:", error);
    return [];
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
        // DeepSeek currently doesn't support image input in their API
      ],
      local: [
        // Vision-capable local models
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

// Get provider capabilities including image support
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

    // Local providers (Ollama) don't require API keys
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

// Send message to AI provider using Caido's fetch
const sendMessage = async (
  sdk: SDK,
  request: SendMessageRequest,
): Promise<ProviderResponse> => {
  try {
    const { messages, settings } = request;
    const { provider, apiKey, baseUrl, model } = settings;

    sdk.console.log(`🔥 sendMessage called with provider: ${provider}`);

    // Local providers (Ollama) don't require API keys
    if (!apiKey?.trim() && provider !== "local") {
      throw new Error("API key is required");
    }

    sdk.console.log(`🔥 About to call provider function for: ${provider}`);

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

// Quick action execution for instant request modifications - AI POWERED VERSION
const executeQuickActionV2 = async (
  sdk: SDK,
  command: string,
  context?: string,
): Promise<string> => {
  try {
    sdk.console.log(`🚀 AI-POWERED QUICK ACTION CALLED: ${command}`);

    // Get plugin settings from storage
    sdk.console.log(`🔍 About to call sdk.storage.get()`);

    let storageData;
    try {
      storageData = await sdk.storage.get();
      sdk.console.log(
        `🔍 Storage get successful, data:`,
        JSON.stringify(storageData, null, 2),
      );
    } catch (storageError) {
      sdk.console.error(`🔍 Storage get failed:`, storageError);
      throw new Error(
        `Storage access failed: ${storageError instanceof Error ? storageError.message : "Unknown error"}`,
      );
    }

    // Extract provider settings from the nested structure
    let selectedProvider = null;
    let selectedModel = null;
    let providerSettings = null;

    // First, try to get the currently selected module from project-specific storage
    const currentProjectKey = storageData?.projects
      ? Object.keys(storageData.projects)[0]
      : "global";
    const selectedModule =
      storageData?.projects?.[currentProjectKey]?.selectedModule;

    if (selectedModule && selectedModule.provider && selectedModule.model) {
      // Use the specifically selected module
      selectedProvider = selectedModule.provider;
      selectedModel = selectedModule.model;

      // Get the provider config for this selected module
      const providerConfig =
        storageData?.globalSettings?.providers?.[selectedProvider];
      if (providerConfig) {
        const typedConfig = providerConfig as any;
        providerSettings = {
          provider: selectedProvider,
          model: selectedModel,
          apiKey: typedConfig.apiKey,
          baseUrl: typedConfig.baseUrl || "",
          systemPrompt: storageData.globalSettings?.systemPrompt || "",
          maxTokens: storageData.globalSettings?.maxTokens || 2048,
          temperature: storageData.globalSettings?.temperature || 0.7,
        };
      }
    } else if (storageData?.globalSettings?.providers) {
      // Fallback: Find the first configured provider
      const providers = storageData.globalSettings.providers;
      for (const [providerName, config] of Object.entries(providers)) {
        if (config && typeof config === "object") {
          const typedConfig = config as any; // Type assertion for dynamic config
          if (
            typedConfig.apiKey &&
            typedConfig.models &&
            typedConfig.models.length > 0
          ) {
            selectedProvider = providerName;
            selectedModel = typedConfig.models[0]; // Use first available model
            providerSettings = {
              provider: providerName,
              model: selectedModel,
              apiKey: typedConfig.apiKey,
              baseUrl: typedConfig.baseUrl || "",
              systemPrompt: storageData.globalSettings.systemPrompt || "",
              maxTokens: storageData.globalSettings.maxTokens || 2048,
              temperature: storageData.globalSettings.temperature || 0.7,
            };
            break;
          }
        }
      }
    }

    sdk.console.log(
      `🔍 Selected provider: ${selectedProvider}, model: ${selectedModel}`,
    );

    if (!selectedProvider || !selectedModel || !providerSettings) {
      // Fallback to simple pattern matching if AI not configured
      sdk.console.log(`🟡 AI not configured, using fallback pattern matching`);
      const lowerCommand = command.toLowerCase();

      if (lowerCommand.includes("post")) {
        return JSON.stringify({
          action: "change_method",
          method: "POST",
          message: "Changed request method to POST (fallback mode)",
        });
      } else if (lowerCommand.includes("get")) {
        return JSON.stringify({
          action: "change_method",
          method: "GET",
          message: "Changed request method to GET (fallback mode)",
        });
      } else if (lowerCommand.includes("put")) {
        return JSON.stringify({
          action: "change_method",
          method: "PUT",
          message: "Changed request method to PUT (fallback mode)",
        });
      } else if (lowerCommand.includes("delete")) {
        return JSON.stringify({
          action: "change_method",
          method: "DELETE",
          message: "Changed request method to DELETE (fallback mode)",
        });
      } else {
        return JSON.stringify({
          action: "error",
          message:
            'AI provider not configured. Please configure Chatio settings first, or use simple commands like "change method to POST".',
        });
      }
    }

    // Prepare AI prompt for request analysis
    const systemPrompt = `You are ChatU, an expert security testing assistant for HTTP requests. 
Analyze the user's natural language command and return ONLY a JSON response with the appropriate action.

Available actions:
- change_method: Change HTTP method (GET, POST, PUT, DELETE, etc.)
- add_header: Add/update a header
- remove_headers: Remove headers (all or specific ones)
- change_body: Modify request body
- remove_body: Remove request body
- add_param: Add URL parameter
- multiple_actions: For complex operations like request smuggling

For security tests like "request smuggling", "SQL injection", create appropriate headers/body modifications.

ALWAYS respond with valid JSON only. No explanations outside JSON.

Examples:
User: "change method to POST" → {"action":"change_method","method":"POST","message":"Changed to POST"}
User: "add authorization header" → {"action":"add_header","header":"Authorization","value":"Bearer token_here","message":"Added Authorization header"}
User: "apply request smuggling" → {"action":"multiple_actions","actions":[{"action":"add_header","header":"Transfer-Encoding","value":"chunked"},{"action":"add_header","header":"Content-Length","value":"0"}],"message":"Applied request smuggling headers"}

Current request:
${context}

User command: ${command}`;

    // Send to AI for processing
    const aiRequest: SendMessageRequest = {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: command },
      ],
      settings: providerSettings,
    };

    sdk.console.log(
      `Sending request to AI provider: ${providerSettings.provider}`,
    );
    const aiResponse = await sendMessage(sdk, aiRequest);

    if (!aiResponse.content) {
      throw new Error("AI provider returned empty response");
    }

    sdk.console.log(`AI Response: ${aiResponse.content}`);

    // Parse and validate AI response
    try {
      const parsed = JSON.parse(aiResponse.content);

      // Validate the response has required fields
      if (!parsed.action) {
        throw new Error("AI response missing action field");
      }

      return aiResponse.content; // Return the raw JSON from AI
    } catch (parseError) {
      sdk.console.error("Failed to parse AI response:", parseError);
      return JSON.stringify({
        action: "error",
        message: "AI returned invalid response format",
      });
    }
  } catch (error) {
    sdk.console.error("Quick action error:", error);
    return JSON.stringify({
      action: "error",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

// Define the complete API that will be exposed to the frontend
export type API = DefineAPI<{
  debugConnection: typeof debugConnection;

  getCurrentProjectId: typeof getCurrentProjectId;
  getCurrentProject: typeof getCurrentProject;
  getReplaySessions: typeof getReplaySessions;
  getProviders: typeof getProviders;
  getProviderModels: typeof getProviderModels;
  supportsImages: typeof supportsImages;
  getProviderCapabilities: typeof getProviderCapabilities;
  testConnection: typeof testConnection;
  sendMessage: typeof sendMessage;
  getCurrentContext: typeof getCurrentContext;
  executeQuickAction: typeof executeQuickActionV2;
}>;

// Initialize the plugin and register all API functions
export function init(sdk: SDK<API, BackendEvents>) {
  sdk.api.register("debugConnection", debugConnection);

  sdk.api.register("getCurrentProjectId", getCurrentProjectId);
  sdk.api.register("getCurrentProject", getCurrentProject);
  sdk.api.register("getReplaySessions", getReplaySessions);
  sdk.api.register("getProviders", getProviders);
  sdk.api.register("getProviderModels", getProviderModels);
  sdk.api.register("supportsImages", supportsImages);
  sdk.api.register("getProviderCapabilities", getProviderCapabilities);
  sdk.api.register("testConnection", testConnection);
  sdk.api.register("sendMessage", sendMessage);
  sdk.api.register("getCurrentContext", getCurrentContext);
  sdk.api.register("executeQuickAction", executeQuickActionV2);

  // Listen for project changes and notify frontend
  sdk.events.onProjectChange((sdk, project) => {
    const projectId = project?.getId() || null;
    sdk.api.send("chatio:projectChange", projectId);
  });
}
