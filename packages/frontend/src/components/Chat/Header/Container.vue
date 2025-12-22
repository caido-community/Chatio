<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";

const { title, autoSaveEnabled, showHistory } = defineProps<{
  title: string;
  autoSaveEnabled: boolean;
  showHistory: boolean;
}>();

const emit = defineEmits<{
  newChat: [];
  export: [];
  toggleHistory: [];
}>();
</script>

<template>
  <Card
    class="h-fit"
    :pt="{ body: { class: 'h-fit p-0' }, content: { class: 'h-fit' } }"
  >
    <template #content>
      <div class="flex items-center justify-between px-4 py-2">
        <div class="flex items-center gap-2">
          <Button
            v-tooltip="showHistory ? 'Hide History' : 'Show History'"
            :icon="showHistory ? 'fas fa-chevron-left' : 'fas fa-chevron-right'"
            text
            size="small"
            @click="emit('toggleHistory')"
          />
          <span class="font-medium text-sm">{{ title }}</span>
          <span
            v-if="autoSaveEnabled"
            class="text-xs text-surface-500 flex items-center gap-1"
          >
            <i class="fas fa-save text-green-500" />Auto-save
          </span>
        </div>
        <div class="flex items-center gap-2">
          <Button
            label="New Chat"
            icon="fas fa-plus"
            size="small"
            @click="emit('newChat')"
          />
          <Button
            v-tooltip="'Export Chat'"
            icon="fas fa-download"
            text
            size="small"
            @click="emit('export')"
          />
        </div>
      </div>
    </template>
  </Card>
</template>
