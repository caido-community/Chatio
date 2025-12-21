import type { FrontendSDK } from "../types";

export interface ChatSettings {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  providers?: any;
  chatSettings?: {
    maxMessages: number;
    systemPrompt: string;
    autoSave: boolean;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  files?: any[];
  images?: string[];
}

export interface AppState {
  activeChatId: string;
  selectedProvider?: string;
  selectedModel?: string;
  selectedModule?: string;
}

export interface ProjectStorageData {
  settings?: ChatSettings;
  chatHistory?: ChatMessage[];
  appState?: AppState;
  theme?: "light" | "dark";
  selectedModule?: any;
}

export interface GlobalStorageData {
  globalSettings?: {
    theme?: "light" | "dark";
    preferences?: any;
    providers?: Record<string, any>;
    apiKeys?: Record<string, string>;
    baseUrls?: Record<string, string>;
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
    chatSettings?: {
      maxMessages: number;
      systemPrompt: string;
      autoSave: boolean;
    };
  };
  projects?: Record<string, ProjectStorageData>;
}

export class CaidoStorageService {
  private sdk: FrontendSDK;
  private cache: GlobalStorageData = {};
  private currentProjectId: string | null = null;
  private isInitialized = false;

  constructor(sdk: FrontendSDK) {
    this.sdk = sdk;
    this.initializeCache();
    this.setupProjectChangeListener();
  }

  private async initializeCache() {
    try {
      const data = (await this.sdk.storage.get()) as GlobalStorageData | null;
      this.cache = data || { projects: {}, globalSettings: {} };

      // Ensure required objects exist
      if (!this.cache.projects) {
        this.cache.projects = {};
      }
      if (!this.cache.globalSettings) {
        this.cache.globalSettings = {};
      }

      // Get current project ID
      this.currentProjectId = await this.sdk.backend.getCurrentProjectId();

      this.isInitialized = true;
    } catch (error) {
      console.error("[Storage] Failed to initialize Caido storage:", error);
      this.cache = { projects: {}, globalSettings: {} };
      this.isInitialized = true;
    }
  }

  private setupProjectChangeListener() {
    this.sdk.backend.onEvent(
      "chatio:projectChange",
      async (projectId: string | null) => {
        this.currentProjectId = projectId;

        window.dispatchEvent(
          new CustomEvent("chatio-project-changed", {
            detail: { projectId },
          }),
        );
      },
    );
  }

  private getProjectKey(): string {
    return this.currentProjectId || "global";
  }

  private getProjectData(): ProjectStorageData {
    const projectKey = this.getProjectKey();
    if (!this.cache.projects) {
      this.cache.projects = {};
    }
    if (!this.cache.projects[projectKey]) {
      this.cache.projects[projectKey] = {};
    }
    return this.cache.projects[projectKey];
  }

  private async waitForInitialization() {
    if (!this.isInitialized) {
      await new Promise((resolve) => {
        const check = () => {
          if (this.isInitialized) {
            resolve(undefined);
          } else {
            setTimeout(check, 10);
          }
        };
        check();
      });
    }
  }

  async getCurrentProjectId(): Promise<string | null> {
    await this.waitForInitialization();
    return this.currentProjectId;
  }

  // GLOBAL SETTINGS (work across all projects)
  async getSettings(): Promise<ChatSettings | null> {
    await this.waitForInitialization();
    const globalSettings = this.cache.globalSettings;
    if (!globalSettings) return null;

    // Convert global settings to ChatSettings format
    const settings = {
      provider: "", // No default provider
      model: "", // No default model
      apiKey: "",
      baseUrl: "",
      systemPrompt: globalSettings.systemPrompt || "",
      maxTokens: globalSettings.maxTokens || 2048,
      temperature: globalSettings.temperature || 0.7,
      providers: globalSettings.providers || {},
      chatSettings: globalSettings.chatSettings || {
        maxMessages: 20,
        systemPrompt: globalSettings.systemPrompt || "",
        autoSave: true,
      },
    } as ChatSettings;

    return settings;
  }

  async setSettings(settings: ChatSettings): Promise<void> {
    await this.waitForInitialization();
    if (!this.cache.globalSettings) {
      this.cache.globalSettings = {};
    }

    // Store settings globally
    this.cache.globalSettings.providers = settings.providers || {};
    this.cache.globalSettings.systemPrompt = settings.systemPrompt;
    this.cache.globalSettings.maxTokens = settings.maxTokens;
    this.cache.globalSettings.temperature = settings.temperature;

    // Store chat settings if provided (for backward compatibility and additional fields)
    if (settings.chatSettings) {
      this.cache.globalSettings.chatSettings = settings.chatSettings;
      // Ensure systemPrompt is also copied from chatSettings if present
      if (settings.chatSettings.systemPrompt) {
        this.cache.globalSettings.systemPrompt =
          settings.chatSettings.systemPrompt;
      }
    }

    await this.saveToStorage();
  }

  // PROJECT-SPECIFIC DATA (chat history, app state, selected module)
  async getChatHistory(): Promise<ChatMessage[] | null> {
    try {
      await this.waitForInitialization();
      const projectData = this.getProjectData();
      return projectData.chatHistory || [];
    } catch (error) {
      console.error("[Storage] Failed to load chat history:", error);
      return null;
    }
  }

  async setChatHistory(history: ChatMessage[]): Promise<void> {
    await this.waitForInitialization();
    const projectData = this.getProjectData();
    projectData.chatHistory = history;
    await this.saveToStorage();
  }

  async getAppState(): Promise<AppState | null> {
    await this.waitForInitialization();
    const projectData = this.getProjectData();
    return projectData.appState || null;
  }

  async setAppState(state: AppState): Promise<void> {
    await this.waitForInitialization();
    const projectData = this.getProjectData();
    projectData.appState = state;
    await this.saveToStorage();
  }

  async getTheme(): Promise<"light" | "dark"> {
    await this.waitForInitialization();
    // Theme is global, not project-specific
    if (!this.cache.globalSettings) {
      this.cache.globalSettings = {};
    }
    return this.cache.globalSettings.theme || "light";
  }

  async setTheme(theme: "light" | "dark"): Promise<void> {
    await this.waitForInitialization();
    if (!this.cache.globalSettings) {
      this.cache.globalSettings = {};
    }
    this.cache.globalSettings.theme = theme;
    await this.saveToStorage();
  }

  async getSelectedModule(): Promise<any | null> {
    await this.waitForInitialization();
    const projectData = this.getProjectData();
    return projectData.selectedModule || null;
  }

  async setSelectedModule(module: any): Promise<void> {
    await this.waitForInitialization();
    const projectData = this.getProjectData();
    projectData.selectedModule = module;
    await this.saveToStorage();
  }

  async clearAll(): Promise<void> {
    await this.waitForInitialization();
    this.cache = { projects: {}, globalSettings: {} };
    await this.saveToStorage();
  }

  async clearChatHistory(): Promise<void> {
    await this.waitForInitialization();
    const projectData = this.getProjectData();
    delete projectData.chatHistory;
    await this.saveToStorage();
  }

  async clearCurrentProjectData(): Promise<void> {
    await this.waitForInitialization();
    const projectKey = this.getProjectKey();
    if (this.cache.projects && this.cache.projects[projectKey]) {
      delete this.cache.projects[projectKey];
    }
    await this.saveToStorage();
  }

  async clearSettings(): Promise<void> {
    await this.waitForInitialization();
    if (this.cache.globalSettings) {
      delete this.cache.globalSettings.providers;
      delete this.cache.globalSettings.systemPrompt;
      delete this.cache.globalSettings.maxTokens;
      delete this.cache.globalSettings.temperature;
    }
    await this.saveToStorage();
  }

  // Get all projects that have data
  async getProjectList(): Promise<string[]> {
    await this.waitForInitialization();
    return Object.keys(this.cache.projects || {});
  }

  private async saveToStorage(): Promise<void> {
    try {
      await this.sdk.storage.set(this.cache);
    } catch (error) {
      console.error("[Storage] Failed to save to Caido storage:", error);
      throw error;
    }
  }

  // Set up listener for storage changes from other instances
  onStorageChange(callback: (data: GlobalStorageData) => void): void {
    this.sdk.storage.onChange((newData) => {
      const data = newData as GlobalStorageData;
      this.cache = data || { projects: {}, globalSettings: {} };
      callback(data);
    });
  }
}
