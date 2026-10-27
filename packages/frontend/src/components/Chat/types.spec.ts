import { describe, expect, it } from "vitest";

import { chatSelection, type ChatSession, updateChatSelection } from "./types";

const chat = (): ChatSession => ({
  id: "chat-1",
  title: "Chat",
  messages: [
    {
      id: "m1",
      role: "assistant",
      content: "hi",
      timestamp: new Date(1),
      provider: "work",
      model: "model-a",
    },
  ],
  timestamp: new Date(1),
  messageCount: 1,
  selectedProvider: "work",
  selectedModel: "model-a",
  selectedModule: "Model A",
});

const modelB = {
  selectedProvider: "personal",
  selectedModel: "model-b",
  selectedModule: "Model B",
};

describe("updateChatSelection", () => {
  it("stores a picked model on the chat so reloading it restores the pick", () => {
    const history = [chat()];

    expect(updateChatSelection(history, "chat-1", modelB)).toBe(true);
    expect(history).toEqual([{ ...chat(), ...modelB }]);
  });

  it("does not create history entries for chats that were never saved", () => {
    const history = [chat()];

    expect(updateChatSelection(history, "unsaved", modelB)).toBe(false);
    expect(history).toEqual([chat()]);
  });
});

describe("chatSelection", () => {
  const stale = { selectedProvider: "work", selectedModel: "model-a" };
  const saved = { selectedProvider: "personal", selectedModel: "model-b" };

  it("prefers the saved app state pair over stale chat fields", () => {
    expect(chatSelection(stale, saved)).toEqual(saved);
  });

  it("uses the chat's own pair when no preference is given", () => {
    expect(chatSelection(stale)).toEqual(stale);
  });

  it("never merges partial pairs", () => {
    expect(chatSelection(stale, { selectedProvider: "personal" })).toEqual(
      stale,
    );
    expect(chatSelection({ selectedProvider: "work" })).toBeUndefined();
    expect(
      chatSelection({ selectedModel: "model-a" }, { selectedModel: "model-b" }),
    ).toBeUndefined();
  });
});
