<script setup lang="ts">
import Button from "primevue/button";
import Select from "primevue/select";
import { computed, nextTick, onMounted, ref, watch } from "vue";

import type { AttachedFile } from "../types";
import { getProviderIcon } from "../types";

import { useSDK } from "@/plugins/sdk";
import { CaidoStorageService } from "@/services/storage";

interface ReplaySession {
  id: string;
  name: string;
}

interface ModelOption {
  id: string;
  name: string;
  provider: string;
  model: string;
}

const props = defineProps<{
  modelValue: string;
  attachedFiles: AttachedFile[];
  isLoading: boolean;
  isTyping: boolean;
  selectedProvider: string;
  selectedModel: string;
  selectedModule: string;
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
const storageService = new CaidoStorageService(sdk);
const fileInputRef = ref<HTMLInputElement>();
const textareaRef = ref<HTMLTextAreaElement>();
const isDragOver = ref(false);

const showMentions = ref(false);
const replaySessions = ref<ReplaySession[]>([]);
const mentionQuery = ref("");
const selectedMentionIndex = ref(0);

const models = ref<ModelOption[]>([]);
const selectedModelId = ref("");

const filteredSessions = computed(() => {
  if (mentionQuery.value === "") return replaySessions.value;
  const query = mentionQuery.value.toLowerCase();
  return replaySessions.value.filter((s) =>
    s.name.toLowerCase().includes(query),
  );
});

const loadReplaySessions = async () => {
  try {
    const sessions = await sdk.backend.getReplaySessions();
    replaySessions.value = sessions;
  } catch (error) {
    console.error("Failed to load replay sessions:", error);
  }
};

const loadModels = async () => {
  try {
    const settings = await storageService.getSettings();
    if (!settings?.providers) return;

    const modelsList: ModelOption[] = [];

    for (const [providerKey, providerConfig] of Object.entries(
      settings.providers,
    )) {
      if (!providerConfig || typeof providerConfig !== "object") continue;
      if (!("apiKey" in providerConfig) || !providerConfig.apiKey) continue;

      try {
        const capabilities =
          await sdk.backend.getProviderCapabilities(providerKey);
        const providerModels = capabilities?.allModels || [];

        for (const modelName of providerModels) {
          const displayName = `${providerKey.charAt(0).toUpperCase() + providerKey.slice(1)} - ${modelName}`;
          modelsList.push({
            id: `${providerKey}:${modelName}`,
            name: displayName,
            provider: providerKey,
            model: modelName as string,
          });
        }
      } catch (error) {
        console.error(`Failed to load models for ${providerKey}:`, error);
      }
    }

    models.value = modelsList;

    if (props.selectedProvider && props.selectedModel) {
      selectedModelId.value = `${props.selectedProvider}:${props.selectedModel}`;
    } else if (modelsList.length > 0 && modelsList[0]) {
      selectedModelId.value = modelsList[0].id;
      const firstModel = modelsList[0];
      emit(
        "selectModel",
        firstModel.provider,
        firstModel.model,
        firstModel.name,
      );
    }
  } catch (error) {
    console.error("Failed to load models:", error);
  }
};

watch(
  () => props.selectedProvider + props.selectedModel,
  () => {
    if (props.selectedProvider && props.selectedModel) {
      selectedModelId.value = `${props.selectedProvider}:${props.selectedModel}`;
    }
  },
);

watch(selectedModelId, (newId) => {
  const model = models.value.find((m) => m.id === newId);
  if (model) {
    emit("selectModel", model.provider, model.model, model.name);
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
  const value = props.modelValue;
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
  if (input.files?.length) {
    emit("attachFiles", input.files);
    input.value = "";
  }
  nextTick(() => textareaRef.value?.focus());
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  isDragOver.value = false;
  if (e.dataTransfer?.files?.length) {
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
  () => props.modelValue,
  (val) => {
    if (!val.includes("@")) showMentions.value = false;
  },
);

onMounted(() => {
  loadReplaySessions();
  loadModels();
  textareaRef.value?.focus();
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
          <Select
            v-model="selectedModelId"
            :options="models"
            option-label="name"
            option-value="id"
            filter
            filter-placeholder="Search models..."
            placeholder="Select model"
            :pt="{
              root: {
                class:
                  'inline-flex relative rounded-md bg-transparent transition-all duration-200 hover:border-secondary-400 cursor-pointer select-none',
              },
              label: {
                class:
                  'block bg-transparent border-0 text-white/80 placeholder:text-surface-500 transition duration-200 focus:outline-none cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap font-mono text-sm',
              },
              dropdownicon: { class: 'h-2 mb-0.5' },
            }"
          >
            <template #value>
              <div
                class="flex items-center gap-2 text-surface-400 text-sm transition-colors duration-200 hover:text-surface-200"
              >
                <i
                  :class="
                    getProviderIcon(
                      models.find((m) => m.id === selectedModelId)?.provider ||
                        'assistant',
                    )
                  "
                  class="h-4 w-4"
                />
                <span class="truncate">
                  {{
                    models.find((m) => m.id === selectedModelId)?.name ||
                    "Select model"
                  }}
                </span>
              </div>
            </template>
            <template #option="slotProps">
              <div class="flex items-center gap-2 text-surface-300 text-sm">
                <i
                  :class="getProviderIcon(slotProps.option.provider)"
                  class="h-4 w-4"
                />
                <span class="truncate">{{ slotProps.option.name }}</span>
              </div>
            </template>
          </Select>
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

      <div
        v-if="isTyping"
        class="flex items-center gap-2 text-sm text-surface-400"
      >
        <i class="fas fa-spinner fa-spin" /><span>AI is typing...</span>
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
