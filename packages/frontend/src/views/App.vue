<script setup lang="ts">
import MenuBar from "primevue/menubar";
import { computed, ref } from "vue";

import { Chat } from "@/components/Chat";
import { Help } from "@/components/Help";
import { Settings } from "@/components/settings";

const page = ref<"Chat" | "Settings" | "Help">("Chat");
const items = [
  {
    label: "Chat",
    command: () => {
      page.value = "Chat";
    },
  },
  {
    label: "Settings",
    command: () => {
      page.value = "Settings";
    },
  },
  {
    label: "Help",
    command: () => {
      page.value = "Help";
    },
  },
];

const component = computed(() => {
  switch (page.value) {
    case "Chat":
      return Chat;
    case "Settings":
      return Settings;
    case "Help":
      return Help;
    default:
      return undefined;
  }
});
</script>

<template>
  <div class="h-full flex flex-col gap-1">
    <MenuBar breakpoint="320px">
      <template #start>
        <div class="flex">
          <div class="px-3 py-2 font-bold text-gray-300">Chatio</div>
          <div
            v-for="(item, index) in items"
            :key="index"
            class="px-3 py-2 cursor-pointer text-gray-300 rounded transition-all duration-200 ease-in-out"
            :class="{
              'bg-zinc-800/40': page === item.label,
              'hover:bg-gray-800/10': page !== item.label,
            }"
            @mousedown="item.command"
          >
            {{ item.label }}
          </div>
        </div>
      </template>
    </MenuBar>
    <div class="flex-1 min-h-0">
      <component :is="component" />
    </div>
  </div>
</template>
