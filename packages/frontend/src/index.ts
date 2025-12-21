import "./styles/index.css";

import { Classic } from "@caido/primevue";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";
import { createApp } from "vue";

import { SDKPlugin } from "./plugins/sdk";
import type { FrontendSDK } from "./types";
import App from "./views/App.vue";

export const init = (sdk: FrontendSDK) => {
  const app = createApp(App);

  app.use(PrimeVue, {
    unstyled: true,
    pt: Classic,
  });

  app.directive("tooltip", Tooltip);

  app.use(SDKPlugin, sdk);

  const root = document.createElement("div");
  Object.assign(root.style, {
    height: "100%",
    width: "100%",
  });

  root.id = `plugin--chatio`;

  app.mount(root);

  sdk.navigation.addPage("/chatio", {
    body: root,
  });

  sdk.sidebar.registerItem("Chatio", "/chatio", {
    icon: "fas fa-robot",
  });
};
