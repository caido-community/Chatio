import type { FrontendSDK } from "../types";

export const showToast = (
  sdk: FrontendSDK | undefined,
  message: string,
  variant: "success" | "error" = "success",
) => {
  try {
    if (sdk?.window?.showToast !== undefined) {
      sdk.window.showToast(message, { variant, duration: 3000 });
    }
  } catch {
    // Ignore error
  }
};

export const downloadFile = (
  content: string | { name: string; content: string; type: string },
  filename?: string,
  mimeType?: string,
) => {
  let finalContent: string;
  let finalFilename: string;
  let finalMimeType: string;

  if (typeof content === "string") {
    finalContent = content;
    finalFilename = filename ?? "";
    finalMimeType = mimeType ?? "application/octet-stream";

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
      if (
        matches !== null &&
        matches[1] !== undefined &&
        matches[2] !== undefined
      ) {
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
};
