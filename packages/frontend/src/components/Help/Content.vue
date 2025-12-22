<script setup lang="ts">
const aboutInfo = {
  name: "Chatio",
  version: "2.0.0",
  description:
    "Chatio is an AI-powered security assistant plugin for Caido, helping you analyze requests, review code, and get expert security guidance.",
  author: {
    name: "Amr Elsagaei",
    website: "https://amrelsagaei.com",
    email: "info@amrelsagaei.com",
    linkedin: "https://www.linkedin.com/in/amrelsagaei",
    twitter: "https://x.com/amrelsagaei",
  },
};
</script>

<template>
  <div class="max-w-3xl space-y-12 pb-[36rem]">
    <section id="getting-started">
      <h2 class="text-2xl font-semibold mb-4">Getting Started</h2>
      <p class="text-surface-300 leading-relaxed mb-4">
        Chatio is an AI-powered security assistant plugin for Caido. It
        integrates with Caido's AI SDK to provide intelligent analysis of HTTP
        requests, code review, vulnerability assessment, and expert security
        guidance directly within your testing workflow.
      </p>
      <p class="text-surface-300 leading-relaxed mb-6">
        Chatio leverages Caido's built-in AI provider system, supporting
        OpenRouter, OpenAI, Anthropic Claude, and Google Gemini models.
      </p>

      <div class="border border-surface-700 rounded p-4">
        <h3 class="text-lg font-semibold mb-3">Quick Start</h3>
        <ol class="list-decimal list-inside space-y-2 text-surface-300">
          <li>
            Go to <strong>Caido Settings → AI</strong> to configure your API
            keys
          </li>
          <li>
            Select your preferred AI provider and model from the chat input
          </li>
          <li>Start chatting with the AI assistant</li>
          <li>
            Use
            <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs">@</code>
            to mention Replay sessions for context
          </li>
        </ol>
      </div>
    </section>

    <section id="configuration">
      <h2 class="text-2xl font-semibold mb-4">Configuration</h2>
      <p class="text-surface-300 leading-relaxed mb-6">
        Chatio uses Caido's AI SDK for provider management. Configure your API
        keys in Caido's settings.
      </p>

      <div class="space-y-4">
        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">Supported Providers</h3>
          <div class="space-y-3">
            <div class="border-l-4 border-primary-400 pl-4">
              <h4 class="font-semibold">OpenRouter</h4>
              <p class="text-surface-300 text-sm">
                Access multiple AI models through a single API key. Includes
                Claude, GPT, Gemini, and more.
              </p>
            </div>
            <div class="border-l-4 border-primary-400 pl-4">
              <h4 class="font-semibold">OpenAI</h4>
              <p class="text-surface-300 text-sm">
                Direct access to GPT-4o, GPT-4o-mini, and other OpenAI models.
              </p>
            </div>
            <div class="border-l-4 border-primary-400 pl-4">
              <h4 class="font-semibold">Anthropic</h4>
              <p class="text-surface-300 text-sm">
                Access to Claude 4 Sonnet, Claude 4 Opus, and other Anthropic
                models.
              </p>
            </div>
            <div class="border-l-4 border-primary-400 pl-4">
              <h4 class="font-semibold">Google</h4>
              <p class="text-surface-300 text-sm">
                Access to Gemini 2.5 Flash, Gemini 2.5 Pro, and other Google AI
                models.
              </p>
            </div>
          </div>
        </div>

        <div class="bg-surface-800 border border-surface-700 rounded p-4">
          <p class="text-surface-300 text-sm">
            <i class="fas fa-info-circle text-primary-400 mr-2"></i>
            <strong>How to Configure:</strong> Go to
            <strong>Caido Settings → AI</strong> and add your API key for your
            preferred provider.
          </p>
        </div>
      </div>
    </section>

    <section id="features">
      <h2 class="text-2xl font-semibold mb-4">Features</h2>

      <div class="space-y-6">
        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">Replay Session Mentions</h3>
          <p class="text-surface-300 leading-relaxed mb-3">
            Reference HTTP requests from your Replay sessions directly in chat:
          </p>
          <ul class="list-disc list-inside space-y-1 text-surface-300 ml-4">
            <li>
              Type
              <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                >@</code
              >
              to see available sessions
            </li>
            <li>
              Select a session to include the raw HTTP request in your message
            </li>
            <li>
              Ask the AI to analyze, modify, or find vulnerabilities in the
              request
            </li>
          </ul>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">File & Image Attachments</h3>
          <p class="text-surface-300 leading-relaxed mb-3">
            Upload files or images for analysis:
          </p>
          <ul class="list-disc list-inside space-y-1 text-surface-300 ml-4">
            <li>Source code files for security review</li>
            <li>Screenshots and images (requires vision-capable models)</li>
            <li>Configuration files and documentation</li>
            <li>Drag and drop or use the attachment button</li>
          </ul>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">Chat History</h3>
          <p class="text-surface-300 leading-relaxed">
            Your conversations are saved per project. Create new chats, rename
            them, export conversations, and switch between different analysis
            sessions from the sidebar.
          </p>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">Model Switching</h3>
          <p class="text-surface-300 leading-relaxed">
            Switch between AI providers and models on the fly. Each chat
            remembers its selected model, so you can use different models for
            different analysis tasks.
          </p>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">Real-time Streaming</h3>
          <p class="text-surface-300 leading-relaxed">
            AI responses stream in real-time as they're generated, so you can
            see the output immediately and stop generation if needed.
          </p>
        </div>
      </div>
    </section>

    <section id="settings">
      <h2 class="text-2xl font-semibold mb-4">Settings</h2>
      <p class="text-surface-300 leading-relaxed mb-6">
        Configure Chatio to match your workflow in Settings:
      </p>

      <div class="space-y-4">
        <div class="border border-surface-700 rounded p-4">
          <h4 class="font-semibold mb-2">System Prompt</h4>
          <p class="text-surface-300 text-sm">
            Customize the AI's behavior. The default prompt configures it as a
            senior cybersecurity specialist, but you can modify it for specific
            tasks or personas.
          </p>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h4 class="font-semibold mb-2">Context Messages</h4>
          <p class="text-surface-300 text-sm">
            Controls how many previous messages are sent as context. Higher
            values provide better conversation continuity but use more tokens.
            Default: 25 messages.
          </p>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h4 class="font-semibold mb-2">Auto-save</h4>
          <p class="text-surface-300 text-sm">
            When enabled, your conversations are automatically saved and
            restored between sessions.
          </p>
        </div>
      </div>
    </section>

    <section id="troubleshooting">
      <h2 class="text-2xl font-semibold mb-4">Troubleshooting</h2>

      <div class="space-y-4">
        <div class="pb-4 border-b border-surface-700">
          <h5 class="font-semibold mb-2">AI Request Failed</h5>
          <p class="text-surface-300 text-sm">
            This usually indicates an API key or billing issue. Go to
            <strong>Caido Settings → AI</strong>
            to verify your API key is configured correctly. Check your provider
            account for billing status.
          </p>
        </div>

        <div class="pb-4 border-b border-surface-700">
          <h5 class="font-semibold mb-2">No Response Received</h5>
          <p class="text-surface-300 text-sm">
            The AI provider may be experiencing issues. Try a different model or
            wait a moment. Check that your API key has sufficient credits.
          </p>
        </div>

        <div class="pb-4 border-b border-surface-700">
          <h5 class="font-semibold mb-2">Rate Limit Exceeded</h5>
          <p class="text-surface-300 text-sm">
            You've made too many requests in a short time. Wait a minute before
            trying again. Consider upgrading your API plan for higher limits.
          </p>
        </div>

        <div class="pb-4 border-b border-surface-700">
          <h5 class="font-semibold mb-2">Model Not Available</h5>
          <p class="text-surface-300 text-sm">
            Some models require specific API access. Check that your provider
            account has access to the selected model.
          </p>
        </div>

        <div class="pb-4 border-b border-surface-700 last:border-b-0">
          <h5 class="font-semibold mb-2">Images Not Working</h5>
          <p class="text-surface-300 text-sm">
            Image analysis requires vision-capable models like GPT-4o, Claude 3,
            or Gemini models. Make sure you're using a compatible model.
          </p>
        </div>
      </div>
    </section>

    <section id="about">
      <h2 class="text-2xl font-semibold mb-4">About</h2>
      <p class="text-surface-300 leading-relaxed mb-6">
        {{ aboutInfo.description }}
      </p>

      <div class="border border-surface-700 rounded p-4">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-xl font-bold">{{ aboutInfo.name }}</h3>
            <p class="text-sm text-surface-400">
              Version {{ aboutInfo.version }}
            </p>
          </div>
        </div>

        <div class="pt-4 border-t border-surface-700">
          <div
            class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
          >
            <div class="text-sm text-surface-300">
              <span class="font-medium">Made with</span>
              <i class="fas fa-heart text-primary-400 mx-1"></i>
              <span class="font-medium">by</span>
              <a
                :href="aboutInfo.author.website"
                target="_blank"
                class="font-medium text-primary-400 hover:text-primary-300 transition-colors ml-1"
              >
                {{ aboutInfo.author.name }}
              </a>
            </div>
            <div class="flex gap-4">
              <a
                :href="`mailto:${aboutInfo.author.email}`"
                class="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
              >
                <i class="fas fa-envelope"></i>
                Email
              </a>
              <a
                :href="aboutInfo.author.linkedin"
                target="_blank"
                class="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
              >
                <i class="fab fa-linkedin"></i>
                LinkedIn
              </a>
              <a
                :href="aboutInfo.author.twitter"
                target="_blank"
                class="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
              >
                <i class="fab fa-x-twitter"></i>
                X/Twitter
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
