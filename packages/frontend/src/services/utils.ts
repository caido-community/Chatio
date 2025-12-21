import type { FrontendSDK } from "../types";

export const showToast = (
  sdk: FrontendSDK | null,
  message: string,
  variant: "success" | "error" = "success",
) => {
  try {
    if (sdk?.window?.showToast) {
      sdk.window.showToast(message, {
        variant,
        duration: 3000,
      });
      return;
    }

    console.log(`[${variant.toUpperCase()}] ${message}`);
  } catch (error) {
    console.error("Toast error:", error);
    console.log(`[${variant.toUpperCase()}] ${message}`);
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy text:", error);

    try {
      const tempInput = document.createElement("input");
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      return true;
    } catch (e) {
      console.error("Fallback copy method failed:", e);
      return false;
    }
  }
};

export const downloadFile = (
  content: string | { name: string; content: string; type: string },
  filename?: string,
  mimeType?: string,
) => {
  try {
    let finalContent: string;
    let finalFilename: string;
    let finalMimeType: string;

    if (typeof content === "string") {
      finalContent = content;
      finalFilename = filename!;
      finalMimeType = mimeType || "application/octet-stream";

      const blob = new Blob([finalContent], { type: finalMimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = finalFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const file = content;
      let fileContent = file.content;
      let fileMimeType = "application/octet-stream";

      if (fileContent.startsWith("data:")) {
        const matches = fileContent.match(/^data:([^;]+);base64,(.+)$/);
        if (matches && matches[1] && matches[2]) {
          fileMimeType = matches[1];
          fileContent = matches[2];
          const byteCharacters = atob(fileContent);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: fileMimeType });

          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          return;
        }
      }

      const blob = new Blob([fileContent], { type: fileMimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error("Failed to download file:", error);
    throw error;
  }
};
