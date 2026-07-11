import type { ModelPayload, TaskType, TopicRecommendation } from "@/types/app";
import { getSystemPrompt } from "@/services/prompts/promptRegistry";

export type DeepSeekResponse<T = unknown> = {
  ok: boolean;
  data?: T;
  source: "deepseek";
  error?: string;
};

function parseRecommendTopicResponse(value: unknown): TopicRecommendation[] | null {
  // Check top-level object
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const obj = value as Record<string, unknown>;

  // Check topics array exists
  if (!("topics" in obj)) {
    return null;
  }

  const topics = obj.topics;

  // Check topics is array
  if (!Array.isArray(topics)) {
    return null;
  }

  // Check exactly 3 topics
  if (topics.length !== 3) {
    return null;
  }

  // Validate each topic
  const validatedTopics: TopicRecommendation[] = [];
  const titles = new Set<string>();

  for (const topic of topics) {
    // Check topic is object
    if (typeof topic !== "object" || topic === null) {
      return null;
    }

    const t = topic as Record<string, unknown>;

    // Check required fields exist and are strings
    if (typeof t.title !== "string" || t.title.trim() === "") {
      return null;
    }
    if (typeof t.summary !== "string" || t.summary.trim() === "") {
      return null;
    }
    if (typeof t.whyFirst !== "string" || t.whyFirst.trim() === "") {
      return null;
    }

    // Check recommended is boolean
    if (typeof t.recommended !== "boolean") {
      return null;
    }

    // Check for duplicate titles
    const trimmedTitle = t.title.trim();
    if (titles.has(trimmedTitle)) {
      return null;
    }
    titles.add(trimmedTitle);

    validatedTopics.push({
      title: t.title,
      recommended: t.recommended,
      summary: t.summary,
      whyFirst: t.whyFirst,
    });
  }

  // Check exactly one recommended: true
  const recommendedCount = validatedTopics.filter((t) => t.recommended === true).length;
  if (recommendedCount !== 1) {
    return null;
  }

  return validatedTopics;
}

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

    const parsed: unknown = JSON.parse(content);

    // Task-specific validation for recommend_topic
    if (taskType === "recommend_topic") {
      const topics = parseRecommendTopicResponse(parsed);

      if (!topics) {
        return {
          ok: false,
          source: "deepseek",
          error: "invalid_recommend_topic_response",
        };
      }

      return {
        ok: true,
        data: topics as T,
        source: "deepseek",
      };
    }

    // Default parsing for other task types
    return { ok: true, data: parsed as T, source: "deepseek" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return { ok: false, source: "deepseek", error: message };
  }
}
