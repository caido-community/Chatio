<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import { reactive, ref } from "vue";

import { useSDK } from "@/plugins/sdk";
import { showToast } from "@/services/utils";

interface TestConnectionRequest {
  provider: string;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

const props = defineProps<{
  providers: {
    openai: { apiKey: string };
    anthropic: { apiKey: string };
    google: { apiKey: string };
    deepseek: { apiKey: string };
    local: { url: string; models: string; apiKey: string };
  };
}>();

const emit = defineEmits<{
  update: [providers: typeof props.providers];
}>();

const sdk = useSDK();

const showKeys = reactive({
  openai: false,
  anthropic: false,
  google: false,
  deepseek: false,
  local: false,
});

const testing = reactive({
  openai: false,
  anthropic: false,
  google: false,
  deepseek: false,
  local: false,
});

const connectionStatus = ref<{
  type: "success" | "error";
  message: string;
} | null>(null);

const testProvider = async (providerName: string) => {
  testing[providerName as keyof typeof testing] = true;
  connectionStatus.value = null;

  try {
    const provider =
      props.providers[providerName as keyof typeof props.providers];
    if (provider === undefined) {
      throw new Error(`Provider ${providerName} not found`);
    }

    let validationError = "";
    if (providerName === "local") {
      const localProvider = provider as typeof props.providers.local;
      if (localProvider.url.trim() === "") {
        validationError = "Server URL is required";
      } else if (localProvider.models.trim() === "") {
        validationError = "Please add model names to test";
      }
    } else {
      const apiProvider = provider as { apiKey: string };
      if (apiProvider.apiKey.trim() === "") {
        validationError = "API Key is required";
      }
    }

    if (validationError !== "") {
      throw new Error(validationError);
    }

    let testRequest: TestConnectionRequest;
    if (providerName === "local") {
      const localProvider = provider as typeof props.providers.local;
      testRequest = {
        provider: "local",
        apiKey: localProvider.apiKey,
        baseUrl: localProvider.url,
        model: localProvider.models,
      };
    } else {
      const apiProvider = provider as { apiKey: string };
      testRequest = {
        provider: providerName,
        apiKey: apiProvider.apiKey,
      };
    }

    const result = await sdk.backend.testConnection(testRequest);

    if (result.success) {
      let successMessage = `${providerName} connected!`;
      if (providerName === "local") {
        const data = result.data ?? {};
        const validModels = (data.validModels as string[]) ?? [];
        if (validModels.length > 0) {
          successMessage = `Ollama: ${validModels.length} model(s) working`;
        }
      }
      connectionStatus.value = { type: "success", message: successMessage };
      showToast(sdk, successMessage, "success");
      emit("update", props.providers);
    } else {
      const errorMsg = result.error ?? result.message ?? "Connection failed";
      connectionStatus.value = { type: "error", message: errorMsg };
      showToast(sdk, errorMsg, "error");
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    connectionStatus.value = { type: "error", message: errorMessage };
    showToast(sdk, errorMessage, "error");
  } finally {
    testing[providerName as keyof typeof testing] = false;
  }
};
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
            Configure your API keys for AI providers
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <!-- OpenAI -->
          <div class="p-4 bg-surface-800 rounded-lg space-y-3">
            <h4 class="font-medium flex items-center gap-2">
              <i class="fas fa-brain text-primary-400" />
              OpenAI
            </h4>
            <div>
              <label class="text-sm text-surface-400">API Key</label>
              <div class="flex gap-2 mt-1">
                <InputText
                  v-model="providers.openai.apiKey"
                  :type="showKeys.openai ? 'text' : 'password'"
                  placeholder="sk-..."
                  class="flex-1"
                />
                <Button
                  :icon="showKeys.openai ? 'fas fa-eye-slash' : 'fas fa-eye'"
                  text
                  @click="showKeys.openai = !showKeys.openai"
                />
              </div>
            </div>
            <Button
              label="Test"
              :loading="testing.openai"
              :disabled="providers.openai.apiKey === ''"
              size="small"
              class="w-full"
              @click="testProvider('openai')"
            />
          </div>

          <!-- Anthropic -->
          <div class="p-4 bg-surface-800 rounded-lg space-y-3">
            <h4 class="font-medium flex items-center gap-2">
              <i class="fas fa-robot text-primary-400" />
              Anthropic
            </h4>
            <div>
              <label class="text-sm text-surface-400">API Key</label>
              <div class="flex gap-2 mt-1">
                <InputText
                  v-model="providers.anthropic.apiKey"
                  :type="showKeys.anthropic ? 'text' : 'password'"
                  placeholder="sk-ant-..."
                  class="flex-1"
                />
                <Button
                  :icon="showKeys.anthropic ? 'fas fa-eye-slash' : 'fas fa-eye'"
                  text
                  @click="showKeys.anthropic = !showKeys.anthropic"
                />
              </div>
            </div>
            <Button
              label="Test"
              :loading="testing.anthropic"
              :disabled="providers.anthropic.apiKey === ''"
              size="small"
              class="w-full"
              @click="testProvider('anthropic')"
            />
          </div>

          <!-- Google -->
          <div class="p-4 bg-surface-800 rounded-lg space-y-3">
            <h4 class="font-medium flex items-center gap-2">
              <i class="fab fa-google text-primary-400" />
              Google Gemini
            </h4>
            <div>
              <label class="text-sm text-surface-400">API Key</label>
              <div class="flex gap-2 mt-1">
                <InputText
                  v-model="providers.google.apiKey"
                  :type="showKeys.google ? 'text' : 'password'"
                  placeholder="AIza..."
                  class="flex-1"
                />
                <Button
                  :icon="showKeys.google ? 'fas fa-eye-slash' : 'fas fa-eye'"
                  text
                  @click="showKeys.google = !showKeys.google"
                />
              </div>
            </div>
            <Button
              label="Test"
              :loading="testing.google"
              :disabled="providers.google.apiKey === ''"
              size="small"
              class="w-full"
              @click="testProvider('google')"
            />
          </div>

          <!-- DeepSeek -->
          <div class="p-4 bg-surface-800 rounded-lg space-y-3">
            <h4 class="font-medium flex items-center gap-2">
              <i class="fas fa-microchip text-primary-400" />
              DeepSeek
            </h4>
            <div>
              <label class="text-sm text-surface-400">API Key</label>
              <div class="flex gap-2 mt-1">
                <InputText
                  v-model="providers.deepseek.apiKey"
                  :type="showKeys.deepseek ? 'text' : 'password'"
                  placeholder="sk-..."
                  class="flex-1"
                />
                <Button
                  :icon="showKeys.deepseek ? 'fas fa-eye-slash' : 'fas fa-eye'"
                  text
                  @click="showKeys.deepseek = !showKeys.deepseek"
                />
              </div>
            </div>
            <Button
              label="Test"
              :loading="testing.deepseek"
              :disabled="providers.deepseek.apiKey === ''"
              size="small"
              class="w-full"
              @click="testProvider('deepseek')"
            />
          </div>
        </div>

        <!-- Local LLM -->
        <div class="p-4 bg-surface-800 rounded-lg space-y-3">
          <h4 class="font-medium flex items-center gap-2">
            <i class="fas fa-server text-primary-400" />
            Local LLM (Ollama)
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-surface-400">Server URL</label>
              <InputText
                v-model="providers.local.url"
                placeholder="http://localhost:11434"
                class="w-full mt-1"
              />
            </div>
            <div>
              <label class="text-sm text-surface-400"
                >Models (comma separated)</label
              >
              <InputText
                v-model="providers.local.models"
                placeholder="llama3.2, mistral"
                class="w-full mt-1"
              />
            </div>
          </div>
          <div>
            <label class="text-sm text-surface-400">API Key (optional)</label>
            <div class="flex gap-2 mt-1">
              <InputText
                v-model="providers.local.apiKey"
                :type="showKeys.local ? 'text' : 'password'"
                placeholder="Optional"
                class="flex-1"
              />
              <Button
                :icon="showKeys.local ? 'fas fa-eye-slash' : 'fas fa-eye'"
                text
                @click="showKeys.local = !showKeys.local"
              />
            </div>
          </div>
          <Button
            label="Test Connection"
            :loading="testing.local"
            :disabled="providers.local.url === ''"
            size="small"
            class="w-full"
            @click="testProvider('local')"
          />
        </div>

        <!-- Status -->
        <div
          v-if="connectionStatus !== null"
          class="p-3 rounded-lg text-sm"
          :class="
            connectionStatus.type === 'success'
              ? 'bg-green-900/20 border border-green-700/50 text-green-300'
              : 'bg-red-900/20 border border-red-700/50 text-red-300'
          "
        >
          <i
            :class="
              connectionStatus.type === 'success'
                ? 'fas fa-check-circle'
                : 'fas fa-times-circle'
            "
            class="mr-2"
          />
          {{ connectionStatus.message }}
        </div>
      </div>
    </template>
  </Card>
</template>
