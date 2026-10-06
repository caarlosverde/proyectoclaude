/** Entorno «claude.ai artifact»: la página expone window.claude.use(). */
interface ClaudeRuntime {
  use(name: "downloads"): Promise<{ save(r: { filename: string; data: string | Blob }): Promise<{ status: string }> } | null>;
}

function runtime(): ClaudeRuntime | undefined {
  return (window as unknown as { claude?: ClaudeRuntime }).claude;
}

export type SaveOutcome = "saved" | "declined" | "unavailable";

/**
 * Descarga un archivo funcionando tanto en un dominio normal como dentro
 * de un visor aislado (donde las descargas deben pasar por el runtime).
 */
export async function saveFile(filename: string, data: Blob | string, type = "application/octet-stream"): Promise<SaveOutcome> {
  const blob = typeof data === "string" ? new Blob([data], { type }) : data;
  const rt = runtime();
  if (rt?.use) {
    try {
      const downloads = await rt.use("downloads");
      if (downloads) {
        await downloads.save({ filename, data: blob });
        return "saved";
      }
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code === "declined") return "declined";
      if (code && code !== "unavailable" && code !== "not_granted") return "unavailable";
    }
  }
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return "saved";
  } catch {
    return "unavailable";
  }
}
