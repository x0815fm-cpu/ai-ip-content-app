import {
  mockDirections,
  mockExtractedStoryAsset,
  mockGeneratedContent,
  mockRevisedContent,
  mockTopics,
} from "@/data/mockData";
import type { ModelPayload, TaskType } from "@/types/app";

async function generate<TResponse = unknown>(taskType: TaskType, payload: ModelPayload): Promise<TResponse> {
  switch (taskType) {
    case "recommend_direction":
      return mockDirections as TResponse;
    case "recommend_topic":
      return mockTopics as TResponse;
    case "generate_content":
      return mockGeneratedContent as TResponse;
    case "revise_content":
      return mockRevisedContent(payload) as TResponse;
    case "extract_story_asset":
      return mockExtractedStoryAsset(payload) as TResponse;
    default:
      return {
        taskType,
        payload,
        source: "mock",
      } as TResponse;
  }
}

export const modelService = {
  generate,
};

export { generate };
