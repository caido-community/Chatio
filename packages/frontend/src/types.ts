import type { Caido } from "@caido/sdk-frontend";

import { type API, type BackendEvents } from "../../backend/src/index";

export type FrontendSDK = Caido<API, BackendEvents>;
