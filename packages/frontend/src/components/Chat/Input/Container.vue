<script setup lang="ts">
import Button from "primevue/button";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

import type { AttachedFile } from "../types";

import ModelSelector from "./ModelSelector.vue";

import { useSDK } from "@/plugins/sdk";
import { useStorage } from "@/services/storage";
import {
  defaultEnabledModels,
  defaultModels,
  type ModelItem,
  type ModelUserConfig,
  Provider,
} from "@/stores/models";

interface ReplaySession {
  id: string;
  name: string;
}

const {
  modelValue,
  attachedFiles,
  isLoading,
  selectedProvider,
  selectedModel,
} = defineProps<{
  modelValue: string;
  attachedFiles: AttachedFile[];
  isLoading: boolean;
  selectedProvider: string;
  selectedModel: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  send: [];
  stop: [];
  attachFiles: [files: FileList];
  removeFile: [index: number];
  openImage: [file: AttachedFile];
  selectModel: [provider: string, model: string, displayName: string];
}>();

const sdk = useSDK();
const storageService = useStorage(sdk);
const fileInputRef = ref<HTMLInputElement>();
const textareaRef = ref<HTMLTextAreaElement>();
const isDragOver = ref(false);

const showMentions = ref(false);
const replaySessions = ref<ReplaySession[]>([]);
const mentionQuery = ref("");
const selectedMentionIndex = ref(0);

const models = ref<ModelItem[]>([]);
const modelConfigs = ref<Record<string, ModelUserConfig>>({});
const customModels = ref<ModelItem[]>([]);
const selectedModelId = ref("");
const localSelectedProvider = ref<Provider>(Provider.OpenRouter);

const filteredSessions = computed(() => {
  if (mentionQuery.value === "") return replaySessions.value;
  const query = mentionQuery.value.toLowerCase();
  return replaySessions.value.filter((s) =>
    s.name.toLowerCase().includes(query),
  );
});

const loadReplaySessions = () => {
  try {
    const sessions = sdk.replay.getSessions();
    replaySessions.value = sessions;
  } catch {
    // Silent fail
  }
};

const loadModels = async () => {
  const settings = await storageService.getAppState();
  const savedProvider = settings?.selectedProvider;
  const savedModel = settings?.selectedModel;

  modelConfigs.value = await storageService.getModelConfigs();
  customModels.value = await storageService.getCustomModels();

  const allModels = [...defaultModels, ...customModels.value];

  const getEnabledModels = (provider: Provider): ModelItem[] => {
    return allModels.filter((m) => {
      if (m.provider !== provider) return false;
      const config = modelConfigs.value[m.id];
      return config !== undefined
        ? config.enabled
        : defaultEnabledModels.has(m.id);
    });
  };

  if (
    savedProvider !== undefined &&
    Object.values(Provider as Record<string, string>).includes(savedProvider)
  ) {
    localSelectedProvider.value = savedProvider as Provider;
  }

  models.value = getEnabledModels(localSelectedProvider.value);

  if (
    savedModel !== undefined &&
    models.value.find((m) => m.id === savedModel)
  ) {
    selectedModelId.value = savedModel;
    const model = models.value.find((m) => m.id === savedModel);
    if (model) {
      emit("selectModel", model.provider, model.id, model.name);
    }
  } else if (selectedModel !== "") {
    selectedModelId.value = selectedModel;
    let model = models.value.find((m) => m.id === selectedModel);
    if (!model) {
      model = allModels.find((m) => m.id === selectedModel);
      if (model && model.provider !== localSelectedProvider.value) {
        localSelectedProvider.value = model.provider;
        models.value = getEnabledModelsForProvider(model.provider);
      }
    }
    if (model) {
      emit("selectModel", model.provider, model.id, model.name);
    }
  } else if (models.value.length > 0 && models.value[0]) {
    selectedModelId.value = models.value[0].id;
    emit(
      "selectModel",
      models.value[0].provider,
      models.value[0].id,
      models.value[0].name,
    );
  }
};

const getEnabledModelsForProvider = (provider: Provider): ModelItem[] => {
  const allModels = [...defaultModels, ...customModels.value];
  return allModels.filter((m) => {
    if (m.provider !== provider) return false;
    const config = modelConfigs.value[m.id];
    return config !== undefined
      ? config.enabled
      : defaultEnabledModels.has(m.id);
  });
};

const handleModelSelect = async (
  provider: string,
  modelId: string,
  modelName: string,
) => {
  selectedModelId.value = modelId;
  localSelectedProvider.value = provider as Provider;
  emit("selectModel", provider, modelId, modelName);

  await storageService.setAppState({
    activeChatId: "",
    selectedProvider: provider,
    selectedModel: modelId,
  });
};

watch(
  () => selectedModel,
  (newModel) => {
    if (newModel !== "" && newModel !== selectedModelId.value) {
      selectedModelId.value = newModel;
      const allModels = [...defaultModels, ...customModels.value];
      const model = allModels.find((m) => m.id === newModel);
      if (model && model.provider !== localSelectedProvider.value) {
        localSelectedProvider.value = model.provider;
        models.value = getEnabledModelsForProvider(model.provider);
      }
    }
  },
  { immediate: true },
);

watch(
  () => selectedProvider,
  (newProvider) => {
    if (newProvider !== "" && newProvider !== localSelectedProvider.value) {
      const provider = newProvider as Provider;
      if (
        Object.values(Provider as Record<string, string>).includes(provider)
      ) {
        localSelectedProvider.value = provider;
        models.value = getEnabledModelsForProvider(provider);
      }
    }
  },
  { immediate: true },
);

watch(selectedModelId, async (newId) => {
  const model = models.value.find((m: ModelItem) => m.id === newId);
  if (model) {
    emit("selectModel", model.provider, model.id, model.name);
    await storageService.setAppState({
      activeChatId: "",
      selectedProvider: localSelectedProvider.value,
      selectedModel: newId,
    });
  }
});

const handleInput = (e: Event) => {
  const value = (e.target as HTMLTextAreaElement).value;
  emit("update:modelValue", value);

  const lastAtIndex = value.lastIndexOf("@");
  if (lastAtIndex >= 0) {
    const afterAt = value.slice(lastAtIndex + 1);
    const beforeAt = lastAtIndex > 0 ? value[lastAtIndex - 1] : " ";
    if (
      (beforeAt === " " || beforeAt === "\n" || lastAtIndex === 0) &&
      !afterAt.includes(" ")
    ) {
      mentionQuery.value = afterAt;
      showMentions.value = true;
      selectedMentionIndex.value = 0;
      return;
    }
  }
  showMentions.value = false;
};

const insertMention = (session: ReplaySession) => {
  const value = modelValue;
  const lastAtIndex = value.lastIndexOf("@");
  if (lastAtIndex >= 0) {
    const newValue =
      value.slice(0, lastAtIndex) + `@[${session.name}](replay:${session.id}) `;
    emit("update:modelValue", newValue);
  }
  showMentions.value = false;
  nextTick(() => textareaRef.value?.focus());
};

const handleKeydown = (e: KeyboardEvent) => {
  if (showMentions.value && filteredSessions.value.length > 0) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedMentionIndex.value = Math.min(
        selectedMentionIndex.value + 1,
        filteredSessions.value.length - 1,
      );
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedMentionIndex.value = Math.max(selectedMentionIndex.value - 1, 0);
      return;
    }
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const session = filteredSessions.value[selectedMentionIndex.value];
      if (session) insertMention(session);
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      showMentions.value = false;
      return;
    }
  }

  if (e.key === "Enter" && !e.shiftKey && !showMentions.value) {
    e.preventDefault();
    emit("send");
  }
};

const triggerFileInput = () => fileInputRef.value?.click();

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files !== null && input.files.length > 0) {
    emit("attachFiles", input.files);
    input.value = "";
  }
  nextTick(() => textareaRef.value?.focus());
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  isDragOver.value = false;
  if (
    e.dataTransfer?.files?.length !== undefined &&
    e.dataTransfer.files.length > 0
  ) {
    emit("attachFiles", e.dataTransfer.files);
  }
  nextTick(() => textareaRef.value?.focus());
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

watch(
  () => modelValue,
  (val) => {
    if (!val.includes("@")) showMentions.value = false;
  },
);

onMounted(() => {
  loadReplaySessions();
  loadModels();
  textareaRef.value?.focus();

  const handleProjectChange = async () => {
    await new Promise((r) => setTimeout(r, 50));
    await loadModels();
  };
  window.addEventListener("chatio-project-changed", handleProjectChange);

  onUnmounted(() => {
    window.removeEventListener("chatio-project-changed", handleProjectChange);
  });
});
</script>

<template>
  <div
    class="bg-surface-900 border-t border-surface-700 p-4 relative"
    style="min-height: 180px"
  >
    <div
      class="flex flex-col gap-3 h-full"
      :class="{ 'ring-2 ring-primary-500 ring-opacity-50': isDragOver }"
      @drop="handleDrop"
      @dragover.prevent="isDragOver = true"
      @dragleave="isDragOver = false"
    >
      <div
        v-show="showMentions"
        class="absolute bottom-full left-0 mb-2 w-72 bg-surface-800 border border-surface-700 rounded-lg shadow-xl overflow-hidden z-50 flex flex-col"
      >
        <div
          class="px-3 py-2 text-xs font-semibold text-surface-400 bg-surface-900/50 border-b border-surface-700 uppercase tracking-wider flex justify-between items-center"
        >
          <span>Select Session</span>
          <span
            v-if="filteredSessions.length > 0"
            class="bg-surface-700 text-surface-300 px-1.5 rounded-sm"
            >{{ filteredSessions.length }}</span
          >
        </div>

        <div class="max-h-60 overflow-y-auto custom-scrollbar p-1">
          <div
            v-if="filteredSessions.length === 0"
            class="px-3 py-4 text-center text-sm text-surface-500"
          >
            No sessions found
          </div>

          <div
            v-for="(session, index) in filteredSessions"
            :key="session.id"
            class="px-2 py-2 cursor-pointer flex items-center gap-2 text-sm rounded-md transition-colors duration-150"
            :class="
              index === selectedMentionIndex
                ? 'bg-surface-700 text-white'
                : 'text-surface-300 hover:bg-surface-700/50'
            "
            @click="insertMention(session)"
            @mouseenter="selectedMentionIndex = index"
          >
            <i
              class="fas fa-play-circle text-xs"
              :class="
                index === selectedMentionIndex
                  ? 'text-primary-400'
                  : 'text-surface-500'
              "
            />
            <span class="truncate">{{ session.name }}</span>
          </div>
        </div>
      </div>
      <div v-if="attachedFiles.length > 0" class="flex flex-wrap gap-2">
        <div
          v-for="(file, index) in attachedFiles"
          :key="index"
          class="flex items-center gap-2 px-3 py-2 bg-surface-800 rounded-lg text-sm"
        >
          <i
            :class="
              file.type.startsWith('image/')
                ? 'fas fa-image text-blue-400'
                : 'fas fa-file text-surface-400'
            "
          />
          <span
            class="max-w-[120px] truncate cursor-pointer hover:text-primary-400"
            @click="file.type.startsWith('image/') && emit('openImage', file)"
          >
            {{ file.name }}
          </span>
          <span class="text-xs text-surface-500">{{
            formatFileSize(file.size)
          }}</span>
          <Button
            icon="fas fa-times"
            text
            size="small"
            severity="secondary"
            @click="emit('removeFile', index)"
          />
        </div>
      </div>

      <textarea
        ref="textareaRef"
        :value="modelValue"
        placeholder="Message the agent..."
        :class="{
          'opacity-60': isLoading,
          'text-surface-200': !isLoading,
          'text-surface-400': isLoading,
        }"
        class="border-0 outline-none font-mono resize-none bg-transparent flex-1 text-base focus:outline-none focus:ring-0 overflow-y-auto scrollbar-hide"
        style="scrollbar-width: none; -ms-overflow-style: none"
        spellcheck="false"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        @input="handleInput"
        @keydown="handleKeydown"
      />

      <div class="flex gap-2 items-center min-w-0">
        <div class="flex gap-2 shrink-0">
          <ModelSelector
            v-model="selectedModelId"
            :custom-models="customModels"
            @select="handleModelSelect"
          />
        </div>

        <div class="flex items-center gap-2 min-w-0 flex-1 justify-end">
          <Button
            v-tooltip="'Attach file'"
            icon="fas fa-paperclip"
            text
            :pt="{
              root: {
                class:
                  'bg-surface-700/50 text-surface-200 py-1.5 px-2 rounded-md hover:text-white transition-colors duration-200 h-8 w-8',
              },
            }"
            @click="triggerFileInput"
          />
          <Button
            v-if="!isLoading"
            severity="tertiary"
            icon="fas fa-arrow-circle-up"
            :disabled="!modelValue.trim() && attachedFiles.length === 0"
            :pt="{
              root: {
                class:
                  modelValue.trim() || attachedFiles.length > 0
                    ? 'bg-surface-700/50 text-surface-200 py-1.5 px-2 rounded-md hover:text-white transition-colors duration-200 h-8 w-8 cursor-pointer'
                    : 'bg-surface-700/20 text-surface-400 py-1.5 px-2 rounded-md h-8 w-8 cursor-not-allowed',
              },
            }"
            @click="emit('send')"
          />
          <Button
            v-else
            severity="danger"
            icon="fas fa-square"
            :pt="{
              root: {
                class:
                  'bg-red-400/10 text-red-400 py-1 px-1.5 rounded-md hover:bg-red-400/20 transition-colors duration-200 h-8 w-8 cursor-pointer',
              },
              icon: {
                class: 'text-sm',
              },
            }"
            @click="emit('stop')"
          />
        </div>
      </div>

      <input
        ref="fileInputRef"
        type="file"
        multiple
        accept="image/*,.txt,.md,.json,.js,.ts,.py,.html,.css,.xml,.yaml,.yml"
        class="hidden"
        @change="handleFileSelect"
      />
    </div>
  </div>
</template>
