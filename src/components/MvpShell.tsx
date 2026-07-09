"use client";

import Image from "next/image";
import {
  ArrowLeft,
  Battery,
  BookOpen,
  BookText,
  BriefcaseBusiness,
  CheckCircle2,
  Circle,
  CircleDollarSign,
  Coins,
  Crown,
  FileText,
  Gift,
  Heart,
  HelpCircle,
  Home,
  ImageIcon,
  Library,
  Menu,
  MessageCircle,
  NotebookText,
  Palette,
  PenLine,
  Search,
  Signal,
  Sparkles,
  Star,
  Users,
  Video,
  Wifi,
} from "lucide-react";
import { useMemo, useState } from "react";
import { questions, storyCategories } from "@/data/mockData";
import type { AppView } from "@/types/app";

type AnswerMap = Partial<Record<(typeof questions)[number]["id"], string>>;

const materialIcons = [BriefcaseBusiness, BookOpen, Home, NotebookText, Palette, Coins, Heart, HelpCircle];
const goalIcons = [Crown, CircleDollarSign, Users, NotebookText, MessageCircle, Heart];
const channelIcons = [Video, ImageIcon, FileText, BookText, MessageCircle, HelpCircle];

const directions = [
  {
    name: "普通人成长记录",
    recommended: true,
    points: ["这个方向讲什么：真实的成长过程与心路历程", "适合吸引谁：同样在迷茫、正在成长的人", "为什么适合你：你有真实经历，容易长期写"],
  },
  {
    name: "经验分享型 IP",
    recommended: false,
    points: ["这个方向讲什么：把你的经验整理成方法", "适合吸引谁：想少走弯路的人", "为什么适合你：你有可迁移的经验与方法"],
  },
  {
    name: "生活感悟表达",
    recommended: false,
    points: ["这个方向讲什么：对生活的观察与思考", "适合吸引谁：喜欢真实表达的人", "为什么适合你：你有细腻的感受与表达欲"],
  },
];

const topics = [
  {
    title: "我为什么想开始做这件事",
    recommended: true,
    summary: "从动机出发，更容易引发共鸣，也能建立你的真实感。",
  },
  {
    title: "这一路上我最大的一个改变",
    recommended: false,
    summary: "用一个具体改变，吸引读者继续了解你的故事。",
  },
  {
    title: "如果重来一次，我会早点明白这件事",
    recommended: false,
    summary: "用反思和经验，给正在迷茫的人一点启发。",
  },
];

const feedbacks = ["不够像我", "太官方了", "太长了", "换一种讲法"];

export function MvpShell() {
  const [view, setView] = useState<AppView>("home");
  const [questionPage, setQuestionPage] = useState<1 | 2>(1);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [selectedDirection, setSelectedDirection] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(0);
  const [xiaoguangOpen, setXiaoguangOpen] = useState(false);

  const progressIndex = useMemo(() => {
    if (view === "questions") return questionPage === 1 ? 0 : 1;
    if (view === "directions") return 2;
    if (view === "topics") return 3;
    if (view === "content") return 4;
    return 0;
  }, [questionPage, view]);

  function startFlow() {
    setQuestionPage(1);
    setView("questions");
  }

  function chooseAnswer(id: keyof AnswerMap, value: string) {
    setAnswers((current) => ({ ...current, [id]: value }));
    if (id === "materialSource") {
      setQuestionPage(2);
      return;
    }
    if (id === "publishChannel") {
      setView("directions");
    }
  }

  function goBack() {
    if (view === "home") return;
    if (view === "questions" && questionPage === 2) {
      setQuestionPage(1);
      return;
    }
    if (view === "directions") {
      setQuestionPage(2);
      setView("questions");
      return;
    }
    if (view === "topics") {
      setView("directions");
      return;
    }
    if (view === "content") {
      setView("topics");
      return;
    }
    setView("home");
  }

  return (
    <main className="app-canvas">
      <section className="phone-shell" aria-label="小光内容工作台">
        <StatusBar />
        <div className="phone-content">
          {view === "home" ? <HomeScreen onStart={startFlow} onStory={() => setView("story")} /> : null}
          {view === "questions" ? (
            <QuestionScreen
              answers={answers}
              onBack={goBack}
              onChoose={chooseAnswer}
              page={questionPage}
              progressIndex={progressIndex}
            />
          ) : null}
          {view === "directions" ? (
            <DirectionScreen
              onBack={goBack}
              onNext={() => setView("topics")}
              onSelect={setSelectedDirection}
              progressIndex={progressIndex}
              selected={selectedDirection}
            />
          ) : null}
          {view === "topics" ? (
            <TopicScreen
              onBack={goBack}
              onNext={() => setView("content")}
              onSelect={setSelectedTopic}
              progressIndex={progressIndex}
              selected={selectedTopic}
            />
          ) : null}
          {view === "content" ? <ContentScreen onBack={goBack} onStory={() => setView("story")} /> : null}
          {view === "story" ? <StoryScreen onBack={goBack} /> : null}
        </div>
        <XiaoguangOrb open={xiaoguangOpen} onToggle={() => setXiaoguangOpen((value) => !value)} />
      </section>
    </main>
  );
}

function StatusBar() {
  return (
    <div className="status-bar">
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <Signal size={14} strokeWidth={2.4} />
        <Wifi size={14} strokeWidth={2.4} />
        <Battery size={17} strokeWidth={2.4} />
      </div>
    </div>
  );
}

function ProgressDots({ active }: { active: number }) {
  return (
    <div className="progress-dots" aria-label="流程进度">
      {[0, 1, 2].map((item) => (
        <span className={item === active ? "active" : ""} key={item} />
      ))}
    </div>
  );
}

function ScreenHeader({ onBack, progressIndex }: { onBack: () => void; progressIndex?: number }) {
  return (
    <header className="screen-header">
      <button aria-label="返回" className="icon-button" onClick={onBack} type="button">
        <ArrowLeft size={20} />
      </button>
      {typeof progressIndex === "number" ? <ProgressDots active={Math.min(progressIndex, 2)} /> : <span />}
      <span className="h-9 w-9" />
    </header>
  );
}

function HomeScreen({ onStart, onStory }: { onStart: () => void; onStory: () => void }) {
  return (
    <section className="home-screen">
      <header className="home-top">
        <button aria-label="菜单" className="icon-button" type="button">
          <Menu size={20} />
        </button>
        <button aria-label="新手礼包" className="gift-button" type="button">
          <Gift size={18} />
          新手礼包
        </button>
      </header>

      <div className="hero-visual">
        <Image alt="温暖的客厅场景" fill priority src="/images/home-scene.png" sizes="320px" />
        <div className="hero-copy">
          <h1>嘿，你来了</h1>
          <p>今天先帮你生成一条能发出去的内容文案</p>
        </div>
      </div>

      <div className="home-actions">
        <button className="primary-action" onClick={onStart} type="button">
          <PenLine size={18} />
          生成一条内容文案
          <Sparkles size={16} />
        </button>
        <button className="secondary-action" onClick={onStory} type="button">
          <Library size={18} />
          我的故事库
        </button>
      </div>
    </section>
  );
}

function QuestionScreen({
  answers,
  onBack,
  onChoose,
  page,
  progressIndex,
}: {
  answers: AnswerMap;
  onBack: () => void;
  onChoose: (id: keyof AnswerMap, value: string) => void;
  page: 1 | 2;
  progressIndex: number;
}) {
  const firstQuestion = questions[0];
  const secondQuestion = questions[1];
  const thirdQuestion = questions[2];

  if (page === 1) {
    return (
      <section className="screen-pad">
        <ScreenHeader onBack={onBack} progressIndex={progressIndex} />
        <div className="center-title">
          <h2>{firstQuestion.title}</h2>
          <p>{firstQuestion.helper}</p>
        </div>
        <div className="choice-grid">
          {firstQuestion.options.map((option, index) => {
            const Icon = materialIcons[index] ?? Sparkles;
            return (
              <button className="choice-tile" key={option} onClick={() => onChoose(firstQuestion.id, option)} type="button">
                <Icon size={22} />
                {option}
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="screen-pad">
      <ScreenHeader onBack={onBack} progressIndex={progressIndex} />
      <QuestionBlock
        answers={answers}
        icons={goalIcons}
        onChoose={onChoose}
        question={secondQuestion}
      />
      <QuestionBlock
        answers={answers}
        icons={channelIcons}
        onChoose={onChoose}
        question={thirdQuestion}
      />
    </section>
  );
}

function QuestionBlock({
  answers,
  icons,
  onChoose,
  question,
}: {
  answers: AnswerMap;
  icons: typeof materialIcons;
  onChoose: (id: keyof AnswerMap, value: string) => void;
  question: (typeof questions)[number];
}) {
  return (
    <section className="question-card">
      <h2>{question.title}</h2>
      <div className="mini-choice-grid">
        {question.options.map((option, index) => {
          const Icon = icons[index] ?? Sparkles;
          const active = answers[question.id] === option;
          return (
            <button
              className={`mini-choice ${active ? "selected" : ""}`}
              key={option}
              onClick={() => onChoose(question.id, option)}
              type="button"
            >
              <Icon size={18} />
              {option}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DirectionScreen({
  onBack,
  onNext,
  onSelect,
  progressIndex,
  selected,
}: {
  onBack: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  progressIndex: number;
  selected: number;
}) {
  return (
    <section className="screen-pad">
      <ScreenHeader onBack={onBack} progressIndex={progressIndex} />
      <div className="top-title">
        <h2>你可以先从这 3 个方向开始</h2>
        <p>结合你的选择，我们为你推荐</p>
      </div>
      <div className="stack-list">
        {directions.map((direction, index) => (
          <button
            className={`direction-card ${selected === index ? "selected" : ""}`}
            key={direction.name}
            onClick={() => onSelect(index)}
            type="button"
          >
            <div className="card-title-row">
              <span className="direction-icon">
                <Users size={19} />
              </span>
              <h3>{direction.name}</h3>
              {direction.recommended ? <span className="fit-badge">更适合你</span> : null}
            </div>
            <ul>
              {direction.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <Star className="corner-star" size={17} />
          </button>
        ))}
      </div>
      <button className="bottom-primary" onClick={onNext} type="button">
        选择这个方向
      </button>
    </section>
  );
}

function TopicScreen({
  onBack,
  onNext,
  onSelect,
  progressIndex,
  selected,
}: {
  onBack: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  progressIndex: number;
  selected: number;
}) {
  return (
    <section className="screen-pad">
      <ScreenHeader onBack={onBack} progressIndex={progressIndex} />
      <div className="top-title">
        <h2>那第一条内容，我们先写什么？</h2>
        <p>选择一个更有感觉的选题开始吧</p>
      </div>
      <div className="topic-list">
        {topics.map((topic, index) => (
          <button
            className={`topic-card ${selected === index ? "selected" : ""}`}
            key={topic.title}
            onClick={() => onSelect(index)}
            type="button"
          >
            <div>
              <div className="topic-title-row">
                <h3>{topic.title}</h3>
                {topic.recommended ? <span className="fit-badge">更适合你</span> : null}
              </div>
              <p>{topic.summary}</p>
            </div>
            {selected === index ? <CheckCircle2 size={22} /> : <Circle size={22} />}
          </button>
        ))}
      </div>
      <button className="bottom-primary" onClick={onNext} type="button">
        生成内容文案
      </button>
    </section>
  );
}

function ContentScreen({ onBack, onStory }: { onBack: () => void; onStory: () => void }) {
  const contentRows = [
    ["标题", "我为什么想开始做这件事"],
    ["开头", "很多人问我，为什么突然开始做内容？其实，一开始我也没想那么多。"],
    ["正文", "真正开始的契机，是我发现很多经历如果不被记录，就会慢慢散掉。"],
    ["结尾", "如果你也有想做但一直没开始的事，先从第一句话开始。"],
  ];

  return (
    <section className="screen-pad content-screen">
      <ScreenHeader onBack={onBack} />
      <div className="top-title">
        <h2>这是你的第一条内容文案</h2>
        <p>你可以直接发布，或根据建议优化</p>
      </div>
      <article className="content-card">
        {contentRows.map(([label, value]) => (
          <div className="content-row" key={label}>
            <span>{label}</span>
            <p>{value}</p>
          </div>
        ))}
        <div className="content-row">
          <span>拍摄提示 / 发布建议</span>
          <p>口播更自然，建议站在窗边自然光处拍；发布时搭配真实日常画面或手写卡片。</p>
        </div>
      </article>
      <div className="feedback-panel">
        <p>这条内容怎么样？</p>
        <div className="feedback-grid">
          {feedbacks.map((feedback) => (
            <button key={feedback} type="button">
              {feedback}
            </button>
          ))}
        </div>
      </div>
      <button className="bottom-secondary" onClick={onStory} type="button">
        <Library size={17} />
        沉淀到故事库
      </button>
    </section>
  );
}

function StoryScreen({ onBack }: { onBack: () => void }) {
  const cards = [
    ["从职场小白到独当一面", "工作 / 职业", "2024.05.12", 12],
    ["第一次带娃的手忙脚乱", "亲子记录", "2023.11.03", 28],
    ["坚持读书的第 100 天", "自我提升", "2024.02.20", 15],
    ["摸摸索索做 IP 的第一周", "副业尝试", "2024.04.18", 19],
  ];

  return (
    <section className="screen-pad story-screen">
      <ScreenHeader onBack={onBack} />
      <div className="story-title">
        <h2>我的故事库</h2>
        <span>预览</span>
        <p>你的经历、想法与灵感，都会在这里沉淀</p>
      </div>
      <section className="story-board">
        <div className="story-board-head">
          <h3>我的故事库</h3>
          <Search size={18} />
        </div>
        <div className="story-tabs">
          {storyCategories.map((category) => (
            <button className={category === "经历" ? "active" : ""} key={category} type="button">
              {category}
            </button>
          ))}
        </div>
        <div className="story-list">
          {cards.map(([title, tag, date, count]) => (
            <article className="story-card" key={title}>
              <div className="story-card-head">
                <h4>{title}</h4>
                <time>{date}</time>
              </div>
              <p>从普通生活里提取真实内容，把经历变成可以继续表达的素材...</p>
              <div className="story-card-foot">
                <span>{tag}</span>
                <span>☆ {count}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
      <div className="story-quote">每一次记录，都是在为未来的你积累力量。</div>
    </section>
  );
}

function XiaoguangOrb({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <div className="xiaoguang-wrap">
      {open ? (
        <section className="xiaoguang-pop">
          <strong>小光</strong>
          <p>想起什么，都可以跟我说。</p>
          <p className="muted">你愿意留下来的内容，我会帮你整理成故事卡。</p>
        </section>
      ) : null}
      <button aria-label="打开小光" className="xiaoguang-button" onClick={onToggle} type="button">
        <Image alt="小光" height={86} src="/images/xiaoguang-orb.png" width={65} />
      </button>
    </div>
  );
}
