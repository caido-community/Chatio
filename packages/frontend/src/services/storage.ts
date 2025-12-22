import type { ChatSession } from "../components/Chat/types";
import type { ModelItem, ModelUserConfig } from "../stores/models";
import type { FrontendSDK } from "../types";

interface ChatSettings {
  systemPrompt?: string;
  providers?: Record<string, { apiKey?: string }>;
  chatSettings?: {
    maxMessages: number;
    systemPrompt: string;
    autoSave: boolean;
  };
}

interface AppState {
  activeChatId: string;
  selectedProvider?: string;
  selectedModel?: string;
}

interface ProjectStorageData {
  chatHistory?: ChatSession[];
  appState?: AppState;
}

interface GlobalStorageData {
  globalSettings?: {
    providers?: Record<string, { apiKey?: string }>;
    chatSettings?: {
      maxMessages: number;
      systemPrompt: string;
      autoSave: boolean;
    };
    modelConfigs?: Record<string, ModelUserConfig>;
    customModels?: ModelItem[];
  };
  projects?: Record<string, ProjectStorageData>;
}

class CaidoStorageService {
  private sdk: FrontendSDK;
  private cache: GlobalStorageData = {};
  private currentProjectId: string | undefined = undefined;
  private isInitialized = false;

  constructor(sdk: FrontendSDK) {
    this.sdk = sdk;
    this.initializeCache();
    this.setupProjectChangeListener();
  }

  private async initializeCache() {
    try {
      const data = this.sdk.storage.get() as GlobalStorageData | undefined;
      this.cache = data ?? { projects: {}, globalSettings: {} };
      if (this.cache.projects === undefined) this.cache.projects = {};
      if (this.cache.globalSettings === undefined)
        this.cache.globalSettings = {};
      this.currentProjectId = await this.sdk.backend.getCurrentProjectId();
      this.isInitialized = true;
    } catch {
      this.cache = { projects: {}, globalSettings: {} };
      this.isInitialized = true;
    }
  }

  private setupProjectChangeListener() {
    this.sdk.backend.onEvent(
      "chatio:projectChange",
      (projectId: string | undefined) => {
        const oldProjectId = this.currentProjectId;
        this.currentProjectId = projectId;
        
        window.dispatchEvent(
          new CustomEvent("chatio-project-changed", { 
            detail: { 
              projectId,
              oldProjectId 
            } 
          }),
        );
      },
    );
  }

  private getProjectKey(): string {
    return this.currentProjectId ?? "global";
  }

  private getProjectData(): ProjectStorageData {
    const projectKey = this.getProjectKey();
    if (this.cache.projects === undefined) this.cache.projects = {};
    if (this.cache.projects[projectKey] === undefined)
      this.cache.projects[projectKey] = {};
    return this.cache.projects[projectKey];
  }

  private async waitForInitialization() {
    if (!this.isInitialized) {
      await new Promise((resolve) => {
        const check = () => {
          if (this.isInitialized) resolve(undefined);
          else setTimeout(check, 10);
        };
        check();
      });
    }
  }

  async getCurrentProjectId(): Promise<string | undefined> {
    await this.waitForInitialization();
    return this.currentProjectId;
  }

  async getSettings(): Promise<ChatSettings | undefined> {
    await this.waitForInitialization();
    const globalSettings = this.cache.globalSettings;
    if (globalSettings === undefined) return undefined;
    return {
      providers: globalSettings.providers ?? {},
      chatSettings: globalSettings.chatSettings ?? {
        maxMessages: 25,
        systemPrompt: "",
        autoSave: true,
      },
    };
  }

  async setSettings(settings: ChatSettings): Promise<void> {
    await this.waitForInitialization();
    if (this.cache.globalSettings === undefined) this.cache.globalSettings = {};
    this.cache.globalSettings.providers = settings.providers ?? {};
    if (settings.chatSettings !== undefined) {
      this.cache.globalSettings.chatSettings = settings.chatSettings;
    }
    await this.saveToStorage();
  }

  async getChatHistory(): Promise<ChatSession[] | undefined> {
    try {
      await this.waitForInitialization();
      return this.getProjectData().chatHistory ?? [];
    } catch {
      return undefined;
    }
  }

  async setChatHistory(history: ChatSession[]): Promise<void> {
    await this.waitForInitialization();
    this.getProjectData().chatHistory = history;
    await this.saveToStorage();
  }

  async setChatHistoryForProject(projectId: string, history: ChatSession[]): Promise<void> {
    await this.waitForInitialization();
    const projectKey = projectId ?? "global";
    if (this.cache.projects === undefined) this.cache.projects = {};
    if (this.cache.projects[projectKey] === undefined)
      this.cache.projects[projectKey] = {};
    this.cache.projects[projectKey].chatHistory = history;
    await this.saveToStorage();
  }

  async getAppState(): Promise<AppState | undefined> {
    await this.waitForInitialization();
    return this.getProjectData().appState ?? undefined;
  }

  async setAppState(state: AppState): Promise<void> {
    await this.waitForInitialization();
    this.getProjectData().appState = state;
    await this.saveToStorage();
  }

  async clearAll(): Promise<void> {
    await this.waitForInitialization();
    this.cache = { projects: {}, globalSettings: {} };
    await this.saveToStorage();
  }

  async clearChatHistory(): Promise<void> {
    await this.waitForInitialization();
    delete this.getProjectData().chatHistory;
    await this.saveToStorage();
  }

  async clearCurrentProjectData(): Promise<void> {
    await this.waitForInitialization();
    const projectKey = this.getProjectKey();
    if (this.cache.projects?.[projectKey] !== undefined) {
      delete this.cache.projects[projectKey];
    }
    await this.saveToStorage();
  }

  async clearSettings(): Promise<void> {
    await this.waitForInitialization();
    if (this.cache.globalSettings !== undefined) {
      delete this.cache.globalSettings.providers;
      delete this.cache.globalSettings.chatSettings;
      delete this.cache.globalSettings.modelConfigs;
      delete this.cache.globalSettings.customModels;
    }
    await this.saveToStorage();
  }

  async getModelConfigs(): Promise<Record<string, ModelUserConfig>> {
    await this.waitForInitialization();
    return this.cache.globalSettings?.modelConfigs ?? {};
  }

  async setModelConfigs(
    configs: Record<string, ModelUserConfig>,
  ): Promise<void> {
    await this.waitForInitialization();
    if (this.cache.globalSettings === undefined) this.cache.globalSettings = {};
    this.cache.globalSettings.modelConfigs = configs;
    await this.saveToStorage();
  }

  async getCustomModels(): Promise<ModelItem[]> {
    await this.waitForInitialization();
    return this.cache.globalSettings?.customModels ?? [];
  }

  async setCustomModels(models: ModelItem[]): Promise<void> {
    await this.waitForInitialization();
    if (this.cache.globalSettings === undefined) this.cache.globalSettings = {};
    this.cache.globalSettings.customModels = models;
    await this.saveToStorage();
  }

  async getProjectList(): Promise<string[]> {
    await this.waitForInitialization();
    return Object.keys(this.cache.projects ?? {});
  }

  private async saveToStorage(): Promise<void> {
    await this.sdk.storage.set(this.cache as unknown as never);
  }

  onStorageChange(callback: (data: GlobalStorageData) => void): void {
    this.sdk.storage.onChange((newData) => {
      const data = newData as GlobalStorageData;
      this.cache = data ?? { projects: {}, globalSettings: {} };
      callback(data);
    });
  }
}
let storageInstance: CaidoStorageService | undefined = undefined;

export const useStorage = (sdk: FrontendSDK) => {
  if (!storageInstance) {
    storageInstance = new CaidoStorageService(sdk);
  }
  return storageInstance;
};
