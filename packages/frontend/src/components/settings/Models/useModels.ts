import { computed, onMounted, ref } from "vue";

import { useSDK } from "@/plugins/sdk";
import { useStorage } from "@/services/storage";
import {
  defaultEnabledModels,
  defaultModels,
  type ModelItem,
  type ModelUserConfig,
  type Provider,
  providers,
} from "@/stores/models";

interface ModelWithState extends ModelItem {
  enabled: boolean;
}

export const useModels = () => {
  const sdk = useSDK();
  const storageService = useStorage(sdk);

  const searchQuery = ref("");
  const isAddDialogVisible = ref(false);
  const selectedProvider = ref<Provider | "all">("all");
  const modelConfigs = ref<Record<string, ModelUserConfig>>({});
  const customModels = ref<ModelItem[]>([]);
  const isLoading = ref(true);

  const allModels = computed<ModelItem[]>(() => {
    const hydratedCustomModels = customModels.value.map((m) => ({
      ...m,
      icon: providers.find((p) => p.id === m.provider)?.icon,
    }));
    return [...defaultModels, ...hydratedCustomModels];
  });

  const modelsWithState = computed<ModelWithState[]>(() => {
    return allModels.value.map((model) => {
      const config = modelConfigs.value[model.id];
      const enabled =
        config !== undefined
          ? config.enabled
          : defaultEnabledModels.has(model.id);
      return { ...model, enabled };
    });
  });

  const filteredModels = computed<ModelWithState[]>(() => {
    let models = modelsWithState.value;

    if (selectedProvider.value !== "all") {
      models = models.filter((m) => m.provider === selectedProvider.value);
    }

    if (searchQuery.value.trim() !== "") {
      const query = searchQuery.value.toLowerCase();
      models = models.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.id.toLowerCase().includes(query),
      );
    }

    return models;
  });

  const providerOptions = computed(() => [
    { id: "all" as const, name: "All Providers", icon: undefined },
    ...providers,
  ]);

  const toggleModel = async (model: ModelWithState) => {
    const newEnabled = !model.enabled;
    modelConfigs.value = {
      ...modelConfigs.value,
      [model.id]: { id: model.id, enabled: newEnabled },
    };
    await storageService.setModelConfigs(modelConfigs.value);
  };

  const addCustomModel = async (model: ModelItem) => {
    const newModel: ModelItem = {
      ...model,
      isCustom: true,
    };
    customModels.value = [...customModels.value, newModel];
    modelConfigs.value = {
      ...modelConfigs.value,
      [newModel.id]: { id: newModel.id, enabled: true },
    };
    await storageService.setCustomModels(customModels.value);
    await storageService.setModelConfigs(modelConfigs.value);
    isAddDialogVisible.value = false;
  };

  const removeCustomModel = async (modelId: string) => {
    customModels.value = customModels.value.filter((m) => m.id !== modelId);
    const newConfigs = { ...modelConfigs.value };
    delete newConfigs[modelId];
    modelConfigs.value = newConfigs;
    await storageService.setCustomModels(customModels.value);
    await storageService.setModelConfigs(modelConfigs.value);
  };

  const isCustomModel = (modelId: string): boolean => {
    return customModels.value.some((m) => m.id === modelId);
  };

  const loadData = async () => {
    isLoading.value = true;
    modelConfigs.value = await storageService.getModelConfigs();
    customModels.value = await storageService.getCustomModels();
    isLoading.value = false;
  };

  onMounted(loadData);

  return {
    searchQuery,
    isAddDialogVisible,
    selectedProvider,
    filteredModels,
    providerOptions,
    isLoading,
    toggleModel,
    addCustomModel,
    removeCustomModel,
    isCustomModel,
  };
};
