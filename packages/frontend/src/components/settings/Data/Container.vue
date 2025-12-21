<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import Dialog from "primevue/dialog";
import { ref } from "vue";

import { useSDK } from "@/plugins/sdk";
import { CaidoStorageService } from "@/services/storage";
import { downloadFile, showToast } from "@/services/utils";

const props = defineProps<{
  providers: {
    openai: { apiKey: string };
    anthropic: { apiKey: string };
    google: { apiKey: string };
    deepseek: { apiKey: string };
    local: { url: string; models: string; apiKey: string };
  };
  chatSettings: {
    maxMessages: number;
    systemPrompt: string;
    autoSave: boolean;
  };
}>();

const emit = defineEmits<{
  clearAll: [];
  clearHistory: [];
}>();

const sdk = useSDK();
const storageService = new CaidoStorageService(sdk);

const showDeleteChatsDialog = ref(false);
const showClearAllDialog = ref(false);

const exportChatHistory = async () => {
  try {
    const chatHistory = await storageService.getChatHistory();
    if (chatHistory !== null && chatHistory.length > 0) {
      downloadFile(
        JSON.stringify(chatHistory, null, 2),
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

const exportSettings = () => {
  try {
    downloadFile(
      JSON.stringify(
        {
          providers: props.providers,
          chatSettings: props.chatSettings,
          version: "1.0.1",
        },
        null,
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
      Object.assign(props.providers, imported.providers);
      Object.assign(props.chatSettings, imported.chatSettings);
      showToast(sdk, "Settings imported! Click Save to apply.", "success");
    } catch {
      showToast(sdk, "Invalid file", "error");
    }
  };

  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
};

const confirmDeleteChats = async () => {
  emit("clearHistory");
  showDeleteChatsDialog.value = false;
};

const confirmClearAll = async () => {
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
          <Button
            label="Export Chat History"
            icon="fas fa-download"
            class="w-full"
            severity="secondary"
            @click="exportChatHistory"
          />
          <Button
            label="Export Settings"
            icon="fas fa-cog"
            class="w-full"
            severity="secondary"
            @click="exportSettings"
          />
          <Button
            label="Import Settings"
            icon="fas fa-upload"
            class="w-full"
            severity="secondary"
            @click="importSettings"
          />
          <Button
            label="Delete All Chats"
            icon="fas fa-comments"
            class="w-full"
            severity="warning"
            @click="showDeleteChatsDialog = true"
          />
          <Button
            label="Clear All Data"
            icon="fas fa-trash"
            class="w-full"
            severity="danger"
            @click="showClearAllDialog = true"
          />
        </div>

        <div
          class="p-3 bg-surface-800 rounded-lg text-xs text-surface-400 flex items-start gap-2"
        >
          <i class="fas fa-info-circle mt-0.5" />
          <span>
            "Delete Chats" removes history only. "Clear All" removes everything
            including API keys.
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
          Are you sure you want to delete all chat history?
        </p>
        <p class="text-sm text-surface-500 mt-2">
          This action cannot be undone.
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
          This will remove all settings, API keys, and chat history. This action
          cannot be undone.
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
