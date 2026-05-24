#!/usr/bin/env node

import { readFileSync } from "node:fs";

const args = parseArgs(process.argv.slice(2));
const input = args["script-file"] ? readFileSync(args["script-file"], "utf8") : readStdin();
const script = input.trim();

if (!script) {
  fail("Provide copy through --script-file <path> or stdin.");
}

const stats = analyzeScript(script);
const packet = buildPacket(script, stats);

if (args.json) {
  process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
} else {
  process.stdout.write(renderMarkdown(packet));
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--json") {
      out.json = true;
    } else if (arg === "--script-file") {
      out["script-file"] = argv[++i];
    } else {
      fail(`Unknown argument: ${arg}`);
    }
  }
  return out;
}

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function analyzeScript(text) {
  const stripped = text.replace(/\s+/g, "");
  const hanCount = [...stripped].filter((char) => /\p{Script=Han}/u.test(char)).length;
  const sentenceCount = text
    .split(/[。！？?!\n]+/)
    .map((part) => part.trim())
    .filter(Boolean).length;
  const estimatedSeconds = clamp(Math.round(hanCount / 4.2), 8, 900);
  const compressedSeconds = clamp(Math.round(estimatedSeconds * 0.78), 8, estimatedSeconds);
  const shape = inferShape(text);
  const density = sentenceCount > 10 || hanCount > 320 ? "高" : sentenceCount > 5 ? "中" : "低";

  return {
    hanCount,
    sentenceCount,
    estimatedSeconds,
    compressedSeconds,
    density,
    shape,
  };
}

function inferShape(text) {
  if (/(为什么|原理|方法|步骤|记住|知识|区别)/.test(text)) return "解释型";
  if (/(故事|那天|后来|曾经|直到|突然)/.test(text)) return "叙事型";
  if (/(购买|下单|品牌|产品|价格|优惠)/.test(text)) return "转化型";
  if (/(孤独|情绪|人生|成长|遗憾|治愈)/.test(text)) return "情绪型";
  return "观点型";
}

function buildPacket(text, stats) {
  return {
    analysis: {
      type: stats.shape,
      copyLength: stats.hanCount,
      sentenceCount: stats.sentenceCount,
      rhythmDensity: stats.density,
      estimatedDuration: duration(stats.estimatedSeconds),
      recommendedDuration: duration(stats.compressedSeconds),
      recommendation:
        stats.shape === "解释型"
          ? "保留核心论点，压缩重复解释，镜头以信息支撑和节奏强调为主。"
          : "轻度口播化并压紧节奏，给画面和包装留出清晰落点。",
    },
    recommendedPlan: {
      scriptHandling: "轻度口播化 + 推荐压缩",
      duration: duration(stats.compressedSeconds),
      canvas: "剪映 16:9 横屏",
      voice: "先预览清晰女声、中性叙述声和更有情绪的版本，再生成完整旁白",
      visuals: "素材 API 自动匹配；无合适画面时留占位镜头",
      mediaArchive: "素材下载后按中文内容和情绪重命名；复制到新路径前再次确认",
      packaging: "先预览强包装样式，再确认转场、贴纸、花字和标题处理",
      audio: "旁白 + 可用背景音乐 + 轻中度音效",
      delivery: "生成 D:\\JianyingPro Drafts 草稿，并输出占位镜头清单",
    },
    options: {
      scriptHandling: ["原文配音", "轻度口播化", "压缩版", "扩展版"],
      duration: [
        `保留估算时长 ${duration(stats.estimatedSeconds)}`,
        `压缩到推荐时长 ${duration(stats.compressedSeconds)}`,
        "指定目标时长",
      ],
      canvas: ["剪映 16:9 横屏"],
      voice: ["清晰女声", "沉稳男声", "更快语速", "更强情绪", "用户指定声音"],
      voicePreview: ["确认制作方案后先给可预览声音选项", "选定声音后再生成完整旁白"],
      visuals: ["素材 API 自动匹配", "只用用户素材", "混合模式", "缺镜头留占位"],
      mediaArchive: ["中文内容+情绪重命名", "复制到新路径需再次确认", "保留原下载清单"],
      packaging: ["克制", "标准", "强包装"],
      packagingPreview: ["转场样式预览", "贴纸元素预览", "花字样式预览", "标题包装预览"],
      subtitles: ["基础字幕", "字幕 + 重点词花字", "标题/金句/转场包装更密"],
      audio: ["只要旁白", "旁白 + 背景音乐", "旁白 + 背景音乐 + 音效"],
      delivery: ["指定草稿名", "生成后打开剪映", "保留占位镜头清单"],
    },
    confirmationPrompt:
      "请确认推荐方案，或逐项改动制作单。我收到确认后会先给你配音和包装预览选项，再进入最终生成。",
    sourcePreview: text.length > 220 ? `${text.slice(0, 220)}...` : text,
  };
}

function renderMarkdown(packet) {
  return `**文案判断与推荐目标时长**
- 类型：${packet.analysis.type}
- 文案长度：约 ${packet.analysis.copyLength} 个中文字符，${packet.analysis.sentenceCount} 个句段
- 节奏密度：${packet.analysis.rhythmDensity}
- 估算口播时长：${packet.analysis.estimatedDuration}
- 推荐目标时长：${packet.analysis.recommendedDuration}
- 判断：${packet.analysis.recommendation}

**推荐制作方案**
- 文案：${packet.recommendedPlan.scriptHandling}
- 时长：${packet.recommendedPlan.duration}
- 画布：${packet.recommendedPlan.canvas}
- 配音：${packet.recommendedPlan.voice}
- 画面：${packet.recommendedPlan.visuals}
- 素材归档：${packet.recommendedPlan.mediaArchive}
- 包装：${packet.recommendedPlan.packaging}
- 声音：${packet.recommendedPlan.audio}
- 交付：${packet.recommendedPlan.delivery}

**可调整制作单**
- 文案处理：${packet.options.scriptHandling.join(" / ")}
- 时长策略：${packet.options.duration.join(" / ")}
- 视频规格：${packet.options.canvas.join(" / ")}
- 配音策略：${packet.options.voice.join(" / ")}
- 配音预览：${packet.options.voicePreview.join(" / ")}
- 画面策略：${packet.options.visuals.join(" / ")}
- 素材归档：${packet.options.mediaArchive.join(" / ")}
- 包装强度：${packet.options.packaging.join(" / ")}
- 包装预览：${packet.options.packagingPreview.join(" / ")}
- 字幕与花字：${packet.options.subtitles.join(" / ")}
- 声音层：${packet.options.audio.join(" / ")}
- 草稿交付：${packet.options.delivery.join(" / ")}

**等待确认**
${packet.confirmationPrompt}
`;
}

function duration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes ? `${minutes}分${String(remainder).padStart(2, "0")}秒` : `${remainder}秒`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
