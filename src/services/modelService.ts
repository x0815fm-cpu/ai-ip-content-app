import type { TaskType } from "@/types/app";

export type ModelPayload = Record<string, unknown>;

export async function generate<TResponse = unknown>(
  taskType: TaskType,
  payload: ModelPayload
): Promise<TResponse> {
  return Promise.resolve({
    taskType,
    payload,
    source: "mock"
  } as TResponse);
}
