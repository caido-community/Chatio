<script setup lang="ts"></script>

<template>
  <div class="max-w-3xl space-y-12 pb-[36rem]">
    <section id="getting-started">
      <h2 class="text-2xl font-semibold mb-4">Getting Started</h2>
      <p class="text-surface-300 leading-relaxed mb-4">
        Chatio is an AI-powered security assistant plugin for Caido. It helps
        you analyze HTTP requests, review code for vulnerabilities, and get
        expert security guidance directly within your testing workflow.
      </p>
      <p class="text-surface-300 leading-relaxed">
        To get started, you need to configure at least one AI provider with a
        valid API key. Chatio supports OpenAI, Anthropic Claude, Google Gemini,
        DeepSeek, and local LLMs via Ollama.
      </p>
    </section>

    <section id="providers">
      <h2 class="text-2xl font-semibold mb-4">Configure Providers</h2>
      <p class="text-surface-300 leading-relaxed mb-6">
        Chatio supports multiple AI providers. You only need to configure one to
        get started:
      </p>

      <div class="space-y-4">
        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-2 text-green-400">
            Recommended for Beginners
          </h3>
          <div class="space-y-2 text-surface-300">
            <p>
              <strong>Google Gemini</strong> - Free tier available with generous
              limits
            </p>
            <p>
              <strong>Local LLMs (Ollama)</strong> - Completely free and
              private, runs on your machine
            </p>
          </div>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-2 text-blue-400">
            For Professional Use
          </h3>
          <div class="space-y-2 text-surface-300">
            <p><strong>OpenAI GPT-4o</strong> - Best overall performance</p>
            <p>
              <strong>Claude 3.5 Sonnet</strong> - Excellent for code analysis
            </p>
            <p><strong>DeepSeek</strong> - Very competitive pricing</p>
          </div>
        </div>
      </div>
    </section>

    <section id="settings">
      <h2 class="text-2xl font-semibold mb-4">Settings</h2>
      <p class="text-surface-300 leading-relaxed mb-6">
        Configure Chatio to match your workflow:
      </p>

      <div class="space-y-4">
        <div class="border border-surface-700 rounded p-4">
          <h4 class="font-semibold mb-2">System Prompt</h4>
          <p class="text-surface-300 text-sm">
            Customize the AI's behavior. The default prompt configures it as a
            senior security specialist, but you can modify it for specific
            tasks.
          </p>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h4 class="font-semibold mb-2">Context Messages</h4>
          <p class="text-surface-300 text-sm">
            Controls how many previous messages are sent for context. Higher
            values provide better context but use more tokens. Default: 20
            messages.
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

    <section id="features">
      <h2 class="text-2xl font-semibold mb-4">Features</h2>

      <div class="space-y-6">
        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">File & Image Analysis</h3>
          <p class="text-surface-300 leading-relaxed mb-3">
            Upload files or images directly in the chat for analysis:
          </p>
          <ul class="list-disc list-inside space-y-1 text-surface-300 ml-4">
            <li>Source code files for security review</li>
            <li>Screenshots of error messages or UI</li>
            <li>Configuration files for analysis</li>
            <li>Network diagrams and documentation</li>
          </ul>
          <div class="bg-amber-900/20 border border-amber-800 rounded p-3 mt-3">
            <p class="text-amber-200 text-sm">
              <i class="fas fa-info-circle mr-2"></i>
              Image analysis requires a vision-capable model: GPT-4o, Claude 3,
              Gemini, or llava/bakllava for local LLMs.
            </p>
          </div>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">Chat History</h3>
          <p class="text-surface-300 leading-relaxed">
            Your conversations are organized in a sidebar. You can create new
            chats, rename them, and switch between different analysis sessions.
          </p>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">Model Switching</h3>
          <p class="text-surface-300 leading-relaxed">
            Switch between different AI models on the fly. Use faster models for
            quick questions and more powerful ones for complex analysis.
          </p>
        </div>
      </div>
    </section>

    <section id="api-keys">
      <h2 class="text-2xl font-semibold mb-4">API Keys Setup</h2>

      <div class="space-y-6">
        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">OpenAI</h3>
          <ol class="list-decimal list-inside space-y-2 text-surface-300 ml-4">
            <li>
              Visit
              <a
                href="https://platform.openai.com"
                target="_blank"
                class="text-primary-400 hover:underline"
                >platform.openai.com</a
              >
            </li>
            <li>Navigate to API section → API Keys</li>
            <li>Click "Create new secret key"</li>
            <li>Add billing information (required)</li>
          </ol>
          <div
            class="bg-amber-900/20 border border-amber-700/50 rounded p-2 mt-3 text-xs text-amber-300"
          >
            $5 credit for new accounts (expires after 3 months)
          </div>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">Anthropic Claude</h3>
          <ol class="list-decimal list-inside space-y-2 text-surface-300 ml-4">
            <li>
              Go to
              <a
                href="https://console.anthropic.com"
                target="_blank"
                class="text-primary-400 hover:underline"
                >console.anthropic.com</a
              >
            </li>
            <li>Navigate to API Keys section</li>
            <li>Click "Create Key" and name it</li>
            <li>Copy the key (starts with 'sk-ant-')</li>
          </ol>
          <div
            class="bg-amber-900/20 border border-amber-700/50 rounded p-2 mt-3 text-xs text-amber-300"
          >
            $5 credit for new accounts
          </div>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">Google Gemini</h3>
          <ol class="list-decimal list-inside space-y-2 text-surface-300 ml-4">
            <li>
              Visit
              <a
                href="https://aistudio.google.com"
                target="_blank"
                class="text-primary-400 hover:underline"
                >aistudio.google.com</a
              >
            </li>
            <li>Click "Get API key" in sidebar</li>
            <li>Create new API key</li>
            <li>Copy the key (starts with 'AIza')</li>
          </ol>
          <div
            class="bg-green-900/20 border border-green-700/50 rounded p-2 mt-3 text-xs text-green-300"
          >
            Free tier: 15 requests/min, 1,500 requests/day
          </div>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">DeepSeek</h3>
          <ol class="list-decimal list-inside space-y-2 text-surface-300 ml-4">
            <li>
              Go to
              <a
                href="https://platform.deepseek.com"
                target="_blank"
                class="text-primary-400 hover:underline"
                >platform.deepseek.com</a
              >
            </li>
            <li>Verify email and phone</li>
            <li>Navigate to API Keys section</li>
            <li>Create new key and copy it</li>
          </ol>
          <div
            class="bg-amber-900/20 border border-amber-700/50 rounded p-2 mt-3 text-xs text-amber-300"
          >
            $5 credit for new users
          </div>
        </div>
      </div>
    </section>

    <section id="local-llm">
      <h2 class="text-2xl font-semibold mb-4">Local LLM (Ollama)</h2>
      <p class="text-surface-300 leading-relaxed mb-6">
        Run AI models locally for complete privacy and no API costs:
      </p>

      <div class="space-y-4">
        <div class="border border-surface-700 rounded p-4">
          <h4 class="font-semibold mb-3">Installation</h4>
          <ol class="list-decimal list-inside space-y-2 text-surface-300 ml-4">
            <li>
              Download from
              <a
                href="https://ollama.ai"
                target="_blank"
                class="text-primary-400 hover:underline"
                >ollama.ai</a
              >
            </li>
            <li>Install and start the service</li>
            <li>
              Default runs on
              <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                >localhost:11434</code
              >
            </li>
          </ol>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h4 class="font-semibold mb-3">Recommended Models</h4>
          <div class="space-y-2">
            <div class="bg-surface-900 rounded p-2 font-mono text-xs">
              ollama pull llama3.2
            </div>
            <div class="bg-surface-900 rounded p-2 font-mono text-xs">
              ollama pull codellama
            </div>
            <div class="bg-surface-900 rounded p-2 font-mono text-xs">
              ollama pull llava
              <span class="text-surface-500 ml-2">(for image analysis)</span>
            </div>
          </div>
        </div>

        <div class="bg-surface-800 border border-surface-700 rounded p-4">
          <h4 class="font-semibold mb-2">Benefits</h4>
          <ul class="list-disc list-inside space-y-1 text-surface-300 ml-4">
            <li>100% Free - no API costs</li>
            <li>Complete privacy - data never leaves your machine</li>
            <li>No rate limits</li>
            <li>Works offline</li>
          </ul>
        </div>
      </div>
    </section>

    <section id="troubleshooting">
      <h2 class="text-2xl font-semibold mb-4">Troubleshooting</h2>

      <div class="space-y-4">
        <div class="border border-surface-700 rounded p-4">
          <h4 class="font-semibold mb-2">Connection Failed</h4>
          <ul class="list-disc list-inside space-y-1 text-surface-300 ml-4">
            <li>Verify your API key is correct</li>
            <li>Check if your account has credits</li>
            <li>Ensure no network or firewall issues</li>
          </ul>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h4 class="font-semibold mb-2">Slow Responses</h4>
          <ul class="list-disc list-inside space-y-1 text-surface-300 ml-4">
            <li>Try a faster model (GPT-4o-mini, Claude Haiku)</li>
            <li>Reduce the context message count</li>
            <li>For local LLMs, check system resources (RAM, GPU)</li>
          </ul>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h4 class="font-semibold mb-2">Images Not Working</h4>
          <ul class="list-disc list-inside space-y-1 text-surface-300 ml-4">
            <li>Use vision-capable models (GPT-4o, Claude 3, Gemini)</li>
            <li>For local LLMs: use llava or bakllava</li>
            <li>Check image file size limits</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>
