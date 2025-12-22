<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import SelectButton from "primevue/selectbutton";
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";

import { ChatSettings } from "./Chat";
import { DataManagement } from "./Data";
import { Providers } from "./Providers";

import { DEFAULT_CHAT_SETTINGS } from "@/constants";
import { useSDK } from "@/plugins/sdk";
import { CaidoStorageService } from "@/services/storage";
import { showToast } from "@/services/utils";

type Tab = "Chat" | "Providers" | "Data";

const activeTab = ref<Tab>("Chat");

const tabs = [
  { label: "Chat", value: "Chat" },
  { label: "Providers", value: "Providers" },
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
      return ChatSettings;
  }
});

const sdk = useSDK();
const storageService = new CaidoStorageService(sdk);
const saving = ref(false);

const providers = reactive({
  openai: { apiKey: "" },
  anthropic: { apiKey: "" },
  google: { apiKey: "" },
  deepseek: { apiKey: "" },
});

const chatSettings = reactive({ ...DEFAULT_CHAT_SETTINGS });

const loadSettings = async () => {
  try {
    const settings = await storageService.getSettings();
    if (settings?.providers) {
      Object.keys(providers).forEach((key) => {
        const providerKey = key as keyof typeof providers;
        if (settings.providers?.[key]) {
          Object.assign(providers[providerKey], settings.providers[key]);
        }
      });
    }
    if (settings?.chatSettings) {
      if (settings.chatSettings.maxMessages) {
        chatSettings.maxMessages = settings.chatSettings.maxMessages;
      }
      if (settings.chatSettings.systemPrompt) {
        chatSettings.systemPrompt = settings.chatSettings.systemPrompt;
      }
      if (typeof settings.chatSettings.autoSave === "boolean") {
        chatSettings.autoSave = settings.chatSettings.autoSave;
      }
    }
  } catch {
    // Keep defaults
  }
};

const saveSettings = async () => {
  saving.value = true;
  try {
    await storageService.setSettings({
      providers,
      chatSettings: {
        maxMessages: chatSettings.maxMessages,
        systemPrompt: chatSettings.systemPrompt,
        autoSave: chatSettings.autoSave,
      },
    });
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
  Object.assign(chatSettings, DEFAULT_CHAT_SETTINGS);
  showToast(sdk, "All data cleared!", "success");
};

const clearChatHistory = async () => {
  await storageService.clearChatHistory();
  showToast(sdk, "Chat history deleted!", "success");
};

onMounted(() => {
  loadSettings();
  const handleProjectChange = async () => await loadSettings();
  window.addEventListener("chatio-project-changed", handleProjectChange);
  onUnmounted(() => {
    window.removeEventListener("chatio-project-changed", handleProjectChange);
  });
});
</script>

<template>
  <div class="h-full flex flex-col gap-1">
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
