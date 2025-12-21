<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { computed, onMounted, ref, watch } from "vue";

import type { ModelOption } from "../types";
import { AVAILABLE_MODELS, getProviderIcon } from "../types";

import { useSDK } from "@/plugins/sdk";
import { CaidoStorageService } from "@/services/storage";

const props = defineProps<{
  visible: boolean;
  selectedProvider: string;
  selectedModel: string;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  selectModel: [provider: string, model: string, displayName: string];
}>();

const sdk = useSDK();
const storageService = new CaidoStorageService(sdk);

interface ProviderConfig {
  apiKey?: string;
  url?: string;
  models?: string;
}

const configuredProviders = ref<Record<string, ProviderConfig>>({});
const localModels = ref<ModelOption[]>([]);

const loadConfiguredProviders = async () => {
  const settings = await storageService.getSettings();
  if (settings?.providers !== undefined) {
    configuredProviders.value = settings.providers;
    const local = settings.providers.local as ProviderConfig | undefined;
    if (local?.models !== undefined && local.models.trim() !== "") {
      localModels.value = local.models
        .split(",")
        .map((m) => ({ model: m.trim(), displayName: m.trim() }));
    }
  }
};

const availableProviders = computed(() => {
  const providers: string[] = [];
  for (const [key, config] of Object.entries(configuredProviders.value)) {
    const c = config;
    if (key === "local" && c.url !== undefined && c.url.trim() !== "")
      providers.push(key);
    else if (c.apiKey !== undefined && c.apiKey.trim() !== "")
      providers.push(key);
  }
  return providers;
});

const getModelsForProvider = (provider: string): ModelOption[] => {
  if (provider === "local") return localModels.value;
  return AVAILABLE_MODELS[provider] ?? [];
};

const handleSelect = (provider: string, model: ModelOption) => {
  emit("selectModel", provider, model.model, model.displayName);
  emit("update:visible", false);
};

watch(
  () => props.visible,
  (val) => {
    if (val) loadConfiguredProviders();
  },
);
onMounted(() => loadConfiguredProviders());
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    header="Select AI Model"
    :style="{ width: '600px' }"
    @update:visible="emit('update:visible', $event)"
  >
    <div v-if="availableProviders.length === 0" class="text-center py-8">
      <i class="fas fa-exclamation-circle text-4xl text-amber-400 mb-4" />
      <p class="text-surface-300">No AI providers configured</p>
      <p class="text-sm text-surface-500 mt-2">
        Go to Settings and add your API keys first
      </p>
    </div>
    <div v-else class="space-y-4">
      <div v-for="provider in availableProviders" :key="provider">
        <h4
          class="text-sm font-semibold text-surface-400 mb-2 flex items-center gap-2"
        >
          <i :class="getProviderIcon(provider)" />{{
            provider.charAt(0).toUpperCase() + provider.slice(1)
          }}
        </h4>
        <div class="grid grid-cols-2 gap-2">
          <Button
            v-for="model in getModelsForProvider(provider)"
            :key="model.model"
            :label="model.displayName"
            :severity="
              selectedProvider === provider && selectedModel === model.model
                ? 'primary'
                : 'secondary'
            "
            class="justify-start"
            @click="handleSelect(provider, model)"
          />
        </div>
      </div>
    </div>
    <template #footer
      ><Button label="Cancel" text @click="emit('update:visible', false)"
    /></template>
  </Dialog>
</template>
