<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { computed } from "vue";

interface ImageItem {
  name: string;
  content: string;
  type: string;
}

const props = defineProps<{
  visible: boolean;
  images: ImageItem[];
  currentIndex: number;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  navigate: [direction: "prev" | "next"];
}>();

const currentImage = computed(() => props.images[props.currentIndex]);
const hasPrev = computed(() => props.currentIndex > 0);
const hasNext = computed(() => props.currentIndex < props.images.length - 1);
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header="currentImage?.name ?? 'Image Viewer'"
    :style="{ width: '80vw', maxWidth: '1200px' }"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="flex items-center justify-center min-h-[400px] relative">
      <Button
        v-if="hasPrev"
        icon="fas fa-chevron-left"
        text
        class="absolute left-0"
        @click="emit('navigate', 'prev')"
      />
      <img
        v-if="currentImage !== undefined"
        :src="currentImage.content"
        :alt="currentImage.name"
        class="max-h-[70vh] max-w-full object-contain"
      />
      <Button
        v-if="hasNext"
        icon="fas fa-chevron-right"
        text
        class="absolute right-0"
        @click="emit('navigate', 'next')"
      />
    </div>
    <div v-if="images.length > 1" class="flex justify-center gap-2 mt-4">
      <div
        v-for="(_, index) in images"
        :key="index"
        class="w-2 h-2 rounded-full cursor-pointer"
        :class="index === currentIndex ? 'bg-primary-500' : 'bg-surface-600'"
      />
    </div>
    <template #footer>
      <span class="text-sm text-surface-500"
        >{{ currentIndex + 1 }} / {{ images.length }}</span
      >
      <Button label="Close" @click="emit('update:visible', false)" />
    </template>
  </Dialog>
</template>
