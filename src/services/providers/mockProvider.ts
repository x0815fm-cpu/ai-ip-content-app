import {
  mockDirections,
  mockExtractedStoryAsset,
  mockGeneratedContent,
  mockRevisedContent,
  mockTopics,
} from "@/data/mockData";
import type { ModelPayload, TaskType } from "@/types/app";

export type MockResponse<T = unknown> = {
  ok: boolean;
  data: T;
  source: "mock";
};

export function mockGenerate<T = unknown>(
  taskType: TaskType,
  payload: ModelPayload,
): MockResponse<T> {
  switch (taskType) {
    case "recommend_direction":
      return { ok: true, data: mockDirections as T, source: "mock" };
    case "recommend_topic":
      return { ok: true, data: mockTopics as T, source: "mock" };
    case "generate_content":
      return { ok: true, data: mockGeneratedContent as T, source: "mock" };
    case "revise_content":
      return { ok: true, data: mockRevisedContent(payload) as T, source: "mock" };
    case "extract_story_asset":
      return { ok: true, data: mockExtractedStoryAsset(payload) as T, source: "mock" };
    default:
      return { ok: true, data: { taskType, payload } as T, source: "mock" };
  }
}
