<script setup lang="ts">
import Card from "primevue/card";
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
            AI provider configuration is managed in Caido Settings
          </p>
        </div>

        <div class="p-4 bg-surface-800 rounded-lg space-y-3">
          <div class="flex items-center gap-3">
            <i class="fas fa-info-circle text-primary-400 text-xl" />
            <div>
              <h4 class="font-medium">Configure API Keys in Caido</h4>
              <p class="text-sm text-surface-400 mt-1">
                Go to <strong>Caido Settings → AI</strong> to configure your API
                keys for OpenRouter, OpenAI, Anthropic, and Google.
              </p>
            </div>
          </div>
        </div>

        <div class="p-4 bg-surface-700/50 rounded-lg">
          <h4 class="font-medium mb-2">Supported Providers</h4>
          <div class="grid grid-cols-4 gap-3 text-sm">
            <div class="flex items-center gap-2">
              <i class="fas fa-check-circle text-green-400" />
              OpenRouter
            </div>
            <div class="flex items-center gap-2">
              <i class="fas fa-check-circle text-green-400" />
              OpenAI
            </div>
            <div class="flex items-center gap-2">
              <i class="fas fa-check-circle text-green-400" />
              Anthropic
            </div>
            <div class="flex items-center gap-2">
              <i class="fas fa-check-circle text-green-400" />
              Google
            </div>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
