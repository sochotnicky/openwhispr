import reasoningService from "../services/ReasoningService";
import type { ReasoningConfig } from "../services/BaseReasoningService";
import { getSettings } from "../stores/settingsStore";
import { extractTitle } from "../helpers/extractTitle.js";
import logger from "./logger";

const TITLE_SYSTEM_PROMPT =
  "Generate a concise 3-8 word title for these notes. Return ONLY the title text, nothing else — no quotes, no prefix, no explanation.";

export async function generateNoteTitle(
  text: string,
  modelId: string,
  config?: Pick<ReasoningConfig, "provider" | "baseUrl" | "customApiKey" | "lanUrl">
): Promise<string> {
  try {
    const raw = await reasoningService.processText(text.slice(0, 2000), modelId, null, {
      systemPrompt: TITLE_SYSTEM_PROMPT,
      temperature: 0.3,
      disableThinking: getSettings().noteFormattingDisableThinking,
      ...config,
    });
    const title = extractTitle(raw);
    logger.info(
      "Generated note title",
      { rawLength: raw?.length ?? 0, rawPreview: raw?.slice(0, 120), title, accepted: !!title },
      "notes"
    );
    return title;
  } catch (err) {
    logger.warn("Note title generation failed", { error: (err as Error).message }, "notes");
    return "";
  }
}
