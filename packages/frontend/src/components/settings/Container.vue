<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import SelectButton from "primevue/selectbutton";
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";

import { ChatSettings } from "./Chat";
import { DataManagement } from "./Data";
import { Providers } from "./Providers";

import { useSDK } from "@/plugins/sdk";
import { CaidoStorageService } from "@/services/storage";
import { showToast } from "@/services/utils";

type Tab = "Providers" | "Chat" | "Data";

const activeTab = ref<Tab>("Providers");

const tabs = [
  { label: "Providers", value: "Providers" },
  { label: "Chat", value: "Chat" },
  { label: "Data", value: "Data" },
];

const component = computed(() => {
  switch (activeTab.value) {
    case "Providers":
      return Providers;
    case "Chat":
      return ChatSettings;
    case "Data":
      return DataManagement;
    default:
      return Providers;
  }
});

const sdk = useSDK();
const storageService = new CaidoStorageService(sdk);
const saving = ref(false);

const DEFAULT_SYSTEM_PROMPT = `You are a senior cybersecurity specialist with 20+ years of experience in penetration testing, red team operations, threat hunting, reverse engineering, vulnerability research, bug bounty, and offensive security tooling.

Provide expert-level assistance for fully authorized security testing. Be concise but technically complete. Use step-by-step instructions, commands, and practical techniques. Include detection considerations and alternatives.`;

const providers = reactive({
  openai: { apiKey: "" },
  anthropic: { apiKey: "" },
  google: { apiKey: "" },
  deepseek: { apiKey: "" },
  local: { url: "http://localhost:11434", models: "", apiKey: "" },
});

const chatSettings = reactive({
  maxMessages: 20,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  autoSave: true,
});

const loadSettings = async () => {
  try {
    const settings = await storageService.getSettings();
    if (settings?.providers !== undefined) {
      Object.keys(providers).forEach((key) => {
        const providerKey = key as keyof typeof providers;
        if (settings.providers[key] !== undefined) {
          Object.assign(providers[providerKey], settings.providers[key]);
        }
      });
    }
    if (settings?.chatSettings !== undefined) {
      Object.assign(chatSettings, settings.chatSettings);
    } else if (settings?.systemPrompt !== undefined) {
      chatSettings.systemPrompt = settings.systemPrompt;
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
  }
};

const saveSettings = async () => {
  saving.value = true;
  try {
    const formattedSettings = {
      provider: "",
      model: "",
      apiKey: "",
      baseUrl: "",
      systemPrompt: chatSettings.systemPrompt,
      maxTokens: chatSettings.maxMessages,
      temperature: 0.7,
      providers: providers,
      chatSettings: {
        maxMessages: chatSettings.maxMessages,
        systemPrompt: chatSettings.systemPrompt,
        autoSave: chatSettings.autoSave,
      },
      timestamp: new Date().toISOString(),
    };

    await storageService.setSettings(formattedSettings);
    showToast(sdk, "Settings saved!", "success");
    window.dispatchEvent(new CustomEvent("chatio-settings-updated"));
  } catch {
    showToast(sdk, "Failed to save settings", "error");
  } finally {
    saving.value = false;
  }
};

const clearAllData = async () => {
  await storageService.clearAll();
  Object.assign(providers.openai, { apiKey: "" });
  Object.assign(providers.anthropic, { apiKey: "" });
  Object.assign(providers.google, { apiKey: "" });
  Object.assign(providers.deepseek, { apiKey: "" });
  Object.assign(providers.local, {
    url: "http://localhost:11434",
    models: "",
    apiKey: "",
  });
  chatSettings.maxMessages = 20;
  chatSettings.systemPrompt = DEFAULT_SYSTEM_PROMPT;
  chatSettings.autoSave = true;
  showToast(sdk, "All data cleared!", "success");
};

const clearChatHistory = async () => {
  await storageService.clearChatHistory();
  showToast(sdk, "Chat history deleted!", "success");
};

onMounted(() => {
  loadSettings();
  const handleProjectChange = async () => {
    await loadSettings();
  };
  window.addEventListener("chatio-project-changed", handleProjectChange);
  onUnmounted(() => {
    window.removeEventListener("chatio-project-changed", handleProjectChange);
  });
});
</script>

<template>
  <div class="h-full flex flex-col gap-1">
    <!-- Header -->
    <Card
      class="h-fit"
      :pt="{
        body: { class: 'h-fit p-0 flex flex-col' },
        content: { class: 'h-fit flex flex-col' },
      }"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <div class="p-4">
            <h2 class="text-lg font-semibold">Settings</h2>
            <p class="text-sm text-gray-400">
              Configure Chatio to suit your needs
            </p>
          </div>
          <div class="pr-4">
            <Button
              :label="saving ? 'Saving...' : 'Save Settings'"
              :icon="saving ? 'fas fa-spinner fa-spin' : 'fas fa-save'"
              :loading="saving"
              @click="saveSettings"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Tabs -->
    <Card
      class="h-fit"
      :pt="{
        body: { class: 'h-fit p-0 flex flex-col' },
        content: { class: 'h-fit flex flex-col' },
      }"
    >
      <template #content>
        <div class="px-2 py-1">
          <SelectButton
            v-model="activeTab"
            :options="tabs"
            option-label="label"
            option-value="value"
            class="w-full"
            :allow-empty="false"
          />
        </div>
      </template>
    </Card>

    <!-- Content -->
    <Card
      class="h-full"
      :pt="{
        body: { class: 'h-full p-0 flex flex-col' },
        content: { class: 'h-full flex flex-col' },
      }"
    >
      <template #content>
        <div class="flex-1 min-h-0 overflow-auto">
          <component
            :is="component"
            :providers="providers"
            :chat-settings="chatSettings"
            @clear-all="clearAllData"
            @clear-history="clearChatHistory"
          />
        </div>
      </template>
    </Card>
  </div>
</template>
