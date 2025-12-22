<script setup lang="ts">
import Card from "primevue/card";
import InputNumber from "primevue/inputnumber";
import Textarea from "primevue/textarea";
import ToggleSwitch from "primevue/toggleswitch";

const chatSettings = defineModel<{
  maxMessages: number;
  systemPrompt: string;
  autoSave: boolean;
}>("chatSettings", { required: true });
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
          <h3 class="text-md font-semibold">Chat Configuration</h3>
          <p class="text-sm text-surface-400">Customize your chat experience</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-sm text-surface-400">Context Messages</label>
            <InputNumber
              v-model="chatSettings.maxMessages"
              :min="5"
              :max="100"
              :step="5"
              class="w-full mt-1"
            />
            <p class="text-xs text-surface-500 mt-1">
              Higher values = more context but more tokens
            </p>
          </div>

          <div>
            <label class="text-sm text-surface-400">System Prompt</label>
            <Textarea
              v-model="chatSettings.systemPrompt"
              rows="8"
              class="w-full mt-1"
              placeholder="Define AI behavior..."
            />
            <p class="text-xs text-surface-500 mt-1">
              Customize how the AI responds to your queries
            </p>
          </div>

          <div
            class="flex items-center justify-between p-3 bg-surface-800 rounded-lg"
          >
            <div>
              <label class="text-sm font-medium">Auto-save History</label>
              <p class="text-xs text-surface-500">
                Save conversations automatically
              </p>
            </div>
            <ToggleSwitch v-model="chatSettings.autoSave" />
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
