export type AppView = "home" | "questions" | "directions" | "topics" | "content" | "story";

export type TaskType =
  | "collect_profile"
  | "recommend_direction"
  | "recommend_topic"
  | "generate_content"
  | "revise_content"
  | "chat_with_xiaoguang"
  | "extract_story_asset"
  | "save_story_asset";

export type Question = {
  id: "materialSource" | "contentGoal" | "publishChannel";
  title: string;
  helper: string;
  options: string[];
};

export type StoryAssetCategory = "经历" | "想法" | "金句" | "选题";
