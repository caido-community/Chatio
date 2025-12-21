<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from "vue";

import { ImageViewer } from "./Dialogs";
import { Header } from "./Header";
import { History } from "./History";
import { Input } from "./Input";
import { Messages } from "./Messages";
import type { AttachedFile, ChatMessage, ChatSession, Message } from "./types";
import { generateChatId } from "./types";

import { useSDK } from "@/plugins/sdk";
import { CaidoStorageService } from "@/services/storage";
import { showToast } from "@/services/utils";

const sdk = useSDK();
const storageService = new CaidoStorageService(sdk);

const currentChatId = ref("default");
const chatHistory = reactive<ChatSession[]>([]);
const currentMessages = reactive<Message[]>([]);
const currentMessage = ref("");
const attachedFiles = reactive<AttachedFile[]>([]);

const isLoading = ref(false);
const isTyping = ref(false);
const currentStatus = ref("");
const isProjectChanging = ref(false);
const autoSaveEnabled = ref(true);
const showHistory = ref(true);

const editingChatId = ref<string | undefined>(undefined);
const editingTitle = ref("");

const showModelSelector = ref(false);
const selectedProvider = ref("");
const selectedModel = ref("");
const selectedModule = ref("");

const imageModal = reactive({
  show: false,
  images: [] as { name: string; content: string; type: string }[],
  currentIndex: 0,
});

const welcomePrompts = [
  "Analyze this HTTP request for vulnerabilities",
  "Explain common XSS attack vectors",
  "Help me understand IDOR vulnerabilities",
  "Review this API response for security issues",
];

const getCurrentChatTitle = (): string => {
  const chat = chatHistory.find((c) => c.id === currentChatId.value);
  return chat?.title ?? "New Chat";
};

const loadChatHistory = async () => {
  try {
    const history = await storageService.getChatHistory();
    if (history !== null && history.length > 0) {
      chatHistory.splice(0, chatHistory.length, ...history);
    }
  } catch (error) {
    console.error("Failed to load chat history:", error);
  }
};

const loadLastActiveChat = async () => {
  const appState = await storageService.getAppState();
  if (appState?.activeChatId !== undefined && appState.activeChatId !== "") {
    await loadChat(appState.activeChatId);
  } else if (chatHistory.length > 0 && chatHistory[0] !== undefined) {
    await loadChat(chatHistory[0].id);
  }
};

const loadChat = async (chatId: string) => {
  const chat = chatHistory.find((c) => c.id === chatId);
  if (chat !== undefined) {
    currentChatId.value = chat.id;
    currentMessages.splice(0, currentMessages.length, ...chat.messages);

    if (chat.selectedProvider) selectedProvider.value = chat.selectedProvider;
    if (chat.selectedModel) selectedModel.value = chat.selectedModel;
    if (chat.selectedModule) selectedModule.value = chat.selectedModule;
    await saveAppState();
  }
};

const createNewChat = async () => {
  currentChatId.value = generateChatId();
  currentMessages.splice(0, currentMessages.length);
  await saveAppState();
};

const deleteChat = async (chatId: string) => {
  const index = chatHistory.findIndex((c) => c.id === chatId);
  if (index >= 0) {
    chatHistory.splice(index, 1);
    await storageService.setChatHistory(chatHistory);
    if (currentChatId.value === chatId) {
      if (chatHistory.length > 0 && chatHistory[0] !== undefined) {
        await loadChat(chatHistory[0].id);
      } else {
        await createNewChat();
      }
    }
    showToast(sdk, "Chat deleted", "success");
  }
};

const startEditChat = (chatId: string) => {
  const chat = chatHistory.find((c) => c.id === chatId);
  if (chat !== undefined) {
    editingChatId.value = chatId;
    editingTitle.value = chat.title;
  }
};

const saveEditChat = async () => {
  if (editingChatId.value === undefined) return;
  const chat = chatHistory.find((c) => c.id === editingChatId.value);
  if (chat !== undefined && editingTitle.value.trim() !== "") {
    chat.title = editingTitle.value.trim();
    await storageService.setChatHistory(chatHistory);
  }
  editingChatId.value = undefined;
  editingTitle.value = "";
};

const cancelEditChat = () => {
  editingChatId.value = undefined;
  editingTitle.value = "";
};

const saveChatSession = async () => {
  if (currentMessages.length === 0) return;
  const title =
    currentMessages[0]?.content.slice(0, 30) +
    ((currentMessages[0]?.content.length ?? 0) > 30 ? "..." : "");
  const existingIndex = chatHistory.findIndex(
    (c) => c.id === currentChatId.value,
  );
  const session: ChatSession = {
    id: currentChatId.value,
    title:
      existingIndex >= 0 ? (chatHistory[existingIndex]?.title ?? title) : title,
    messages: [...currentMessages],
    timestamp: new Date(),
    messageCount: currentMessages.length,

    selectedProvider: selectedProvider.value || undefined,
    selectedModel: selectedModel.value || undefined,
    selectedModule: selectedModule.value || undefined,
  };
  if (existingIndex >= 0) chatHistory.splice(existingIndex, 1);
  chatHistory.unshift(session);
  await storageService.setChatHistory(chatHistory);
};

const saveAppState = async () => {
  await storageService.setAppState({
    activeChatId: currentChatId.value,
    selectedProvider: selectedProvider.value || undefined,
    selectedModel: selectedModel.value || undefined,
    selectedModule: selectedModule.value || undefined,
  });
};

const exportCurrentChat = () => {
  if (currentMessages.length === 0) {
    showToast(sdk, "No messages to export", "error");
    return;
  }
  const blob = new Blob(
    [
      JSON.stringify(
        { id: currentChatId.value, messages: currentMessages },
        undefined,
        2,
      ),
    ],
    { type: "application/json" },
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `chatio-${currentChatId.value}.json`;
  a.click();
  showToast(sdk, "Chat exported!", "success");
};

const exportAllChats = async () => {
  if (chatHistory.length === 0) {
    showToast(sdk, "No chats to export", "error");
    return;
  }
  const blob = new Blob([JSON.stringify(chatHistory, undefined, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `chatio-all-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  showToast(sdk, "All chats exported!", "success");
};

const handleSelectModel = (
  provider: string,
  model: string,
  displayName: string,
) => {
  selectedProvider.value = provider;
  selectedModel.value = model;
  selectedModule.value = displayName;
};

const handleAttachFiles = async (files: FileList) => {
  for (const file of Array.from(files)) {
    const reader = new FileReader();
    reader.onload = () => {
      attachedFiles.push({
        name: file.name,
        content: reader.result as string,
        type: file.type,
        size: file.size,
      });
    };
    if (file.type.startsWith("image/")) reader.readAsDataURL(file);
    else reader.readAsText(file);
  }
};

const removeFile = (index: number) => {
  attachedFiles.splice(index, 1);
};

const openImageModal = (file: AttachedFile) => {
  const images = attachedFiles
    .filter((f) => f.type.startsWith("image/"))
    .map((f) => ({ name: f.name, content: f.content, type: f.type }));
  const idx = images.findIndex((i) => i.name === file.name);
  imageModal.images = images;
  imageModal.currentIndex = idx >= 0 ? idx : 0;
  imageModal.show = true;
};

const navigateImage = (direction: "prev" | "next") => {
  if (direction === "prev" && imageModal.currentIndex > 0)
    imageModal.currentIndex--;
  else if (
    direction === "next" &&
    imageModal.currentIndex < imageModal.images.length - 1
  )
    imageModal.currentIndex++;
};

const copyMessage = (content: string) => {
  navigator.clipboard.writeText(content);
  showToast(sdk, "Copied!", "success");
};

const deleteMessage = async (index: number) => {
  currentMessages.splice(index, 1);
  await saveChatSession();
};

const handleClickMention = (mentionId: string) => {
  try {
    sdk.navigation.goTo("/replay", { collectionId: mentionId });
  } catch (error) {
    console.error("Failed to navigate to Replay:", error);
    showToast(sdk, "Could not open Replay session", "error");
  }
};

const sendMessage = async () => {
  if (isProjectChanging.value) {
    showToast(sdk, "Please wait for project change to complete", "error");
    return;
  }
  const trimmedMessage = currentMessage.value.trim();
  if (trimmedMessage === "" && attachedFiles.length === 0) return;
  if (selectedProvider.value === "" || selectedModel.value === "") {
    showToast(sdk, "Please select an AI model first", "error");
    showModelSelector.value = true;
    return;
  }

  let messageContent = trimmedMessage;
  if (messageContent === "" && attachedFiles.length > 0)
    messageContent = `Please analyze these ${attachedFiles.length} file(s).`;

  const userMessage: Message = {
    id: Date.now().toString(),
    role: "user",
    content: messageContent,
    timestamp: new Date(),
    files: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
  };
  currentMessages.push(userMessage);
  currentMessage.value = "";
  attachedFiles.splice(0);
  await saveChatSession();

  isLoading.value = true;
  isTyping.value = true;
  currentStatus.value = "Connecting...";

  try {
    const settings = await storageService.getSettings();
    if (settings === null) throw new Error("No AI provider configured.");

    const providerConfig = settings.providers?.[selectedProvider.value];
    const chatSettings = {
      provider: selectedProvider.value,
      model: selectedModel.value,
      apiKey: providerConfig?.apiKey ?? "",
      baseUrl: providerConfig?.baseUrl ?? providerConfig?.url ?? "",
      systemPrompt: settings.chatSettings?.systemPrompt,
      maxMessages: settings.chatSettings?.maxMessages ?? 20,
    };

    const backendMessages: ChatMessage[] = currentMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      images: msg.files
        ?.filter((f) => f.type.startsWith("image/"))
        .map((f) => f.content),
    }));

    currentStatus.value = `Sending to ${selectedModule.value}...`;
    const result = await sdk.backend.chat(chatSettings, backendMessages);

    if (result.success) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.message ?? "",
        timestamp: new Date(),
        provider: selectedProvider.value,
        model: selectedModel.value,
      };
      currentMessages.push(assistantMessage);
      await saveChatSession();
    } else throw new Error(result.error ?? "Unknown error");
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    showToast(sdk, errorMsg, "error");
    currentMessages.push({
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: `Error: ${errorMsg}`,
      timestamp: new Date(),
      status: "error",
    });
  } finally {
    isLoading.value = false;
    isTyping.value = false;
    currentStatus.value = "";
  }
};

const stopGeneration = () => {
  isLoading.value = false;
  isTyping.value = false;
  currentStatus.value = "";
};

onMounted(async () => {
  await loadChatHistory();
  await loadLastActiveChat();
  const settings = await storageService.getSettings();
  autoSaveEnabled.value = settings?.chatSettings?.autoSave ?? true;

  const handleProjectChange = async () => {
    isProjectChanging.value = true;

    if (currentMessages.length > 0) {
      await saveChatSession();
    }

    chatHistory.splice(0, chatHistory.length);
    currentMessages.splice(0, currentMessages.length);
    currentChatId.value = "default";
    selectedProvider.value = "";
    selectedModel.value = "";
    selectedModule.value = "";

    await new Promise((r) => setTimeout(r, 100));
    await loadChatHistory();
    await loadLastActiveChat();
    isProjectChanging.value = false;
  };

  const handleSettingsUpdate = async () => {
    const s = await storageService.getSettings();
    autoSaveEnabled.value = s?.chatSettings?.autoSave ?? true;
  };

  window.addEventListener("chatio-project-changed", handleProjectChange);
  window.addEventListener("chatio-settings-updated", handleSettingsUpdate);

  onUnmounted(() => {
    window.removeEventListener("chatio-project-changed", handleProjectChange);
    window.removeEventListener("chatio-settings-updated", handleSettingsUpdate);
  });
});
</script>

<template>
  <div class="h-full flex gap-1">
    <History
      v-if="showHistory"
      :chat-history="chatHistory"
      :current-chat-id="currentChatId"
      :is-project-changing="isProjectChanging"
      :editing-chat-id="editingChatId"
      :editing-title="editingTitle"
      @load-chat="loadChat"
      @delete-chat="deleteChat"
      @start-edit="startEditChat"
      @save-edit="saveEditChat"
      @cancel-edit="cancelEditChat"
      @export-all="exportAllChats"
      @update-edit-title="editingTitle = $event"
    />

    <div class="flex-1 flex flex-col gap-1 min-w-0">
      <Header
        :title="getCurrentChatTitle()"
        :auto-save-enabled="autoSaveEnabled"
        :show-history="showHistory"
        @new-chat="createNewChat"
        @export="exportCurrentChat"
        @toggle-history="showHistory = !showHistory"
      />

      <Messages
        :messages="currentMessages"
        :is-loading="isLoading"
        :current-status="currentStatus"
        :welcome-prompts="welcomePrompts"
        @select-prompt="
          (p) => {
            currentMessage = p;
            sendMessage();
          }
        "
        @copy-message="copyMessage"
        @delete-message="deleteMessage"
        @click-mention="handleClickMention"
        @open-image="openImageModal"
      />

      <Input
        v-model="currentMessage"
        :attached-files="attachedFiles"
        :is-loading="isLoading"
        :is-typing="isTyping"
        :selected-provider="selectedProvider"
        :selected-model="selectedModel"
        :selected-module="selectedModule"
        @send="sendMessage"
        @stop="stopGeneration"
        @attach-files="handleAttachFiles"
        @remove-file="removeFile"
        @open-image="openImageModal"
        @select-model="handleSelectModel"
      />
    </div>

    <ImageViewer
      v-model:visible="imageModal.show"
      :images="imageModal.images"
      :current-index="imageModal.currentIndex"
      @navigate="navigateImage"
    />
  </div>
</template>
