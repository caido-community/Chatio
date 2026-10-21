<script setup lang="ts">
import type { AIUpstreamModel } from "@caido/sdk-frontend";
import { onClickOutside } from "@vueuse/core";
import { computed, ref, watch } from "vue";

import { useSDK } from "@/plugins/sdk";
import { useModels } from "@/stores/models";

const { selected } = defineProps<{
  selected: AIUpstreamModel | undefined;
}>();

const emit = defineEmits<{
  select: [model: AIUpstreamModel];
}>();

const { models, providers } = useModels(useSDK());

const isOpen = ref(false);
const containerRef = ref<HTMLElement>();
const activeProvider = ref(selected?.providerId);

onClickOutside(containerRef, () => {
  isOpen.value = false;
});

const toggle = () => {
  isOpen.value = !isOpen.value;
  if (!providers.value.some((p) => p.id === activeProvider.value)) {
    activeProvider.value = selected?.providerId ?? providers.value[0]?.id;
  }
};

const selectedKey = computed(() => selected?.modelId);

const selectedProvider = computed(() =>
  providers.value.find((p) => p.id === selected?.providerId),
);

const modelsForProvider = computed(() =>
  models.value.filter((m) => m.providerId === activeProvider.value),
);

const supportsReasoning = (model: AIUpstreamModel) =>
  model.support.reasoning !== "UNSUPPORTED";

watch(
  () => selected?.providerId,
  (providerId) => {
    if (providerId !== undefined) activeProvider.value = providerId;
  },
);

const handleSelect = (model: AIUpstreamModel) => {
  emit("select", model);
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
        :is="selectedProvider?.icon"
        v-if="selectedProvider?.icon"
        class="h-4 w-4"
      />
      <span class="truncate max-w-[160px]">
        {{
          selected?.displayName ??
          (models.length === 0 ? "No models available" : "Select model")
        }}
      </span>
      <i
        v-if="selected && supportsReasoning(selected)"
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
        <div
          v-if="providers.length === 0"
          class="flex flex-1 items-center justify-center px-4 text-center text-sm text-surface-500"
        >
          No AI providers configured. Add one in Caido Settings → AI.
        </div>

        <template v-else>
          <!-- Providers Panel -->
          <div
            class="flex w-28 flex-col overflow-y-auto border-r border-surface-700 bg-surface-800/30"
          >
            <button
              v-for="provider in providers"
              :key="provider.id"
              type="button"
              :class="[
                'group relative flex items-center gap-2 px-2.5 py-2 text-left text-sm transition-colors',
                activeProvider === provider.id
                  ? 'bg-surface-700/50 text-surface-100 font-medium'
                  : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200',
              ]"
              @click="activeProvider = provider.id"
            >
              <component
                :is="provider.icon"
                v-if="provider.icon"
                class="h-4 w-4 shrink-0"
              />
              <span class="truncate flex-1">{{ provider.label }}</span>
              <div
                v-if="activeProvider === provider.id"
                class="absolute left-0 top-0 bottom-0 w-0.5 bg-primary-500"
              />
            </button>
          </div>

          <!-- Models Panel -->
          <div class="flex flex-1 flex-col overflow-y-auto bg-surface-900">
            <div v-if="modelsForProvider.length > 0" class="flex flex-col py-1">
              <button
                v-for="model in modelsForProvider"
                :key="model.modelId"
                type="button"
                :class="[
                  'w-full truncate px-3 py-1.5 text-left text-sm transition-colors',
                  model.modelId === selectedKey
                    ? 'bg-surface-700 text-surface-100'
                    : 'text-surface-300 hover:bg-surface-800 hover:text-surface-100',
                ]"
                @click="handleSelect(model)"
              >
                <div class="flex items-center gap-2">
                  <span class="truncate flex-1">{{ model.displayName }}</span>
                  <div class="flex items-center gap-1.5 shrink-0 ml-1">
                    <i
                      v-if="supportsReasoning(model)"
                      v-tooltip.right="'Reasoning Model'"
                      class="fas fa-brain text-[10px] text-surface-500"
                    />
                    <i
                      v-if="model.modelId === selectedKey"
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
        </template>
      </div>
    </Transition>
  </div>
</template>
