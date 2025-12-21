<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import ContextMenu from "primevue/contextmenu";
import { computed, nextTick, onMounted, ref, watch } from "vue";

import type { AttachedFile, Message } from "../types";
import { getProviderIcon } from "../types";

const props = defineProps<{
  messages: Message[];
  isLoading: boolean;
  currentStatus: string;
  welcomePrompts: string[];
}>();

const emit = defineEmits<{
  selectPrompt: [prompt: string];
  copyMessage: [content: string];
  deleteMessage: [index: number];
  openImage: [file: AttachedFile];
  clickMention: [mentionId: string];
}>();

const containerRef = ref<HTMLElement>();
const contextMenuRef = ref<InstanceType<typeof ContextMenu>>();
const selectedMessageIndex = ref(-1);
const selectedMessage = computed(
  () => props.messages[selectedMessageIndex.value],
);

const scrollToBottom = async () => {
  await nextTick();
  if (containerRef.value !== undefined) {
    containerRef.value.scrollTop = containerRef.value.scrollHeight;
  }
};

watch(
  () => props.messages.length,
  () => scrollToBottom(),
);
onMounted(() => scrollToBottom());

const formatContent = (content: string): string => {
  let formatted = content.replace(
    /@\[([^\]]+)\]\(replay:([^)]+)\)/g,
    '<a href="#" class="text-primary-400 hover:underline mention-link" data-mention-id="$2">@$1</a>',
  );

  formatted = formatted
    .replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      '<pre class="bg-surface-900 p-3 rounded-lg overflow-x-auto my-2 text-xs"><code>$2</code></pre>',
    )
    .replace(
      /`([^`]+)`/g,
      '<code class="px-1 py-0.5 bg-surface-800 rounded text-xs">$1</code>',
    )
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .split("\n")
    .join("<br>");

  return formatted;
};

const handleContentClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.classList.contains("mention-link")) {
    event.preventDefault();
    const mentionId = target.getAttribute("data-mention-id");
    if (mentionId !== null) {
      emit("clickMention", mentionId);
    }
  }
};

const contextMenuItems = computed(() => {
  const msg = selectedMessage.value;
  if (msg === undefined) return [];

  const items = [
    {
      label: "Copy",
      icon: "fas fa-copy",
      command: () => {
        emit("copyMessage", msg.content);
      },
    },
  ];

  if (msg.role === "user") {
    items.push({
      label: "Delete",
      icon: "fas fa-trash",
      command: () => {
        emit("deleteMessage", selectedMessageIndex.value);
      },
    });
  }

  return items;
});

const showContextMenu = (event: MouseEvent, index: number) => {
  selectedMessageIndex.value = index;
  contextMenuRef.value?.show(event);
};
</script>

<template>
  <Card
    class="flex-1 min-h-0"
    :pt="{
      body: { class: 'h-full p-0' },
      content: { class: 'h-full overflow-hidden' },
    }"
  >
    <template #content>
      <div ref="containerRef" class="h-full overflow-auto p-4">
        <div
          v-if="messages.length === 0"
          class="flex items-center justify-center h-full"
        >
          <div class="text-center max-w-md">
            <i class="fas fa-robot text-4xl text-primary mb-4" />
            <h2 class="text-xl font-semibold mb-2">Welcome to Chatio</h2>
            <p class="text-surface-400 mb-6">
              Your AI-powered security assistant
            </p>
            <div class="space-y-2">
              <Button
                v-for="prompt in welcomePrompts"
                :key="prompt"
                :label="prompt"
                class="w-full justify-start"
                severity="secondary"
                text
                @click="emit('selectPrompt', prompt)"
              />
            </div>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(message, index) in messages"
            :key="message.id"
            class="flex gap-3"
            :class="message.role === 'user' ? 'flex-row-reverse' : ''"
            @contextmenu.prevent="showContextMenu($event, index)"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              :class="
                message.role === 'user' ? 'bg-primary-600' : 'bg-surface-700'
              "
            >
              <i v-if="message.role === 'user'" class="fas fa-user text-xs" />
              <i
                v-else
                :class="getProviderIcon(message.provider ?? 'assistant')"
                class="text-xs"
              />
            </div>

            <div
              class="max-w-[80%] rounded-lg p-3 cursor-context-menu"
              :class="
                message.role === 'user' ? 'bg-primary-600' : 'bg-surface-800'
              "
            >
              <div
                v-if="message.role === 'assistant' && message.model"
                class="text-xs text-surface-500 mb-1"
              >
                {{ message.model }}
              </div>
              <div
                v-if="message.files && message.files.length > 0"
                class="flex flex-wrap gap-2 mb-2"
              >
                <div
                  v-for="file in message.files"
                  :key="file.name"
                  class="flex items-center gap-1 px-2 py-1 bg-surface-700 rounded text-xs"
                >
                  <i
                    :class="
                      file.type.startsWith('image/')
                        ? 'fas fa-image'
                        : 'fas fa-file'
                    "
                    class="text-surface-400"
                  />
                  <span
                    class="cursor-pointer hover:text-primary-400"
                    @click="
                      file.type.startsWith('image/') && emit('openImage', file)
                    "
                  >
                    {{ file.name }}
                  </span>
                </div>
              </div>
              <div
                class="text-sm leading-relaxed"
                @click="handleContentClick"
                v-html="formatContent(message.content)"
              />
            </div>
          </div>

          <div v-if="isLoading" class="flex gap-3">
            <div
              class="w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center flex-shrink-0"
            >
              <i class="fas fa-robot text-xs" />
            </div>
            <div class="bg-surface-800 rounded-lg p-3">
              <div class="flex items-center gap-2 text-sm text-surface-400">
                <i class="fas fa-spinner fa-spin" />
                <span>{{ currentStatus || "Thinking..." }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Card>

  <ContextMenu ref="contextMenuRef" :model="contextMenuItems" />
</template>
