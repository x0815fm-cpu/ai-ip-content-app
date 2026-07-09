import type { ModelPayload, TaskType } from "@/types/app";

type GenerateApiResponse<T = unknown> = {
  ok: boolean;
  data?: T;
  source: "deepseek" | "mock";
  error?: string;
};

async function generate<TResponse = unknown>(taskType: TaskType, payload: ModelPayload): Promise<TResponse> {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskType, payload }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const result: GenerateApiResponse<TResponse> = await response.json();

    if (result.ok && result.data !== undefined) {
      return result.data;
    }

    throw new Error(result.error || "unknown_api_error");
  } catch {
    // Client-side fallback: import mock data dynamically
    const { mockGenerate } = await import("@/services/providers/mockProvider");
    const fallback = mockGenerate<TResponse>(taskType, payload);
    return fallback.data;
  }
}

export const modelService = {
  generate,
};

export { generate };
