import { NextResponse } from "next/server";

import { deepseekGenerate } from "@/services/providers/deepseekProvider";
import { mockGenerate } from "@/services/providers/mockProvider";
import type { ModelPayload, TaskType } from "@/types/app";

export type GenerateApiResponse<T = unknown> = {
  ok: boolean;
  data?: T;
  source: "deepseek" | "mock";
  error?: string;
};

export async function POST(request: Request): Promise<NextResponse<GenerateApiResponse>> {
  try {
    const body = await request.json();
    const { taskType, payload } = body as { taskType: TaskType; payload: ModelPayload };

    if (!taskType) {
      return NextResponse.json({ ok: false, source: "mock", error: "missing_task_type" }, { status: 400 });
    }

    const useMock = process.env.USE_MOCK_MODEL === "true" || !process.env.DEEPSEEK_API_KEY;

    if (useMock) {
      const result = mockGenerate(taskType, payload);
      return NextResponse.json(result);
    }

    const result = await deepseekGenerate(taskType, payload);

    if (!result.ok) {
      // Fallback to mock on failure
      const fallback = mockGenerate(taskType, payload);
      return NextResponse.json({
        ...fallback,
        error: `deepseek_failed_fallback_to_mock: ${result.error}`,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return NextResponse.json({ ok: false, source: "mock", error: message }, { status: 500 });
  }
}
