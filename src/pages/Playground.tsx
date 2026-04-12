import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Copy,
  Gauge,
  MessagesSquare,
  MoonStar,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

type LanguageCopy = {
  'zh-CN': string;
  en: string;
};

type DimensionKey = 'stability' | 'brain' | 'truth' | 'energy';

type DimensionProfile = {
  letter: string;
  label: LanguageCopy;
  descriptor: LanguageCopy;
  strengths: LanguageCopy;
  idealScene: LanguageCopy;
  reminder: LanguageCopy;
};

type Question = {
  id: number;
  dimension: DimensionKey;
  prompt: LanguageCopy;
  detail: LanguageCopy;
  options: Array<{
    label: LanguageCopy;
    value: 1 | -1;
  }>;
};

const dimensions: Array<{
  key: DimensionKey;
  icon: React.ComponentType<{ className?: string }>;
  theme: string;
  positive: DimensionProfile;
  negative: DimensionProfile;
}> = [
  {
    key: 'stability',
    icon: Gauge,
    theme: 'from-sky-500 to-indigo-500',
    positive: {
      letter: 'S',
      label: { 'zh-CN': '稳住派', en: 'Steady mode' },
      descriptor: { 'zh-CN': '先稳住节奏，再漂亮出手。', en: 'Stabilize first, then strike cleanly.' },
      strengths: { 'zh-CN': '抗压不乱阵脚，擅长把混乱整理成秩序。', en: 'Keeps calm under pressure and turns chaos into structure.' },
      idealScene: { 'zh-CN': '适合复杂协作、上线前冲刺、需要兜底的任务。', en: 'Best in complex collaboration, launch sprints, and rescue missions.' },
      reminder: { 'zh-CN': '别把稳妥活成犹豫，有时第一枪也得你来开。', en: 'Do not let caution become hesitation; sometimes you need the first shot.' }
    },
    negative: {
      letter: 'R',
      label: { 'zh-CN': '热血派', en: 'Rush mode' },
      descriptor: { 'zh-CN': '情况越刺激，行动条拉得越满。', en: 'The hotter it gets, the faster you move.' },
      strengths: { 'zh-CN': '反应快、启动快，能把团队从停滞里拽出来。', en: 'Starts fast, reacts fast, and unsticks the team.' },
      idealScene: { 'zh-CN': '适合抢时效、做首版、临场救火和高能推进。', en: 'Great for speed runs, first drafts, firefighting, and momentum work.' },
      reminder: { 'zh-CN': '别把激情全花在起跑线上，后半程也要留体力。', en: 'Do not burn all your fuel at the start; save energy for the finish.' }
    }
  },
  {
    key: 'brain',
    icon: Brain,
    theme: 'from-fuchsia-500 to-pink-500',
    positive: {
      letter: 'B',
      label: { 'zh-CN': '脑暴派', en: 'Brainstorm mode' },
      descriptor: { 'zh-CN': '灵感像弹幕，一开口就有新岔路。', en: 'Ideas fire like bullet comments the moment you speak.' },
      strengths: { 'zh-CN': '擅长发散联想，总能提供别人没想到的角度。', en: 'Excels at divergent thinking and finds unexpected angles.' },
      idealScene: { 'zh-CN': '适合创意会、方案破局、内容策划和产品试验。', en: 'Fits ideation, unblock sessions, content planning, and experiments.' },
      reminder: { 'zh-CN': '灵感很贵，但落地也要有人接住。', en: 'Ideas are valuable, but they still need a landing gear.' }
    },
    negative: {
      letter: 'P',
      label: { 'zh-CN': '流程派', en: 'Process mode' },
      descriptor: { 'zh-CN': '先把路径铺平，再让结果自己出现。', en: 'Build the path first and let results follow.' },
      strengths: { 'zh-CN': '擅长拆解目标、排优先级、让推进更可预期。', en: 'Breaks goals down, sets priorities, and makes progress predictable.' },
      idealScene: { 'zh-CN': '适合项目推进、交付管理、文档沉淀和复盘。', en: 'Best in delivery, project tracking, documentation, and review.' },
      reminder: { 'zh-CN': '流程不是护城河，偶尔也要给惊喜留口子。', en: 'Process is not a moat; leave room for surprise.' }
    }
  },
  {
    key: 'truth',
    icon: MessagesSquare,
    theme: 'from-amber-500 to-orange-500',
    positive: {
      letter: 'T',
      label: { 'zh-CN': '直给派', en: 'Truth mode' },
      descriptor: { 'zh-CN': '反馈讲重点，不绕弯，效率优先。', en: 'Goes straight to the point and values clarity.' },
      strengths: { 'zh-CN': '沟通信息密度高，能迅速指出关键问题。', en: 'Communicates with high signal and spots the real issue fast.' },
      idealScene: { 'zh-CN': '适合评审、复盘、卡点排查和关键决策。', en: 'Works well in reviews, retros, debugging, and hard decisions.' },
      reminder: { 'zh-CN': '真诚很重要，但包装一下更容易被采纳。', en: 'Honesty matters, but packaging helps it land.' }
    },
    negative: {
      letter: 'A',
      label: { 'zh-CN': '氛围派', en: 'Atmosphere mode' },
      descriptor: { 'zh-CN': '先照顾气氛，再慢慢把话说到位。', en: 'Protects the vibe first, then moves the point in.' },
      strengths: { 'zh-CN': '共情在线，能让讨论继续而不是原地爆炸。', en: 'Keeps empathy high and conversations moving instead of exploding.' },
      idealScene: { 'zh-CN': '适合跨团队协作、对外沟通和敏感反馈场景。', en: 'Great for cross-team work, external comms, and sensitive feedback.' },
      reminder: { 'zh-CN': '气氛再好，关键结论也要落到纸面上。', en: 'A good vibe still needs a clear conclusion.' }
    }
  },
  {
    key: 'energy',
    icon: MoonStar,
    theme: 'from-emerald-500 to-teal-500',
    positive: {
      letter: 'I',
      label: { 'zh-CN': '独充派', en: 'Intro charge' },
      descriptor: { 'zh-CN': '安静一会儿，电量反而涨得更快。', en: 'Quiet time recharges the battery fast.' },
      strengths: { 'zh-CN': '适合深度思考，能在独立空间里快速回血。', en: 'Thrives in deep focus and restores fast in solo space.' },
      idealScene: { 'zh-CN': '适合深度创作、分析判断和一对一沟通。', en: 'Fits deep creation, analysis, and one-on-one conversations.' },
      reminder: { 'zh-CN': '别总是默默发光，偶尔也要让别人看见你的进度。', en: 'Do not shine in silence all the time; let people see your progress.' }
    },
    negative: {
      letter: 'E',
      label: { 'zh-CN': '出击派', en: 'Extro charge' },
      descriptor: { 'zh-CN': '人越多越来电，互动就是你的充电线。', en: 'The more people around, the more energy you gain.' },
      strengths: { 'zh-CN': '擅长带动气氛、链接资源、把场子热起来。', en: 'Activates the room, connects people, and creates momentum.' },
      idealScene: { 'zh-CN': '适合对外沟通、拉齐认知、活动串场和资源整合。', en: 'Best in outreach, alignment, events, and network building.' },
      reminder: { 'zh-CN': '高频互动之外，也给自己留一点独立思考时间。', en: 'Balance constant interaction with some quiet thinking time.' }
    }
  }
];

const questions: Question[] = [
  {
    id: 1,
    dimension: 'stability',
    prompt: {
      'zh-CN': '项目截止时间突然提前一天，你第一反应是？',
      en: 'The project deadline suddenly moves one day earlier. What is your first instinct?'
    },
    detail: {
      'zh-CN': '选最像你日常操作的那个。',
      en: 'Pick the one that feels closest to your real default.'
    },
    options: [
      {
        label: { 'zh-CN': '先列优先级，把必做项稳稳拎出来', en: 'Re-prioritize and lock the must-do items first' },
        value: 1
      },
      {
        label: { 'zh-CN': '先冲起来，边跑边补地图', en: 'Start sprinting immediately and map on the fly' },
        value: -1
      }
    ]
  },
  {
    id: 2,
    dimension: 'brain',
    prompt: {
      'zh-CN': '接到一个全新的点子型任务时，你更像？',
      en: 'When you get a brand-new idea-heavy task, you are more like...'
    },
    detail: {
      'zh-CN': '你的直觉通常更接近哪一边？',
      en: 'Which side feels more natural to you?'
    },
    options: [
      {
        label: { 'zh-CN': '脑洞先飞十公里，疯狂开分支', en: 'Let the brain fly first and open many branches' },
        value: 1
      },
      {
        label: { 'zh-CN': '先搭结构骨架，再往里填内容', en: 'Lay out the structure first and fill it in' },
        value: -1
      }
    ]
  },
  {
    id: 3,
    dimension: 'truth',
    prompt: {
      'zh-CN': '朋友让你评价他刚做完的 demo，你通常会？',
      en: 'A friend asks for feedback on a fresh demo. You usually...'
    },
    detail: {
      'zh-CN': '这里没有正确答案，只有真实作风。',
      en: 'There is no right answer here, only style.'
    },
    options: [
      {
        label: { 'zh-CN': '直接指出最该改的地方，省时间', en: 'Point out the biggest issue directly and save time' },
        value: 1
      },
      {
        label: { 'zh-CN': '先夸亮点，再柔和地把建议递过去', en: 'Start with praise, then ease the suggestions in' },
        value: -1
      }
    ]
  },
  {
    id: 4,
    dimension: 'energy',
    prompt: {
      'zh-CN': '一个高强度周结束后，你最容易回血的方式是？',
      en: 'After an intense week, what restores your energy fastest?'
    },
    detail: {
      'zh-CN': '按你的充电方式选。',
      en: 'Choose your actual recharge pattern.'
    },
    options: [
      {
        label: { 'zh-CN': '耳机一戴，自己待一会儿就活了', en: 'Headphones on, a little solo time, and I am back' },
        value: 1
      },
      {
        label: { 'zh-CN': '喊人聚一波，聊着聊着就满电', en: 'Gather people and talk my way back to full battery' },
        value: -1
      }
    ]
  },
  {
    id: 5,
    dimension: 'stability',
    prompt: {
      'zh-CN': '消息、需求、临时变更一起砸过来时，你会？',
      en: 'When messages, requests, and change notices all hit at once, you...'
    },
    detail: {
      'zh-CN': '这是你的“混乱应对姿势”。',
      en: 'This is your chaos-response pose.'
    },
    options: [
      {
        label: { 'zh-CN': '先静音、分类、归堆，再一件件解决', en: 'Mute, sort, cluster, then solve one by one' },
        value: 1
      },
      {
        label: { 'zh-CN': '一边回复一边推进，直接强行并行', en: 'Reply and push forward in parallel immediately' },
        value: -1
      }
    ]
  },
  {
    id: 6,
    dimension: 'brain',
    prompt: {
      'zh-CN': '头脑风暴会上，你更容易成为哪种人？',
      en: 'In a brainstorm meeting, which role do you naturally become?'
    },
    detail: {
      'zh-CN': '看你是点子喷泉，还是推进中控。',
      en: 'Are you the idea fountain or the control tower?'
    },
    options: [
      {
        label: { 'zh-CN': '那个不断抛新梗、把讨论带飞的人', en: 'The one tossing new sparks and lifting the whole room' },
        value: 1
      },
      {
        label: { 'zh-CN': '那个总结成三条行动项的人', en: 'The one who turns it into three concrete action items' },
        value: -1
      }
    ]
  },
  {
    id: 7,
    dimension: 'truth',
    prompt: {
      'zh-CN': '团队讨论要做一个你不认可的决定时，你会？',
      en: 'The team is about to make a decision you do not agree with. You...'
    },
    detail: {
      'zh-CN': '你的表达方式最接近哪一项？',
      en: 'Which expression style sounds like you?'
    },
    options: [
      {
        label: { 'zh-CN': '当场把反对理由讲清楚，避免后患', en: 'Explain the objection on the spot to avoid later pain' },
        value: 1
      },
      {
        label: { 'zh-CN': '先看场面，再找更柔软的说法推进', en: 'Read the room first, then move it forward more gently' },
        value: -1
      }
    ]
  },
  {
    id: 8,
    dimension: 'energy',
    prompt: {
      'zh-CN': '参加活动或跨团队交流时，你更像？',
      en: 'At events or cross-team exchanges, you are more like...'
    },
    detail: {
      'zh-CN': '你是现场补能，还是现场掉电？',
      en: 'Do you charge up there or drain there?'
    },
    options: [
      {
        label: { 'zh-CN': '先找节奏舒服的小范围深聊', en: 'Find a comfortable corner and go deep in small conversations' },
        value: 1
      },
      {
        label: { 'zh-CN': '边走边聊，主打一个全场出击', en: 'Move around, talk around, and activate the whole floor' },
        value: -1
      }
    ]
  }
];

const uiCopy = {
  'zh-CN': {
    badge: 'Astron Playground',
    title: 'SBTI 抽象人格测试',
    subtitle: '最近 SBTI 这类娱乐向人格测试很火，这里做了一个 Astron 版本：更偏工作流脑回路，也保留了轻松一点的抽象感。',
    introTitle: '8 道题，测出你的工作流人格',
    introBody: '它不是严肃心理测量，更像是团队团建、产品共创、朋友互损时的快乐开场白。',
    introPoint1: '4 个维度：节奏、脑洞、表达、充电方式',
    introPoint2: '本地答题，不走后端，不存数据',
    introPoint3: '结果页可直接复制，方便发群里 battle',
    start: '开始测试',
    dimensionTitle: '四个维度',
    questionLabel: '第',
    questionSuffix: '题',
    progressLabel: '当前进度',
    back: '上一题',
    resultTitle: '你的结果出来了',
    resultSubtitle: '这是一份娱乐向画像，建议拿来玩梗，不建议拿来做人事决策。',
    strengths: '你的高光点',
    scene: '最适合的场景',
    reminder: '友情提示',
    traitTitle: '字母拆解',
    retake: '重新测试',
    copy: '复制结果',
    copied: '已复制',
    builtFor: 'Playground 已就位',
    builtForBody: '页面已按独立路由设计，可直接挂到 `/playground`，也适合后续继续扩展更多互动小实验。',
    quizAnchor: '去答题'
  },
  en: {
    badge: 'Astron Playground',
    title: 'SBTI Meme Personality Test',
    subtitle: 'SBTI-style playful personality quizzes are trending, so here is an Astron-flavored version with workflow brains and a slightly absurd vibe.',
    introTitle: '8 quick questions to reveal your workflow persona',
    introBody: 'It is not a serious psychometric tool. It is more of a fun opener for team icebreakers, product jams, and friendly roasting.',
    introPoint1: '4 dimensions: pace, ideation, expression, and recharge style',
    introPoint2: 'Runs entirely on the client, no backend and no stored data',
    introPoint3: 'Copyable result card for instant sharing',
    start: 'Start test',
    dimensionTitle: 'Four dimensions',
    questionLabel: 'Question',
    questionSuffix: '',
    progressLabel: 'Progress',
    back: 'Back',
    resultTitle: 'Your result is ready',
    resultSubtitle: 'This is a playful profile. Great for memes, not for HR decisions.',
    strengths: 'Your highlight reel',
    scene: 'Best-fit scenes',
    reminder: 'Friendly reminder',
    traitTitle: 'Letter breakdown',
    retake: 'Retake',
    copy: 'Copy result',
    copied: 'Copied',
    builtFor: 'Playground is live',
    builtForBody: 'The page is built as a standalone route at `/playground` and leaves room for more interactive experiments later.',
    quizAnchor: 'Take the test'
  }
} as const;

const Playground: React.FC = () => {
  const { language } = useLanguage();
  const copy = uiCopy[language];
  const [hasStarted, setHasStarted] = useState(false);
  const [answers, setAnswers] = useState<Array<1 | -1>>([]);
  const [copied, setCopied] = useState(false);

  const currentIndex = answers.length;
  const isFinished = currentIndex === questions.length;

  const scores = useMemo<Record<DimensionKey, number>>(() => {
    const initialScores: Record<DimensionKey, number> = {
      stability: 0,
      brain: 0,
      truth: 0,
      energy: 0
    };

    answers.forEach((answer, index) => {
      const dimension = questions[index].dimension;
      initialScores[dimension] += answer;
    });

    return initialScores;
  }, [answers]);

  const result = useMemo(() => {
    const selectedProfiles = dimensions.map((dimension) => {
      const profile = scores[dimension.key] >= 0 ? dimension.positive : dimension.negative;
      return {
        key: dimension.key,
        icon: dimension.icon,
        theme: dimension.theme,
        profile
      };
    });

    const code = selectedProfiles.map(({ profile }) => profile.letter).join('');
    const labels = selectedProfiles.map(({ profile }) => profile.label[language]);
    const descriptors = selectedProfiles.map(({ profile }) => profile.descriptor[language]);
    const strengthLines = selectedProfiles.map(({ profile }) => profile.strengths[language]);
    const sceneLines = selectedProfiles.map(({ profile }) => profile.idealScene[language]);
    const reminderLines = selectedProfiles.map(({ profile }) => profile.reminder[language]);

    return {
      code,
      labels,
      descriptors,
      strengths: strengthLines.join(' '),
      scene: sceneLines.join(' '),
      reminder: reminderLines.join(' '),
      selectedProfiles
    };
  }, [language, scores]);

  const currentQuestion = questions[currentIndex];
  const progress = (answers.length / questions.length) * 100;

  const handleStart = () => {
    setHasStarted(true);
    setCopied(false);
  };

  const handleAnswer = (value: 1 | -1) => {
    setAnswers((previous) => [...previous, value]);
    setCopied(false);
  };

  const handleBack = () => {
    setAnswers((previous) => previous.slice(0, -1));
    setCopied(false);
  };

  const handleReset = () => {
    setHasStarted(false);
    setAnswers([]);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }

    const content =
      language === 'zh-CN'
        ? `我在 Astron Playground 的 SBTI 结果是 ${result.code}：${result.labels.join(' / ')}。${result.descriptors.join(' ')}`
        : `My Astron Playground SBTI result is ${result.code}: ${result.labels.join(' / ')}. ${result.descriptors.join(' ')}`;

    await navigator.clipboard.writeText(content);
    setCopied(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navigation />
      <main className="pt-24">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(217,70,239,0.16),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,1),_rgba(2,6,23,1))]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-sky-200">
                <Sparkles className="h-4 w-4" />
                {copy.badge}
              </span>
              <h1 className="mt-6 text-4xl sm:text-5xl font-black tracking-tight">
                {copy.title}
              </h1>
              <p className="mt-6 text-lg text-slate-300 leading-8">
                {copy.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={handleStart}
                  className="inline-flex items-center gap-2 rounded-full bg-sky-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-sky-300"
                >
                  {copy.start}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href="#quiz"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  {copy.quizAnchor}
                </a>
              </div>
            </div>

            <div className="mt-14 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                <h2 className="text-xl font-semibold">{copy.builtFor}</h2>
              </div>
              <p className="mt-3 text-slate-300">{copy.builtForBody}</p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="h-5 w-5 text-sky-300" />
            <h2 className="text-2xl font-bold">{copy.dimensionTitle}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {dimensions.map((dimension) => {
              const Icon = dimension.icon;
              return (
                <div
                  key={dimension.key}
                  className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/20"
                >
                  <div className={`inline-flex rounded-2xl bg-gradient-to-r ${dimension.theme} p-3`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="mt-5">
                    <h3 className="text-lg font-semibold">{dimension.positive.label[language]}</h3>
                    <p className="mt-2 text-sm text-slate-400">{dimension.positive.descriptor[language]}</p>
                  </div>
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <h4 className="text-sm font-semibold text-slate-200">{dimension.negative.label[language]}</h4>
                    <p className="mt-2 text-sm text-slate-400">{dimension.negative.descriptor[language]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="quiz" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {!hasStarted && (
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 sm:p-10 shadow-2xl shadow-slate-950/20">
              <h2 className="text-3xl font-bold">{copy.introTitle}</h2>
              <p className="mt-4 text-slate-300 leading-7">{copy.introBody}</p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[copy.introPoint1, copy.introPoint2, copy.introPoint3].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-fuchsia-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-fuchsia-300"
              >
                {copy.start}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {hasStarted && !isFinished && currentQuestion && (
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 sm:p-10 shadow-2xl shadow-slate-950/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">
                    {language === 'zh-CN'
                      ? `${copy.questionLabel}${currentQuestion.id}${copy.questionSuffix}`
                      : `${copy.questionLabel} ${currentQuestion.id}`}
                  </p>
                  <h2 className="mt-3 text-2xl sm:text-3xl font-bold">{currentQuestion.prompt[language]}</h2>
                  <p className="mt-3 text-slate-400">{currentQuestion.detail[language]}</p>
                </div>
                <div className="min-w-40">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>{copy.progressLabel}</span>
                    <span>{answers.length}/{questions.length}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-sky-400 via-fuchsia-400 to-emerald-400 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-4">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.label[language]}
                    type="button"
                    onClick={() => handleAnswer(option.value)}
                    className="group rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-sky-300/50 hover:bg-sky-400/10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-base sm:text-lg font-semibold text-white">{option.label[language]}</span>
                      <ArrowRight className="mt-1 h-4 w-4 text-slate-500 transition group-hover:text-sky-300" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={answers.length === 0}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {copy.back}
                </button>
              </div>
            </div>
          )}

          {hasStarted && isFinished && (
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 sm:p-10 shadow-2xl shadow-slate-950/20">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
                {copy.resultTitle}
              </p>
              <div className="mt-4 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                <div>
                  <h2 className="text-5xl sm:text-6xl font-black tracking-tight">{result.code}</h2>
                  <p className="mt-4 max-w-2xl text-lg text-slate-300">{result.descriptors.join(' ')}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {result.labels.map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 rounded-full bg-sky-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-300"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? copy.copied : copy.copy}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/5"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {copy.retake}
                  </button>
                </div>
              </div>

              <p className="mt-6 text-sm text-slate-400">{copy.resultSubtitle}</p>

              <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold">{copy.strengths}</h3>
                  <p className="mt-3 text-slate-300 leading-7">{result.strengths}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold">{copy.scene}</h3>
                  <p className="mt-3 text-slate-300 leading-7">{result.scene}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold">{copy.reminder}</h3>
                  <p className="mt-3 text-slate-300 leading-7">{result.reminder}</p>
                </div>
              </div>

              <div className="mt-10">
                <h3 className="text-lg font-semibold">{copy.traitTitle}</h3>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.selectedProfiles.map(({ key, icon: Icon, theme, profile }) => (
                    <div
                      key={key}
                      className="rounded-3xl border border-white/10 bg-slate-950/60 p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`rounded-2xl bg-gradient-to-r ${theme} p-3`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                            {profile.letter}
                          </p>
                          <h4 className="mt-1 text-lg font-semibold">{profile.label[language]}</h4>
                          <p className="mt-2 text-sm text-slate-400">{profile.descriptor[language]}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Playground;
