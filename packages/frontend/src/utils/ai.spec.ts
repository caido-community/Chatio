import type { AIUpstreamModel } from "@caido/sdk-frontend";
import { describe, expect, it, vi } from "vitest";

import type { FrontendSDK } from "../types";

import { createModel, findModel } from "./ai";

const model = (
  providerId: string,
  id: string,
  extra: Partial<AIUpstreamModel> = {},
): AIUpstreamModel => ({
  id,
  providerId,
  modelId: `${providerId}/${id}`,
  displayName: id,
  capabilities: ["REASONING"],
  support: {
    toolCalling: "UNKNOWN",
    reasoning: "SUPPORTED",
    structuredOutput: "UNKNOWN",
    temperature: "UNKNOWN",
    compaction: "UNKNOWN",
  },
  reasoningEfforts: [],
  source: "CATALOG",
  ...extra,
});

describe("model identity", () => {
  const registry = [
    model("personal", "gpt-5.5"),
    model("work", "gpt-5.5"),
    model("openrouter", "anthropic/claude-opus-4.8"),
  ];

  it("keeps identical model ids on different providers distinct", () => {
    expect(findModel(registry, "work", "gpt-5.5")).toBe(registry[1]);
    expect(findModel(registry, "personal", "gpt-5.5")).toBe(registry[0]);
    expect(findModel(registry, "missing", "gpt-5.5")).toBeUndefined();
  });

  it("maps legacy persisted selections onto the registry", () => {
    expect(
      findModel(registry, "OpenRouter", "anthropic/claude-opus-4.8:thinking"),
    ).toBe(registry[2]);
    expect(findModel(registry, "OpenRouter", "anthropic/claude-opus-4.8")).toBe(
      registry[2],
    );
    expect(findModel(registry, "OpenAI", "gpt-5.5")).toBeUndefined();
  });
});

describe("createModel", () => {
  const support = model("p", "m").support;
  const effort = (effort: string) => ({
    kind: "effort",
    effort,
    output: "include",
  });

  it.each<[Partial<AIUpstreamModel>, ReturnType<typeof effort> | undefined]>([
    [{ reasoningEfforts: ["minimal", "low", "high"] }, effort("low")],
    [{ reasoningEfforts: ["high", "max"] }, effort("high")],
    [{ reasoningEfforts: [] }, effort("medium")],
    [{ support: { ...support, reasoning: "UNKNOWN" } }, effort("medium")],
    [{ support: { ...support, reasoning: "UNSUPPORTED" } }, undefined],
  ])(
    "respects registry reasoning support and efforts %o",
    (extra, reasoning) => {
      const selected = model("p", "m", extra);
      const languageModel = vi.fn();
      const sdk = {
        ai: {
          getUpstreamModels: () => [selected],
          createProvider: () => languageModel,
        },
      } as unknown as FrontendSDK;

      createModel(sdk, selected);
      expect(languageModel).toHaveBeenCalledWith("p/m", { reasoning });
    },
  );

  it("refuses to dispatch to a model removed from the registry", () => {
    const languageModel = vi.fn();
    const sdk = {
      ai: {
        getUpstreamModels: () => [model("p", "other")],
        createProvider: () => languageModel,
      },
    } as unknown as FrontendSDK;

    expect(() => createModel(sdk, model("p", "m"))).toThrow(
      /no longer available/,
    );
    expect(languageModel).not.toHaveBeenCalled();
  });
});
