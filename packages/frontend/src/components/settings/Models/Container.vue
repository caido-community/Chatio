<script setup lang="ts">
import Button from "primevue/button";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import ToggleSwitch from "primevue/toggleswitch";
import Tooltip from "primevue/tooltip";

import AddModelDialog from "./AddModelDialog.vue";
import { useModels } from "./useModels";

const {
  searchQuery,
  isAddDialogVisible,
  selectedProvider,
  filteredModels,
  providerOptions,
  isLoading,
  toggleModel,
  addCustomModel,
  removeCustomModel,
  isCustomModel,
} = useModels();

const vTooltip = Tooltip;
</script>

<template>
  <div class="flex flex-col h-full">
    <div
      class="flex items-center justify-between p-4 border-b border-surface-700 flex-none"
    >
      <h3 class="text-base font-medium">Manage Models</h3>
      <div class="flex items-center gap-2">
        <Select
          v-model="selectedProvider"
          :options="providerOptions"
          option-label="name"
          option-value="id"
          class="w-40"
        >
          <template #value="{ value }">
            <div class="flex items-center gap-2 text-sm">
              <component
                :is="providerOptions.find((p) => p.id === value)?.icon"
                v-if="providerOptions.find((p) => p.id === value)?.icon"
                class="h-4 w-4"
              />
              <span>{{
                providerOptions.find((p) => p.id === value)?.name ?? "All"
              }}</span>
            </div>
          </template>
          <template #option="{ option }">
            <div class="flex items-center gap-2 text-sm">
              <component :is="option.icon" v-if="option.icon" class="h-4 w-4" />
              <span>{{ option.name }}</span>
            </div>
          </template>
        </Select>
        <Button
          label="Add Custom Model"
          icon="fas fa-plus"
          size="small"
          @click="isAddDialogVisible = true"
        />
      </div>
    </div>

    <div class="px-4 pb-4 pt-4 flex flex-col gap-4 overflow-hidden h-full">
      <IconField class="w-full flex-none">
        <InputIcon class="fas fa-search" />
        <InputText
          v-model="searchQuery"
          placeholder="Search models..."
          class="w-full"
        />
      </IconField>

      <div
        v-if="isLoading"
        class="flex items-center justify-center py-8 flex-1"
      >
        <i class="fas fa-spinner fa-spin text-2xl text-surface-400" />
      </div>

      <div v-else class="flex flex-col overflow-y-auto pr-2 overflow-auto">
        <template v-for="(model, index) in filteredModels" :key="model.id">
          <div
            class="flex items-center justify-between p-3 bg-surface-800 rounded-md hover:bg-surface-700 transition-colors duration-200 flex-none"
          >
            <div class="flex items-center gap-3">
              <component
                :is="model.icon"
                v-if="model.icon"
                class="h-5 w-5 text-surface-400"
              />
              <div v-else class="h-5 w-5 rounded bg-surface-600" />
              <div class="flex flex-col">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-sm">{{ model.name }}</span>
                  <i
                    v-if="model.isReasoningModel"
                    v-tooltip.top="'Reasoning Model'"
                    class="fas fa-brain text-surface-400 text-xs"
                  />
                  <span
                    v-if="isCustomModel(model.id)"
                    class="text-xs px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-400"
                  >
                    Custom
                  </span>
                </div>
                <span class="text-xs text-surface-400">{{ model.id }}</span>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <Button
                v-if="isCustomModel(model.id)"
                v-tooltip.top="'Delete custom model'"
                icon="fas fa-trash"
                severity="danger"
                size="small"
                text
                @click="removeCustomModel(model.id)"
              />
              <ToggleSwitch
                v-tooltip.left="
                  model.enabled ? 'Disable model' : 'Enable model'
                "
                :model-value="model.enabled"
                @update:model-value="toggleModel(model)"
              />
            </div>
          </div>
          <div
            v-if="index < filteredModels.length - 1"
            class="border-b border-surface-700"
          />
        </template>

        <div
          v-if="filteredModels.length === 0"
          class="text-center text-surface-400 py-8"
        >
          No models found.
        </div>
      </div>
    </div>

    <AddModelDialog
      v-model:visible="isAddDialogVisible"
      @add="addCustomModel"
    />
  </div>
</template>
