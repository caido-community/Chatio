<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import Dialog from "primevue/dialog";
import { ref } from "vue";

import { useSDK } from "@/plugins/sdk";
import { useStorage } from "@/services/storage";
import { downloadFile, showToast } from "@/services/utils";

const providers = defineModel<{
  openai: { apiKey: string };
  anthropic: { apiKey: string };
  google: { apiKey: string };
  deepseek: { apiKey: string };
  local: { url: string; models: string; apiKey: string };
}>("providers", { required: true });

const chatSettings = defineModel<{
  maxMessages: number;
  systemPrompt: string;
  autoSave: boolean;
}>("chatSettings", { required: true });

const emit = defineEmits<{
  clearAll: [];
  clearHistory: [];
}>();

const sdk = useSDK();
const storageService = useStorage(sdk);

const showDeleteChatsDialog = ref(false);
const showClearAllDialog = ref(false);

const exportChatHistory = async () => {
  try {
    const chatHistory = await storageService.getChatHistory();
    if (chatHistory !== undefined && chatHistory.length > 0) {
      downloadFile(
        JSON.stringify(chatHistory, undefined, 2),
        `chatio-history-${new Date().toISOString().split("T")[0]}.json`,
        "application/json",
      );
      showToast(sdk, "Chat history exported!", "success");
    } else {
      showToast(sdk, "No chat history to export", "error");
    }
  } catch {
    showToast(sdk, "Failed to export", "error");
  }
};

const exportSettings = async () => {
  try {
    const modelConfigs = await storageService.getModelConfigs();
    const customModels = await storageService.getCustomModels();

    downloadFile(
      JSON.stringify(
        {
          providers: providers.value,
          chatSettings: chatSettings.value,
          modelConfigs,
          customModels,
          version: "2.0.0",
        },
        undefined,
        2,
      ),
      `chatio-settings-${new Date().toISOString().split("T")[0]}.json`,
      "application/json",
    );
    showToast(sdk, "Settings exported!", "success");
  } catch {
    showToast(sdk, "Failed to export", "error");
  }
};

const importSettings = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.style.display = "none";

  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file === undefined) return;

    try {
      const imported = JSON.parse(await file.text());
      if (
        imported.providers === undefined ||
        imported.chatSettings === undefined
      ) {
        showToast(sdk, "Invalid settings file", "error");
        return;
      }
      Object.assign(providers.value, imported.providers);
      Object.assign(chatSettings.value, imported.chatSettings);

      if (imported.modelConfigs !== undefined) {
        await storageService.setModelConfigs(imported.modelConfigs);
      }
      if (imported.customModels !== undefined) {
        await storageService.setCustomModels(imported.customModels);
      }

      showToast(sdk, "Settings imported! Click Save to apply.", "success");

      window.dispatchEvent(new CustomEvent("chatio-settings-updated"));
    } catch {
      showToast(sdk, "Invalid file", "error");
    }
  };

  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
};

const confirmDeleteChats = () => {
  emit("clearHistory");
  showDeleteChatsDialog.value = false;
};

const confirmClearAll = () => {
  emit("clearAll");
  showClearAllDialog.value = false;
};
</script>

<template>
  <Card
    class="h-full"
    :pt="{
      body: { class: 'p-4' },
      content: { class: 'flex flex-col' },
    }"
  >
    <template #content>
      <div class="space-y-4">
        <div class="flex-1">
          <h3 class="text-md font-semibold">Data Management</h3>
          <p class="text-sm text-surface-400">Export and manage your data</p>
        </div>

        <div class="space-y-3">
          <div class="flex gap-2">
            <Button
              label="Export Chat History"
              icon="fas fa-download"
              class="flex-1"
              severity="secondary"
              @click="exportChatHistory"
            />
            <Button
              label="Export Settings"
              icon="fas fa-cog"
              class="flex-1"
              severity="secondary"
              @click="exportSettings"
            />
            <Button
              label="Import Settings"
              icon="fas fa-upload"
              class="flex-1"
              severity="secondary"
              @click="importSettings"
            />
          </div>
          <div class="flex gap-2">
            <Button
              label="Delete All Chats"
              icon="fas fa-comments"
              class="flex-1 bg-primary text-white"
              @click="showDeleteChatsDialog = true"
            />
            <Button
              label="Clear All Data"
              icon="fas fa-trash"
              class="flex-1 bg-primary text-white"
              @click="showClearAllDialog = true"
            />
          </div>
        </div>

        <div
          class="p-3 bg-surface-800 rounded-lg text-xs text-surface-400 flex items-start gap-2"
        >
          <i class="fas fa-info-circle mt-0.5" />
          <span>
            "Delete All Chats" removes chat history for the current project only. "Clear All Data" removes all data across all projects including settings and API keys.
          </span>
        </div>
      </div>
    </template>
  </Card>

  <!-- Delete Chats Dialog -->
  <Dialog
    v-model:visible="showDeleteChatsDialog"
    modal
    header="Delete All Chats"
    :style="{ width: '400px' }"
  >
    <div class="flex items-start gap-3">
      <i class="fas fa-exclamation-triangle text-amber-400 text-xl mt-1" />
      <div>
        <p class="text-surface-300">
          Are you sure you want to delete all chat history for the current project?
        </p>
        <p class="text-sm text-surface-500 mt-2">
          This will only delete chats for this project. Other projects will not be affected. This action cannot be undone.
        </p>
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" text @click="showDeleteChatsDialog = false" />
      <Button
        label="Delete Chats"
        severity="warning"
        @click="confirmDeleteChats"
      />
    </template>
  </Dialog>

  <!-- Clear All Dialog -->
  <Dialog
    v-model:visible="showClearAllDialog"
    modal
    header="Clear All Data"
    :style="{ width: '400px' }"
  >
    <div class="flex items-start gap-3">
      <i class="fas fa-times-circle text-red-400 text-xl mt-1" />
      <div>
        <p class="text-surface-300">Are you sure you want to clear ALL data?</p>
        <p class="text-sm text-surface-500 mt-2">
          This will remove all settings, API keys, and chat history across ALL projects. This action cannot be undone.
        </p>
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" text @click="showClearAllDialog = false" />
      <Button
        label="Clear All Data"
        severity="danger"
        @click="confirmClearAll"
      />
    </template>
  </Dialog>
</template>
