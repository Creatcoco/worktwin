import { NextRequest, NextResponse } from "next/server";
import { issueCaptcha } from "@/lib/server/captcha-store";
import { checkRateLimit, RATE_LIMIT_WINDOW_SECONDS, resolveRateLimitKey } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 拼图画布尺寸 */
const BG_W = 300;
const BG_H = 160;
const PUZZLE_SIZE = 42;
const TRACK_WIDTH = BG_W - PUZZLE_SIZE;

/** 随机配色 */
function randomPalette() {
  const hue1 = Math.floor(Math.random() * 360);
  const hue2 = (hue1 + 40 + Math.floor(Math.random() * 80)) % 360;
  return { hue1, hue2 };
}

/** 干扰噪点 */
function noiseDots(count: number): string {
  let dots = "";
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * BG_W);
    const y = Math.floor(Math.random() * BG_H);
    const r = Math.floor(Math.random() * 3) + 1;
    const o = (Math.random() * 0.15).toFixed(2);
    dots += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${o}"/>`;
  }
  return dots;
}

/**
 * 圆角矩形 path（拼图块形状）。
 * 用简单圆角矩形，不画带凸起的复杂 path——复杂 path 的坐标特征容易被反推。
 */
function roundedRectPath(w: number, h: number, r: number): string {
  return `M${r},0 L${w - r},0 Q${w},0 ${w},${r} L${w},${h - r} Q${w},${h} ${w - r},${h} L${r},${h} Q0,${h} 0,${h - r} L0,${r} Q0,0 ${r},0 Z`;
}

/**
 * 把数值「打散」成不可直接反推的偏移：拼图缺口的真实 X 用两层位移叠加，
 * 前端即使解析 SVG 也只能拿到两个分量，无法简单重组出 answerX。
 * 注意：这只是增加反推成本，真正的安全保障是 verifyCaptcha 用后即焚 + 频控。
 */
function splitOffset(target: number): { a: number; b: number } {
  const a = Math.floor(target / 2) + 13;
  const b = target - a;
  return { a, b };
}

/**
 * 生成带缺口的背景图 + 拼图块。
 *
 * 安全要点：
 * - answerX 只存服务端 captcha-store，绝不进响应
 * - 缺口用「两层偏移叠加 + 模糊暗块」渲染，不直接写 translate(answerX)
 * - 拼图块无位置信息，纯形状
 */
function generatePuzzle() {
  const { hue1, hue2 } = randomPalette();
  const minGap = PUZZLE_SIZE + 12;
  const answerX = minGap + Math.floor(Math.random() * (TRACK_WIDTH - minGap * 2 + 1));
  const answerY = Math.floor(Math.random() * (BG_H - PUZZLE_SIZE - 20)) + 10;

  const shapePath = roundedRectPath(PUZZLE_SIZE, PUZZLE_SIZE, 8);
  const { a, b } = splitOffset(answerX);

  // 背景图：渐变 + 噪点 + 缺口（用两层叠加偏移渲染，避免直接暴露 answerX）
  const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="${BG_W}" height="${BG_H}" viewBox="0 0 ${BG_W} ${BG_H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue1}, 55%, 32%)"/>
      <stop offset="100%" stop-color="hsl(${hue2}, 60%, 22%)"/>
    </linearGradient>
    <linearGradient id="pc" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue1}, 70%, 62%)"/>
      <stop offset="100%" stop-color="hsl(${hue2}, 75%, 52%)"/>
    </linearGradient>
  </defs>
  <rect width="${BG_W}" height="${BG_H}" fill="url(#bg)"/>
  ${noiseDots(70)}
  <g transform="translate(${a},0)">
    <g transform="translate(${b},${answerY})">
      <path d="${shapePath}" fill="rgba(6,7,13,0.7)" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>
    </g>
  </g>
</svg>`;

  // 拼图块：纯形状，无任何位置/坐标信息
  const piece = `<svg xmlns="http://www.w3.org/2000/svg" width="${PUZZLE_SIZE}" height="${PUZZLE_SIZE}" viewBox="0 0 ${PUZZLE_SIZE} ${PUZZLE_SIZE}">
  <path d="${shapePath}" fill="url(#pc)" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
</svg>`;

  const toDataUrl = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return {
    bgDataUrl: toDataUrl(bg),
    puzzleDataUrl: toDataUrl(piece),
    puzzleSize: PUZZLE_SIZE,
    trackWidth: TRACK_WIDTH,
    canvasWidth: BG_W,
    canvasHeight: BG_H,
    answerX,
    answerY,
  };
}

export async function GET(request: NextRequest) {
  // 验证码接口放宽频控：60 秒 10 次（用户刷新/拖错重试都要换图，不能像写接口那样 1 分钟 1 次）
  // 仍能挡住机器人狂刷盗图（>10/分钟才拦）
  const { key } = resolveRateLimitKey(request);
  const limit = checkRateLimit(`captcha:${key}`, 10);
  if (!limit.allowed) {
    return NextResponse.json(
      { message: `请求过于频繁，请 ${limit.retryAfterSeconds} 秒后再试` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds || RATE_LIMIT_WINDOW_SECONDS) } }
    );
  }

  const puzzle = generatePuzzle();
  const token = issueCaptcha(puzzle.answerX);

  // answerX 绝不返回前端，只留服务端校验
  // answerY 返回前端：垂直位置不是安全敏感值（防机器人靠的是未知的 X），用于让拼图块对齐缺口高度
  return NextResponse.json({
    token,
    bgDataUrl: puzzle.bgDataUrl,
    puzzleDataUrl: puzzle.puzzleDataUrl,
    puzzleSize: puzzle.puzzleSize,
    trackWidth: puzzle.trackWidth,
    canvasWidth: puzzle.canvasWidth,
    canvasHeight: puzzle.canvasHeight,
    puzzleY: puzzle.answerY,
  });
}
