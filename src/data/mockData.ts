import type { Question, StoryAssetCategory } from "@/types/app";

export const questions: Question[] = [
  {
    id: "materialSource",
    title: "你最近最常投入时间的事情是什么？",
    helper: "不用想太复杂，选一个最接近的就好。",
    options: ["工作 / 职业", "读书 / 学习", "带孩子 / 家庭", "生活记录", "某个爱好", "副业 / 赚钱", "情绪 / 成长", "我也说不清"]
  },
  {
    id: "contentGoal",
    title: "你更想通过内容获得什么？",
    helper: "先确认这条内容要帮你走向哪里。",
    options: ["打造个人 IP", "赚钱变现", "获得客户", "记录成长", "分享经验", "表达自己"]
  },
  {
    id: "publishChannel",
    title: "你想先把这条内容发在哪里？",
    helper: "不同载体会决定最后文案的结构。",
    options: ["短视频 / 口播", "小红书 / 图文", "公众号 / 文章", "头条号 / 文章", "朋友圈 / 动态", "我还不确定"]
  }
];

export const flowSteps = ["三道选择题", "3 个内容方向", "3 个第一选题", "1 条可发布文案"];

export const storyCategories: StoryAssetCategory[] = ["经历", "想法", "金句", "选题"];
