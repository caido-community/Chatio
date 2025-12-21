import { ref } from "vue";

type Section = {
  id: string;
  title: string;
};

export const useSidebar = () => {
  const sections: Section[] = [
    { id: "getting-started", title: "Getting Started" },
    { id: "providers", title: "Configure Providers" },
    { id: "settings", title: "Settings" },
    { id: "features", title: "Features" },
    { id: "api-keys", title: "API Keys Setup" },
    { id: "local-llm", title: "Local LLM (Ollama)" },
    { id: "troubleshooting", title: "Troubleshooting" },
  ];

  const activeSection = ref<string>(sections[0]?.id ?? "");

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element !== null) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return {
    sections,
    activeSection,
    scrollToSection,
  };
};
