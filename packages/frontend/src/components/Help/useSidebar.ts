import { ref } from "vue";

type Section = {
  id: string;
  title: string;
};

export const useSidebar = () => {
  const sections: Section[] = [
    { id: "getting-started", title: "Getting Started" },
    { id: "configuration", title: "Configuration" },
    { id: "features", title: "Features" },
    { id: "settings", title: "Settings" },
    { id: "troubleshooting", title: "Troubleshooting" },
    { id: "about", title: "About" },
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
