<script setup lang="ts">
import Card from "primevue/card";

import { useSDK } from "@/plugins/sdk";
import { useModels } from "@/stores/models";

const { models, providers } = useModels(useSDK());

const modelCount = (providerId: string) =>
  models.value.filter((m) => m.providerId === providerId).length;
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
          <h3 class="text-md font-semibold">AI Providers</h3>
          <p class="text-sm text-surface-400">
            AI providers and models are managed in Caido Settings
          </p>
        </div>

        <div class="p-4 bg-surface-800 rounded-lg space-y-3">
          <div class="flex items-center gap-3">
            <i class="fas fa-info-circle text-primary-400 text-xl" />
            <div>
              <h4 class="font-medium">Configure Providers in Caido</h4>
              <p class="text-sm text-surface-400 mt-1">
                Go to <strong>Caido Settings → AI</strong> to add providers and
                choose which models are available to Chatio.
              </p>
            </div>
          </div>
        </div>

        <div class="p-4 bg-surface-700/50 rounded-lg">
          <h4 class="font-medium mb-2">Configured Providers</h4>
          <div
            v-if="providers.length > 0"
            class="grid grid-cols-3 gap-3 text-sm"
          >
            <div
              v-for="provider in providers"
              :key="provider.id"
              class="flex items-center gap-2"
            >
              <component
                :is="provider.icon"
                v-if="provider.icon"
                class="h-4 w-4 shrink-0"
              />
              <i v-else class="fas fa-check-circle text-green-400" />
              <span class="truncate">{{ provider.label }}</span>
              <span class="text-surface-400 shrink-0">
                {{ modelCount(provider.id) }} models
              </span>
            </div>
          </div>
          <p v-else class="text-sm text-surface-400">
            No AI providers configured yet. Add one in Caido Settings → AI to
            start chatting.
          </p>
        </div>
      </div>
    </template>
  </Card>
</template>
