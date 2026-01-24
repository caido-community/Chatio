<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
import { computed, ref, watch } from "vue";

import { useSDK } from "@/plugins/sdk";
import {
  defaultModels,
  type ModelItem,
  Provider,
  providers as providersList,
} from "@/stores/models";
import { getProviderStatuses } from "@/utils/ai";

const { customModels = [] } = defineProps<{
  customModels?: ModelItem[];
}>();

const sdk = useSDK();

const modelValue = defineModel<string>();

const emit = defineEmits<{
  select: [provider: string, modelId: string, modelName: string];
}>();

const isOpen = ref(false);
const containerRef = ref<HTMLElement>();
const activeProvider = ref<Provider>(Provider.OpenRouter);

const allModels = computed(() => [...defaultModels, ...(customModels ?? [])]);

onClickOutside(containerRef, () => {
  isOpen.value = false;
});

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const providerStatuses = computed(() => {
  const statuses = getProviderStatuses(sdk);
  return new Map(statuses.map((s) => [s.id, s.isConfigured]));
});

const providerIdMap: Record<Provider, string> = {
  [Provider.OpenRouter]: "openrouter",
  [Provider.OpenAI]: "openai",
  [Provider.Anthropic]: "anthropic",
  [Provider.Google]: "google",
};

const isProviderConfigured = (provider: Provider): boolean => {
  const sdkId = providerIdMap[provider];
  return providerStatuses.value.get(sdkId) ?? false;
};

const providersWithStatus = computed(() => {
  return providersList
    .map((p) => ({
      ...p,
      isConfigured: isProviderConfigured(p.id),
    }))
    .sort((a, b) => {
      if (a.isConfigured !== b.isConfigured) {
        return a.isConfigured ? -1 : 1;
      }
      return 0;
    });
});

const modelsForProvider = computed(() => {
  return allModels.value
    .filter((m) => m.provider === activeProvider.value)
    .map((m) => ({
      ...m,
      isConfigured: isProviderConfigured(m.provider),
    }));
});

const selectedModel = computed(() => {
  return allModels.value.find((m) => m.id === modelValue.value);
});

watch(selectedModel, (model) => {
  if (model) {
    activeProvider.value = model.provider;
  }
});

const handleProviderClick = (provider: {
  id: Provider;
  isConfigured: boolean;
}) => {
  if (!provider.isConfigured) return;
  activeProvider.value = provider.id;
};

const handleSelect = (model: ModelItem & { isConfigured: boolean }) => {
  if (!model.isConfigured) return;
  modelValue.value = model.id;
  emit("select", model.provider, model.id, model.name);
  isOpen.value = false;
};
</script>

<template>
  <div ref="containerRef" class="relative">
    <button
      type="button"
      class="flex items-center gap-2 rounded transition-colors border px-3 py-1.5 text-sm bg-surface-800 border-surface-700 hover:bg-surface-700 hover:text-surface-100 text-surface-400 cursor-pointer"
      @click="toggle"
    >
      <component
        :is="selectedModel?.icon"
        v-if="selectedModel?.icon"
        class="h-4 w-4"
      />
      <component
        :is="
          providersWithStatus.find((p) => p.id === selectedModel?.provider)
            ?.icon
        "
        v-else-if="
          selectedModel &&
          providersWithStatus.find((p) => p.id === selectedModel?.provider)
            ?.icon
        "
        class="h-4 w-4"
      />
      <span class="truncate max-w-[160px]">
        {{ selectedModel?.name ?? "Select model" }}
      </span>
      <i
        v-if="selectedModel?.isReasoningModel"
        class="fas fa-brain text-xs text-surface-500"
      />
      <i
        :class="[
          'fas fa-chevron-down transition-transform text-xs',
          isOpen ? 'rotate-180' : '',
        ]"
      />
    </button>

    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 bottom-full mb-1 z-[10001] flex h-52 w-80 flex-row overflow-hidden rounded-lg border border-surface-700 bg-surface-900 shadow-xl"
      >
        <!-- Providers Panel -->
        <div
          class="flex w-28 flex-col overflow-y-auto border-r border-surface-700 bg-surface-800/30"
        >
          <button
            v-for="provider in providersWithStatus"
            :key="provider.id"
            v-tooltip.left="
              provider.isConfigured
                ? undefined
                : `${provider.name} is not configured`
            "
            type="button"
            :disabled="!provider.isConfigured"
            :class="[
              'group relative flex items-center gap-2 px-2.5 py-2 text-left text-sm transition-colors',
              !provider.isConfigured
                ? 'cursor-not-allowed text-surface-500'
                : activeProvider === provider.id
                  ? 'bg-surface-700/50 text-surface-100 font-medium'
                  : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200',
            ]"
            @click="handleProviderClick(provider)"
          >
            <component :is="provider.icon" class="h-4 w-4 shrink-0" />
            <span class="truncate flex-1">{{ provider.name }}</span>
            <i
              v-if="!provider.isConfigured"
              class="fas fa-exclamation-circle text-[10px] text-surface-600"
            />
            <div
              v-if="activeProvider === provider.id && provider.isConfigured"
              class="absolute left-0 top-0 bottom-0 w-0.5 bg-primary-500"
            />
          </button>
        </div>

        <!-- Models Panel -->
        <div class="flex flex-1 flex-col overflow-y-auto bg-surface-900">
          <div v-if="modelsForProvider.length > 0" class="flex flex-col py-1">
            <button
              v-for="model in modelsForProvider"
              :key="model.id"
              v-tooltip.right="
                model.isConfigured
                  ? undefined
                  : `${providersWithStatus.find((p) => p.id === model.provider)?.name} is not configured`
              "
              type="button"
              :disabled="!model.isConfigured"
              :class="[
                'w-full truncate px-3 py-1.5 text-left text-sm transition-colors',
                !model.isConfigured
                  ? 'cursor-not-allowed text-surface-600'
                  : model.id === modelValue
                    ? 'bg-surface-700 text-surface-100'
                    : 'text-surface-300 hover:bg-surface-800 hover:text-surface-100',
              ]"
              @click="handleSelect(model)"
            >
              <div class="flex items-center gap-2">
                <component
                  :is="model.icon"
                  v-if="model.icon"
                  class="h-4 w-4 shrink-0"
                />
                <component
                  :is="
                    providersWithStatus.find((p) => p.id === model.provider)
                      ?.icon
                  "
                  v-else
                  class="h-4 w-4 shrink-0"
                />
                <span class="truncate flex-1">{{ model.name }}</span>
                <div class="flex items-center gap-1.5 shrink-0 ml-1">
                  <i
                    v-if="model.isReasoningModel"
                    v-tooltip.right="'Reasoning Model'"
                    class="fas fa-brain text-[10px] text-surface-500"
                  />
                  <i
                    v-if="!model.isConfigured"
                    class="fas fa-exclamation-circle text-[10px] text-surface-500"
                  />
                  <i
                    v-else-if="model.id === modelValue"
                    class="fas fa-check text-xs text-surface-100"
                  />
                </div>
              </div>
            </button>
          </div>

          <div
            v-else
            class="flex flex-1 items-center justify-center px-4 text-center text-sm text-surface-500"
          >
            No models available
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
