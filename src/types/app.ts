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

export type ModelPayload = Record<string, unknown>;

export type Question = {
  id: "materialSource" | "contentGoal" | "publishChannel";
  title: string;
  helper: string;
  options: string[];
};

export type StoryAssetCategory = "经历" | "想法" | "金句" | "选题";

export type AnswerMap = Partial<Record<Question["id"], string>>;

export type DirectionRecommendation = {
  name: string;
  recommended: boolean;
  whatToTalkAbout: string;
  targetAudience: string;
  whyFitYou: string;
};

export type TopicRecommendation = {
  title: string;
  recommended: boolean;
  summary: string;
  whyFirst: string;
};

export type ContentRow = {
  label: string;
  value: string;
};

export type GeneratedContent = {
  rows: ContentRow[];
  publishHint: string;
  revisedBy?: string;
};

export type StoryLibraryCard = {
  title: string;
  tag: string;
  date: string;
  count: number;
  summary: string;
};

export type ExtractedStoryAsset = {
  experience: {
    title: string;
    content: string;
  };
  thought: {
    title: string;
    content: string;
  };
  quote: {
    title: string;
    content: string;
  };
  topics: Array<{
    title: string;
    content: string;
  }>;
};
