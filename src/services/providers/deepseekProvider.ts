import type { ModelPayload, TaskType } from "@/types/app";
import { getSystemPrompt } from "@/services/prompts/promptRegistry";

export type DeepSeekResponse<T = unknown> = {
  ok: boolean;
  data?: T;
  source: "deepseek";
  error?: string;
};

export async function deepseekGenerate<T = unknown>(
  taskType: TaskType,
  payload: ModelPayload,
): Promise<DeepSeekResponse<T>> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_API_BASE_URL || "https://api.deepseek.com";
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";

  if (!apiKey) {
    return { ok: false, source: "deepseek", error: "missing_api_key" };
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: getSystemPrompt(taskType),
          },
          {
            role: "user",
            content: JSON.stringify({ taskType, payload }),
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { ok: false, source: "deepseek", error: `api_error_${response.status}: ${errorText}` };
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;

    if (!content) {
      return { ok: false, source: "deepseek", error: "empty_response" };
    }

    const parsed = JSON.parse(content) as T;
    return { ok: true, data: parsed, source: "deepseek" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return { ok: false, source: "deepseek", error: message };
  }
}
