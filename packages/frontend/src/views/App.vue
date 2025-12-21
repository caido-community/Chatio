<script setup lang="ts">
import MenuBar from "primevue/menubar";
import { computed, onMounted, ref } from "vue";

import { Chat } from "@/components/Chat";
import { Help } from "@/components/Help";
import { Settings } from "@/components/settings";
import { useSDK } from "@/plugins/sdk";
import { CaidoStorageService } from "@/services/storage";

const sdk = useSDK();
const storageService = new CaidoStorageService(sdk);

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

const isConfigured = ref(false);

const checkConfiguration = async () => {
  try {
    const settings = await storageService.getSettings();
    if (settings === null) {
      isConfigured.value = false;
      return;
    }

    const providers = settings.providers;
    if (providers === undefined) {
      isConfigured.value = false;
      return;
    }

    for (const config of Object.values(providers)) {
      const providerConfig = config as { apiKey?: string };
      if (
        providerConfig.apiKey !== undefined &&
        providerConfig.apiKey.trim() !== ""
      ) {
        isConfigured.value = true;
        return;
      }
    }
    isConfigured.value = false;
  } catch {
    isConfigured.value = false;
  }
};

onMounted(async () => {
  await checkConfiguration();

  window.addEventListener("chatio-settings-updated", checkConfiguration);
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

      <template #end>
        <div class="flex items-center gap-2 flex-shrink-0">
          <div
            :class="[
              'w-2 h-2 rounded-full',
              isConfigured ? 'bg-green-500' : 'bg-red-500',
            ]"
          ></div>
          <span class="text-sm text-gray-400">
            {{ isConfigured ? "Connected" : "Not configured" }}
          </span>
        </div>
      </template>
    </MenuBar>
    <div class="flex-1 min-h-0">
      <component :is="component" />
    </div>
  </div>
</template>
