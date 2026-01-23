<script setup lang="ts">
import DOMPurify from "dompurify";
import MarkdownIt from "markdown-it";
import { computed } from "vue";

const { content, variant = "default" } = defineProps<{
  content: string;
  variant?: "default" | "thinking";
}>();

const md = new MarkdownIt({
  breaks: true,
  linkify: true,
  html: false,
});

const rendered = computed(() => {
  const html = md.render(content);
  return DOMPurify.sanitize(html);
});
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <div
    :class="[
      'markdown-content break-words select-text font-mono',
      variant === 'thinking' ? 'thinking-variant' : 'text-sm',
    ]"
    v-html="rendered"
  ></div>
  <!-- eslint-enable vue/no-v-html -->
</template>

<style scoped>
.markdown-content {
  width: 90%;
}

.markdown-content :deep(p) {
  margin: 0.5em 0;
}

.markdown-content :deep(code) {
  background: rgba(255, 255, 255, 0.08);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
  color: #e0e0e0;
}

.markdown-content :deep(pre) {
  background: rgba(0, 0, 0, 0.3);
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.5em 0;
  width: 100%;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  margin: 0.8em 0 0.4em 0;
  font-weight: 600;
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid rgba(255, 255, 255, 0.15);
  padding-left: 1em;
  margin: 0.5em 0;
  color: rgba(255, 255, 255, 0.7);
}

.markdown-content :deep(a) {
  color: var(--p-primary-400);
  text-decoration: underline;
}

.markdown-content :deep(strong) {
  font-weight: 600;
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  margin: 1em 0;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.5em 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 0.5em;
  text-align: left;
}

/* Thinking variant - grey and smaller */
.thinking-variant {
  font-size: 0.75rem;
  color: var(--p-surface-400);
}

.thinking-variant :deep(*) {
  color: var(--p-surface-400);
}

.thinking-variant :deep(code) {
  background: rgba(255, 255, 255, 0.05);
  color: var(--p-surface-400);
  font-size: 0.7rem;
}

.thinking-variant :deep(pre) {
  background: rgba(0, 0, 0, 0.2);
}

.thinking-variant :deep(pre code) {
  color: var(--p-surface-400);
}
</style>
