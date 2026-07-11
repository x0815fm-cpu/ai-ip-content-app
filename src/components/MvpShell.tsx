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
import {
  feedbackOptions,
  flowSteps,
  mockDirections,
  mockGeneratedContent,
  mockStoryCards,
  mockTopics,
  questions,
  storyCategories,
} from "@/data/mockData";
import { modelService } from "@/services/modelService";
import type {
  AnswerMap,
  AppView,
  DirectionRecommendation,
  ExtractedStoryAsset,
  GeneratedContent,
  Question,
  TopicRecommendation,
} from "@/types/app";

const materialIcons = [BriefcaseBusiness, BookOpen, Home, NotebookText, Palette, Coins, Heart, HelpCircle];
const goalIcons = [Crown, CircleDollarSign, Users, NotebookText, MessageCircle, Heart];
const channelIcons = [Video, ImageIcon, FileText, BookText, MessageCircle, HelpCircle];

export function MvpShell() {
  const [view, setView] = useState<AppView>("home");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [directions, setDirections] = useState<DirectionRecommendation[]>(mockDirections);
  const [topics, setTopics] = useState<TopicRecommendation[]>(mockTopics);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>(mockGeneratedContent);
  const [selectedDirection, setSelectedDirection] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(0);
  const [activeFeedback, setActiveFeedback] = useState("");
  const [storyDraft, setStoryDraft] = useState("");
  const [storyAsset, setStoryAsset] = useState<ExtractedStoryAsset | null>(null);
  const [xiaoguangOpen, setXiaoguangOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [failureStoryInput, setFailureStoryInput] = useState("");

  const progressIndex = useMemo(() => {
    if (view === "questions") return 0;
    if (view === "directions") return 1;
    if (view === "failure_story") return 2;
    if (view === "topics") return 3;
    if (view === "content") return 4;
    return undefined;
  }, [view]);

  function startFlow() {
    setQuestionIndex(0);
    setFailureStoryInput("");
    setView("questions");
  }

  async function chooseAnswer(id: Question["id"], value: string) {
    const nextAnswers = { ...answers, [id]: value };
    setAnswers(nextAnswers);

    if (questionIndex < questions.length - 1) {
      setQuestionIndex((current) => current + 1);
      return;
    }

    const nextDirections = await modelService.generate<DirectionRecommendation[]>("recommend_direction", {
      answers: nextAnswers,
    });
    setDirections(nextDirections);
    setSelectedDirection(0);
    setView("directions");
  }

  function continueToFailureStory() {
    setView("failure_story");
  }

  async function continueToTopics(input = failureStoryInput) {
    const nextTopics = await modelService.generate<TopicRecommendation[]>("recommend_topic", {
      answers,
      selectedDirection: directions[selectedDirection],
      failureStoryInput: input,
    });
    setTopics(nextTopics);
    setSelectedTopic(0);
    setView("topics");
  }

  function skipFailureStory() {
    setFailureStoryInput("");
    void continueToTopics("");
  }


  async function copyContent() {
    const text = generatedContent.rows.map(row => `${row.label}\n${row.value}`).join('\n\n');
    const fullText = text + '\n\n' + generatedContent.publishHint;
    
    try {
      await navigator.clipboard.writeText(fullText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  async function continueToContent() {
    setIsGenerating(true);
    
    try {
      const nextContent = await modelService.generate<GeneratedContent>("generate_content", {
        answers,
        selectedDirection: directions[selectedDirection],
        selectedTopic: topics[selectedTopic],
        failureStoryInput,
      });
      
      // Safety check: ensure nextContent has the expected structure
      if (!nextContent || !Array.isArray(nextContent.rows) || nextContent.rows.length === 0) {
        // Use mock data as fallback
        setGeneratedContent(mockGeneratedContent);
      } else {
        setGeneratedContent(nextContent);
      }
      
      setActiveFeedback("");
      setView("content");
    } catch {
      // Any exception, use mock data as fallback
      setGeneratedContent(mockGeneratedContent);
      setActiveFeedback("");
      setView("content");
    } finally {
      setIsGenerating(false);
    }
  }

  async function reviseContent(feedbackType: string) {
    const revised = await modelService.generate<GeneratedContent>("revise_content", {
      answers,
      selectedDirection: directions[selectedDirection],
      selectedTopic: topics[selectedTopic],
      currentContent: generatedContent,
      feedbackType,
      failureStoryInput,
    });
    setGeneratedContent(revised);
    setActiveFeedback(feedbackType);
  }

  async function extractStoryAsset() {
    const extracted = await modelService.generate<ExtractedStoryAsset>("extract_story_asset", {
      input: storyDraft,
      autoSaveEnabled: false,
    });
    setStoryAsset(extracted);
  }

  function goBack() {
    if (view === "home") return;
    if (view === "questions") {
      if (questionIndex > 0) {
        setQuestionIndex((current) => current - 1);
        return;
      }
      setView("home");
      return;
    }
    if (view === "directions") {
      setQuestionIndex(questions.length - 1);
      setView("questions");
      return;
    }
    if (view === "failure_story") {
      setView("directions");
      return;
    }
    if (view === "topics") {
      setView("failure_story");
      return;
    }
    if (view === "content") {
      setView("topics");
      return;
    }
    setView("home");
  }

  return (
    <main className="app-canvas-mobile">
      <section className="app-container" aria-label="小光内容工作台">
        <div className="app-content">
          {view === "home" ? <HomeScreen onStart={startFlow} onStory={() => setView("story")} /> : null}
          {view === "questions" ? (
            <QuestionScreen
              answer={answers[questions[questionIndex].id]}
              onBack={goBack}
              onChoose={chooseAnswer}
              progressIndex={progressIndex}
              question={questions[questionIndex]}
              questionIndex={questionIndex}
            />
          ) : null}
          {view === "directions" ? (
            <DirectionScreen
              directions={directions}
              onBack={goBack}
              onNext={continueToFailureStory}
              onSelect={setSelectedDirection}
              progressIndex={progressIndex}
              selected={selectedDirection}
            />
          ) : null}
          {view === "failure_story" ? (
            <FailureStoryInputScreen
              input={failureStoryInput}
              onChange={setFailureStoryInput}
              onBack={goBack}
              onSkip={skipFailureStory}
              onContinue={() => void continueToTopics()}
              progressIndex={progressIndex}
            />
          ) : null}
          {view === "topics" ? (
            <TopicScreen
              isGenerating={isGenerating}
              onBack={goBack}
              onNext={continueToContent}
              onSelect={setSelectedTopic}
              progressIndex={progressIndex}
              selected={selectedTopic}
              topics={topics}
            />
          ) : null}
          {view === "content" ? (
            <ContentScreen
              activeFeedback={activeFeedback}
              content={generatedContent}
              isCopied={isCopied}
              onBack={goBack}
              onCopy={copyContent}
              onFeedback={reviseContent}
              onStory={() => setView("story")}
            />
          ) : null}
          {view === "story" ? <StoryScreen onBack={goBack} /> : null}
        </div>
        <XiaoguangOrb
          draft={storyDraft}
          onDraftChange={setStoryDraft}
          onExtract={extractStoryAsset}
          onToggle={() => setXiaoguangOpen((value) => !value)}
          open={xiaoguangOpen}
          storyAsset={storyAsset}
        />
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
      {flowSteps.map((step, index) => (
        <span aria-label={step} className={index === active ? "active" : ""} key={step} title={step} />
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
      {typeof progressIndex === "number" ? <ProgressDots active={progressIndex} /> : <span />}
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
        <Image alt="温暖的客厅场景" fill priority sizes="320px" src="/images/home-scene.png" />
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
  answer,
  onBack,
  onChoose,
  progressIndex,
  question,
  questionIndex,
}: {
  answer?: string;
  onBack: () => void;
  onChoose: (id: Question["id"], value: string) => void;
  progressIndex?: number;
  question: Question;
  questionIndex: number;
}) {
  const iconSet = question.id === "materialSource" ? materialIcons : question.id === "contentGoal" ? goalIcons : channelIcons;

  return (
    <section className="screen-pad">
      <ScreenHeader onBack={onBack} progressIndex={progressIndex} />
      <div className="center-title">
        <span className="question-kicker">问题 {questionIndex + 1} / 3</span>
        <h2>{question.title}</h2>
        <p>{question.helper}</p>
      </div>
      <div className="choice-grid">
        {question.options.map((option, index) => {
          const Icon = iconSet[index] ?? Sparkles;
          const active = answer === option;
          return (
            <button className={`choice-tile ${active ? "selected" : ""}`} key={option} onClick={() => onChoose(question.id, option)} type="button">
              <Icon size={22} />
              {option}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DirectionScreen({
  directions,
  onBack,
  onNext,
  onSelect,
  progressIndex,
  selected,
}: {
  directions: DirectionRecommendation[];
  onBack: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  progressIndex?: number;
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
              <li>这个方向讲什么：{direction.whatToTalkAbout}</li>
              <li>适合吸引谁：{direction.targetAudience}</li>
              <li>为什么适合你：{direction.whyFitYou}</li>
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

function FailureStoryInputScreen({
  input,
  onChange,
  onBack,
  onSkip,
  onContinue,
  progressIndex,
}: {
  input: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onSkip: () => void;
  onContinue: () => void;
  progressIndex?: number;
}) {
  return (
    <section className="screen-pad">
      <ScreenHeader onBack={onBack} progressIndex={progressIndex} />
      <div className="failure-story-screen">
        <h2 className="failure-story-title">想起一次你真的觉得自己不行了的时候</h2>
        <p className="failure-story-helper">不用讲得很完整。写下当时发生了什么，以及你心里最真实的感受。</p>
        <textarea
          className="failure-story-input"
          onChange={(event) => onChange(event.target.value)}
          placeholder="比如：那段时间我每天都很累，开始怀疑自己是不是根本做不到……"
          rows={6}
          value={input}
        />
        <div className="failure-story-actions">
          <button className="bottom-secondary failure-story-skip" onClick={onSkip} type="button">
            暂时跳过
          </button>
          <button className="bottom-primary failure-story-continue" onClick={onContinue} type="button">
            继续找选题
          </button>
        </div>
      </div>
    </section>
  );
}

function TopicScreen({
  isGenerating,
  onBack,
  onNext,
  onSelect,
  progressIndex,
  selected,
  topics,
}: {
  isGenerating: boolean;
  onBack: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  progressIndex?: number;
  selected: number;
  topics: TopicRecommendation[];
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
              <p className="why-first">为什么适合作为第一条：{topic.whyFirst}</p>
            </div>
            {selected === index ? <CheckCircle2 size={22} /> : <Circle size={22} />}
          </button>
        ))}
      </div>
      <button className="bottom-primary" onClick={onNext} type="button" disabled={isGenerating}>
        {isGenerating ? "小光正在整理你的第一条内容……" : "生成内容文案"}
      </button>
    </section>
  );
}

function ContentScreen({
  activeFeedback,
  content,
  isCopied,
  onBack,
  onCopy,
  onFeedback,
  onStory,
}: {
  activeFeedback: string;
  content: GeneratedContent;
  isCopied: boolean;
  onBack: () => void;
  onCopy: () => void;
  onFeedback: (feedbackType: string) => void;
  onStory: () => void;
}) {
  // Safety check: ensure content has the expected structure
  const rows = content?.rows ?? [];
  const publishHint = content?.publishHint ?? "";

  return (
    <section className="screen-pad content-screen">
      <ScreenHeader onBack={onBack} progressIndex={4} />
      <div className="top-title">
        <h2>这是你的第一条内容文案</h2>
        <p>你可以直接发布，或根据建议优化</p>
      </div>
      <article className="content-card">
        {rows.length > 0 ? (
          rows.map((row) => (
            <div className="content-row" key={row.label}>
              <span>{row.label}</span>
              <p>{row.value}</p>
            </div>
          ))
        ) : (
          <div className="content-row">
            <span>提示</span>
            <p>内容生成遇到问题，请返回重试。</p>
          </div>
        )}
        {publishHint && (
          <div className="content-row">
            <span>拍摄提示 / 发布建议</span>
            <p>{publishHint}</p>
          </div>
        )}
      </article>
      <div className="feedback-panel">
        <p>{activeFeedback ? "已根据你的反馈改写" : "这条内容怎么样？"}</p>
        <div className="feedback-grid">
          {feedbackOptions.map((feedback) => (
            <button className={activeFeedback === feedback ? "active" : ""} key={feedback} onClick={() => onFeedback(feedback)} type="button">
              {feedback}
            </button>
          ))}
        </div>
      </div>
      <button className={`copy-button ${isCopied ? "copied" : ""}`} onClick={onCopy} type="button">
        {isCopied ? "✓ 已复制" : "复制全文"}
      </button>
      <button className="bottom-secondary" onClick={onStory} type="button">
        <Library size={17} />
        沉淀到故事库
      </button>
    </section>
  );
}

function StoryScreen({ onBack }: { onBack: () => void }) {
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
          {mockStoryCards.map((card) => (
            <article className="story-card" key={card.title}>
              <div className="story-card-head">
                <h4>{card.title}</h4>
                <time>{card.date}</time>
              </div>
              <p>{card.summary}</p>
              <div className="story-card-foot">
                <span>{card.tag}</span>
                <span>☆ {card.count}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
      <div className="story-quote">每一次记录，都是在为未来的你积累力量。</div>
    </section>
  );
}

function XiaoguangOrb({
  draft,
  onDraftChange,
  onExtract,
  onToggle,
  open,
  storyAsset,
}: {
  draft: string;
  onDraftChange: (value: string) => void;
  onExtract: () => void;
  onToggle: () => void;
  open: boolean;
  storyAsset: ExtractedStoryAsset | null;
}) {
  return (
    <div className="xiaoguang-wrap">
      {open ? (
        <section className="xiaoguang-pop">
          <strong>小光</strong>
          <p>想起什么，都可以跟我说。</p>
          <p className="muted">你愿意留下来的内容，我会帮你整理成故事卡。</p>
          <textarea
            className="xiaoguang-input"
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="比如：我最近想开始做内容，但一直不知道第一条该发什么..."
            rows={3}
            value={draft}
          />
          <button className="xiaoguang-save" onClick={onExtract} type="button">
            沉淀成故事卡
          </button>
          {storyAsset ? <StoryAssetCard storyAsset={storyAsset} /> : null}
        </section>
      ) : null}
      <button aria-label="打开小光" className="xiaoguang-button" onClick={onToggle} type="button">
        <Image alt="小光" height={56} src="/images/xiaoguang-orb.png" width={56} />
      </button>
    </div>
  );
}

function StoryAssetCard({ storyAsset }: { storyAsset: ExtractedStoryAsset }) {
  // Safety check: ensure storyAsset has the expected structure
  if (!storyAsset || !storyAsset.experience || !storyAsset.thought || !storyAsset.quote || !storyAsset.topics) {
    return (
      <article className="asset-card">
        <h3>故事资产生成遇到问题</h3>
        <p>请返回重试。</p>
      </article>
    );
  }

  return (
    <article className="asset-card">
      <h3>已沉淀到你的故事库</h3>
      <section>
        <strong>经历</strong>
        <p>{storyAsset.experience.content}</p>
      </section>
      <section>
        <strong>想法</strong>
        <p>{storyAsset.thought.content}</p>
      </section>
      <section>
        <strong>金句</strong>
        <p>{storyAsset.quote.content}</p>
      </section>
      <section>
        <strong>可生成选题</strong>
        <ol>
          {Array.isArray(storyAsset.topics) && storyAsset.topics.length > 0 ? (
            storyAsset.topics.map((topic) => (
              <li key={topic.title}>{topic.title}</li>
            ))
          ) : (
            <li>暂无选题</li>
          )}
        </ol>
      </section>
    </article>
  );
}
