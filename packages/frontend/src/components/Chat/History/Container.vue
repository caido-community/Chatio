<script setup lang="ts">
import Card from "primevue/card";
import ContextMenu from "primevue/contextmenu";
import InputText from "primevue/inputtext";
import { computed, nextTick, ref } from "vue";

import type { ChatSession } from "../types";
import { formatDate } from "../types";

const props = defineProps<{
    chatHistory: ChatSession[];
    currentChatId: string;
    isProjectChanging: boolean;
    editingChatId?: string;
    editingTitle: string;
}>();

const emit = defineEmits<{
    loadChat: [chatId: string];
    deleteChat: [chatId: string];
    startEdit: [chatId: string];
    saveEdit: [];
    cancelEdit: [];
    exportAll: [];
    updateEditTitle: [title: string];
}>();

const editInputRef = ref<HTMLInputElement>();
const contextMenuRef = ref<InstanceType<typeof ContextMenu>>();
const selectedChatId = ref<string>("");

const contextMenuItems = computed(() => [
    {
        label: "Rename",
        icon: "fas fa-edit",
        command: async () => {
            emit("startEdit", selectedChatId.value);
            await nextTick();
            editInputRef.value?.focus();
        },
    },
    {
        label: "Delete",
        icon: "fas fa-trash",
        command: () => {
            emit("deleteChat", selectedChatId.value);
        },
    },
]);

const showContextMenu = (event: MouseEvent, chatId: string) => {
    selectedChatId.value = chatId;
    contextMenuRef.value?.show(event);
};
</script>

<template>
    <Card class="h-full w-[240px]" :pt="{
        body: { class: 'h-full p-0 flex flex-col' },
        content: { class: 'h-full flex flex-col' },
    }">
        <template #content>
            <div class="p-3 border-b border-surface-700 flex items-center justify-between">
                <h3 class="text-sm font-semibold">Chat History</h3>
                <i v-tooltip="'Export All'"
                    class="fas fa-download text-surface-400 hover:text-white cursor-pointer transition-colors"
                    @click="emit('exportAll')" />
            </div>

            <div class="flex-1 overflow-auto">
                <div v-if="isProjectChanging" class="p-4 text-center text-surface-400 text-sm">
                    <i class="fas fa-spinner fa-spin mr-2" />Loading...
                </div>

                <div v-for="chat in chatHistory" :key="chat.id"
                    class="p-3 cursor-pointer border-b border-surface-800 hover:bg-surface-800 transition-colors"
                    :class="{ 'bg-surface-700': currentChatId === chat.id }" @click="emit('loadChat', chat.id)"
                    @contextmenu.prevent="showContextMenu($event, chat.id)">
                    <div v-if="editingChatId === chat.id" class="flex items-center gap-2">
                        <InputText ref="editInputRef" :model-value="editingTitle" class="flex-1 text-sm"
                            @update:model-value="emit('updateEditTitle', $event as string)"
                            @keyup.enter="emit('saveEdit')" @keyup.escape="emit('cancelEdit')" @click.stop />
                        <i class="fas fa-check text-green-400 hover:text-green-300 cursor-pointer"
                            @click.stop="emit('saveEdit')" />
                        <i class="fas fa-times text-surface-400 hover:text-white cursor-pointer"
                            @click.stop="emit('cancelEdit')" />
                    </div>

                    <div v-else>
                        <div class="text-sm font-medium truncate">{{ chat.title }}</div>
                        <div class="text-xs text-surface-500 mt-1">
                            {{ formatDate(chat.timestamp) }} • {{ chat.messageCount }} msgs
                        </div>
                    </div>
                </div>

                <div v-if="chatHistory.length === 0 && !isProjectChanging"
                    class="p-4 text-center text-surface-400 text-sm">
                    No chat history yet
                </div>
            </div>
        </template>
    </Card>

    <ContextMenu ref="contextMenuRef" :model="contextMenuItems" />
</template>
