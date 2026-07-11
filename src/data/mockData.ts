import type {
  DirectionRecommendation,
  ExtractedStoryAsset,
  GeneratedContent,
  ModelPayload,
  Question,
  StoryAssetCategory,
  StoryLibraryCard,
  TopicRecommendation,
} from "@/types/app";

export const questions: Question[] = [
  {
    id: "materialSource",
    title: "你最近最常投入时间的事情是什么？",
    helper: "不用想太复杂，选一个最接近的就好。",
    options: ["工作 / 职业", "读书 / 学习", "带孩子 / 家庭", "生活记录", "某个爱好", "副业 / 赚钱", "情绪 / 成长", "我也说不清"],
  },
  {
    id: "contentGoal",
    title: "你更想通过内容获得什么？",
    helper: "先确认这条内容要帮你走向哪里。",
    options: ["打造个人 IP", "赚钱变现", "获得客户", "记录成长", "分享经验", "表达自己"],
  },
  {
    id: "publishChannel",
    title: "你想先把这条内容发在哪里？",
    helper: "不同载体会决定最后文案的结构。",
    options: ["短视频 / 口播", "小红书 / 图文", "公众号 / 文章", "头条号 / 文章", "朋友圈 / 动态", "我还不确定"],
  },
];

export const flowSteps = ["选择题", "方向", "故事", "选题", "文案"];

export const mockDirections: DirectionRecommendation[] = [
  {
    name: "普通人成长记录",
    recommended: true,
    whatToTalkAbout: "真实的成长过程、心路变化和第一次开始做内容的现场感。",
    targetAudience: "同样想开始表达，但还在迷茫和犹豫的人。",
    whyFitYou: "你的素材来自真实经历，不需要装成专家，更容易持续写下去。",
  },
  {
    name: "经验分享型 IP",
    recommended: false,
    whatToTalkAbout: "把你踩过的坑、做过的选择和总结出的方法讲清楚。",
    targetAudience: "想少走弯路、正在找实操参考的人。",
    whyFitYou: "你有可迁移的经验，可以从一件小事讲出可复用的方法。",
  },
  {
    name: "生活感悟表达",
    recommended: false,
    whatToTalkAbout: "从日常片段里提炼观察、情绪和真实判断。",
    targetAudience: "喜欢真实表达、愿意看见普通人生活变化的人。",
    whyFitYou: "你有细腻的感受，不需要强营销，也能建立自己的表达气质。",
  },
];

export const mockTopics: TopicRecommendation[] = [
  {
    title: "我为什么想开始做这件事",
    recommended: true,
    summary: "从动机出发，更容易引发共鸣，也能建立你的真实感。",
    whyFirst: "第一条内容先讲为什么开始，用户更容易理解你是谁。",
  },
  {
    title: "这一路上我最大的一个改变",
    recommended: false,
    summary: "用一个具体改变，吸引读者继续了解你的故事。",
    whyFirst: "改变比道理更容易被看见，适合作为第一条真实表达。",
  },
  {
    title: "如果重来一次，我会早点明白这件事",
    recommended: false,
    summary: "用反思和经验，给正在迷茫的人一点启发。",
    whyFirst: "这个选题自带经验价值，适合做成图文或口播。",
  },
];

export const feedbackOptions = ["不够像我", "太官方了", "太营销了", "太长了", "太短了", "开头不吸引人", "换一种讲法"];

export const mockGeneratedContent: GeneratedContent = {
  rows: [
    {
      label: "标题",
      value: "我为什么想开始做这件事",
    },
    {
      label: "开头",
      value: "很多人问我，为什么突然开始做内容？其实，一开始我也没想那么多。",
    },
    {
      label: "正文",
      value: "真正开始的契机，是我发现很多经历如果不被记录，就会慢慢散掉。与其一直等准备好，不如先把一个真实的瞬间讲清楚。",
    },
    {
      label: "结尾",
      value: "如果你也有想做但一直没开始的事，先从第一句话开始。",
    },
  ],
  publishHint: "口播更自然，建议站在窗边自然光处拍；发布时搭配真实日常画面或手写卡片。",
};

export const storyCategories: StoryAssetCategory[] = ["经历", "想法", "金句", "选题"];

export const mockStoryCards: StoryLibraryCard[] = [
  {
    title: "从职场小白到独当一面",
    tag: "工作 / 职业",
    date: "2024.05.12",
    count: 12,
    summary: "从普通生活里提取真实内容，把经历变成可以继续表达的素材...",
  },
  {
    title: "第一次带娃的手忙脚乱",
    tag: "亲子记录",
    date: "2023.11.03",
    count: 28,
    summary: "把慌乱、疲惫和后来慢慢稳定下来的过程，整理成能被理解的故事...",
  },
  {
    title: "坚持读书的第 100 天",
    tag: "自我提升",
    date: "2024.02.20",
    count: 15,
    summary: "每天 30 分钟，让普通日子里也有一点能留下来的成长证据...",
  },
  {
    title: "摸摸索索做 IP 的第一周",
    tag: "副业尝试",
    date: "2024.04.18",
    count: 19,
    summary: "从不知道发什么，到先讲一个真实经历的第一周记录...",
  },
];

export function mockRevisedContent(payload: ModelPayload): GeneratedContent {
  const feedbackType = typeof payload.feedbackType === “string” ? payload.feedbackType : “反馈”;
  return {
    ...mockGeneratedContent,
    revisedBy: feedbackType,
    rows: mockGeneratedContent.rows.map((row) => {
      if (row.label === “开头”) {
        return {
          ...row,
          value: “我不是突然想做内容，而是发现有些经历如果一直放在心里，就永远不会变成别人能看见的东西。”,
        };
      }
      if (row.label === “正文”) {
        return {
          ...row,
          value: “我开始认真记录工作中的点滴，不是为了证明什么，只是想把那些真实的感受留下来。每一个小小的记录，都是在为未来的自己积累力量。”,
        };
      }
      if (row.label === “结尾”) {
        return {
          ...row,
          value: “如果你也有想记录但一直没开始的时刻，不妨从今天开始，写下第一个真实的瞬间。”,
        };
      }
      return row;
    }),
  };
}

export function mockExtractedStoryAsset(payload: ModelPayload): ExtractedStoryAsset {
  const input = typeof payload.input === "string" && payload.input.trim() ? payload.input.trim() : "我最近想开始做内容，但总觉得自己还没准备好。";

  return {
    experience: {
      title: "想开始做内容的这个瞬间",
      content: input,
    },
    thought: {
      title: "先从真实开始",
      content: "用户不是缺少宏大的定位，而是需要先把一个真实经历讲清楚。",
    },
    quote: {
      title: "可以留下的一句话",
      content: "不用等完全准备好，先把真实的一句话说出来。",
    },
    topics: [
      {
        title: "我为什么迟迟没有开始做内容",
        content: "从犹豫、担心和想开始的原因切入。",
      },
      {
        title: "普通人开始表达前最容易卡住的地方",
        content: "把“不知道讲什么”拆成一个真实场景。",
      },
      {
        title: "如果只能先发一条，我会讲这件事",
        content: "把第一条内容聚焦到一个具体经历。",
      },
    ],
  };
}
