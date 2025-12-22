<script setup lang="ts">
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import { ref } from "vue";

import { type ModelItem, Provider, providers } from "@/stores/models";

const { visible } = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  add: [model: ModelItem];
}>();

const name = ref("");
const modelId = ref("");
const provider = ref<Provider>(Provider.OpenRouter);
const isReasoningModel = ref(false);

const providerOptions = providers.map((p) => ({
  label: p.name,
  value: p.id,
}));

const handleSave = () => {
  if (name.value.trim() === "" || modelId.value.trim() === "") return;

  emit("add", {
    name: name.value.trim(),
    id: modelId.value.trim(),
    provider: provider.value,
    isCustom: true,
    isReasoningModel: isReasoningModel.value,
  });

  resetForm();
};

const handleCancel = () => {
  resetForm();
  emit("update:visible", false);
};

const resetForm = () => {
  name.value = "";
  modelId.value = "";
  provider.value = Provider.OpenRouter;
  isReasoningModel.value = false;
};
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    header="Add Custom Model"
    :style="{ width: '28rem' }"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <label for="provider" class="font-medium text-surface-200">
          Provider
        </label>
        <Select
          id="provider"
          v-model="provider"
          :options="providerOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="name" class="font-medium text-surface-200">
          Display Name
        </label>
        <InputText
          id="name"
          v-model="name"
          placeholder="My Custom Model"
          class="w-full"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="modelId" class="font-medium text-surface-200">
          Model ID
        </label>
        <InputText
          id="modelId"
          v-model="modelId"
          placeholder="custom/my-model-name"
          class="w-full"
        />
        <small class="text-surface-400">
          The model identifier used by the API (e.g., gpt-4o, claude-3-opus)
        </small>
      </div>

      <div class="flex items-center gap-2">
        <Checkbox v-model="isReasoningModel" binary input-id="reasoning" />
        <label for="reasoning" class="text-surface-200 cursor-pointer">
          Is Reasoning Model
        </label>
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" text severity="secondary" @click="handleCancel" />
      <Button
        label="Add Model"
        :disabled="name.trim() === '' || modelId.trim() === ''"
        @click="handleSave"
      />
    </template>
  </Dialog>
</template>
