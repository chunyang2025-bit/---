import { NextResponse } from 'next/server';
import { moderateText } from '@/lib/moderation';
import type { Game } from '@/lib/game-types';

type GenerateBody = {
  prompt?: string;
  parent_id?: string;
};

function pickPalette(prompt: string) {
  if (/茶|密室|案|谜/.test(prompt)) {
    return ['#1c1917', '#3c2f2f', '#422006'];
  }

  if (/赛博|城市|霓虹|未来/.test(prompt)) {
    return ['#082f49', '#164e63', '#312e81'];
  }

  if (/修仙|武侠|剑|妖/.test(prompt)) {
    return ['#16213a', '#0f3d3e', '#21152f'];
  }

  return ['#0f172a', '#1f2937', '#3f1d2a'];
}

function createMockGame(prompt: string, parentId?: string): Game {
  const safePrompt = prompt.trim();
  const palette = pickPalette(safePrompt);
  const seed = Math.abs(
    safePrompt.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  );
  const id = `demo-${Date.now()}-${seed.toString(36)}`;
  const titleSeeds = ['未命名雨夜', '折叠城隍', '纸上密室', '霓虹旧案', '风过无门'];
  const title = titleSeeds[seed % titleSeeds.length];

  return {
    id,
    title,
    description: `由创意“${safePrompt.slice(0, 28)}${safePrompt.length > 28 ? '...' : ''}”生成的互动短剧本。`,
    core_prompt: safePrompt,
    compiled_prompt: `基于用户创意生成一个中文互动短剧本：${safePrompt}`,
    creator_name: '你',
    parent_id: parentId,
    likes_count: 0,
    plays_count: 1,
    remix_count: 0,
    created_at: new Date().toISOString(),
    nodes: [
      {
        node_tag: 'start',
        story_text: `你被一句念头像钥匙一样推进故事：“${safePrompt}”。眼前的场景刚刚成形，空气里有墨、雨和电流的味道。`,
        image_url: '/scenes/generated.svg',
        bg_color_hex: palette[0],
        is_ending: false,
        options: [
          { text: '向最亮处走', next_tag: 'bright' },
          { text: '听从暗处声音', next_tag: 'dark' },
          { text: '改写第一条规则', next_tag: 'rewrite' }
        ]
      },
      {
        node_tag: 'bright',
        story_text: '光里站着一位记录员，手中册页自动写下你的选择。他说：“你不是角色，你是这段剧情的变量。”',
        image_url: '/scenes/generated.svg',
        bg_color_hex: palette[1],
        is_ending: false,
        options: [
          { text: '签下名字', next_tag: 'sign' },
          { text: '抢走册页', next_tag: 'book' }
        ]
      },
      {
        node_tag: 'dark',
        story_text: '暗处的声音熟悉得可怕，像多年后的你在提醒现在的你：别让故事太快结束。',
        image_url: '/scenes/generated.svg',
        bg_color_hex: palette[2],
        is_ending: false,
        options: [
          { text: '相信未来的自己', next_tag: 'future' },
          { text: '点亮一根火柴', next_tag: 'match' }
        ]
      },
      {
        node_tag: 'rewrite',
        story_text: '你删掉第一条规则，世界短暂黑屏。重启后，所有人都记得你刚才改过命运。',
        image_url: '/scenes/generated.svg',
        bg_color_hex: '#14532d',
        is_ending: true,
        options: []
      },
      {
        node_tag: 'sign',
        story_text: '名字落下后，册页合拢。你获得这个世界的临时通行权，也欠它一个更好的结局。结局：签约主角。',
        image_url: '/scenes/generated.svg',
        bg_color_hex: '#1f2937',
        is_ending: true,
        options: []
      },
      {
        node_tag: 'book',
        story_text: '册页被你抢走，里面每一页都是别人没有发布的草稿。你决定把第一篇投进信息流。结局：偷来的爆款。',
        image_url: '/scenes/generated.svg',
        bg_color_hex: '#422006',
        is_ending: true,
        options: []
      },
      {
        node_tag: 'future',
        story_text: '未来的你笑了：“好，这次我们不逃。”故事向外扩散，成为一条新的 Remix 血脉。结局：分支诞生。',
        image_url: '/scenes/generated.svg',
        bg_color_hex: '#0f3d3e',
        is_ending: true,
        options: []
      },
      {
        node_tag: 'match',
        story_text: '火柴亮起，你看见暗处挤满了尚未生成的角色。他们齐声问：轮到我们了吗？结局：等待上线。',
        image_url: '/scenes/generated.svg',
        bg_color_hex: '#4c1d95',
        is_ending: true,
        options: []
      }
    ]
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as GenerateBody;
  const prompt = body.prompt ?? '';
  const moderation = moderateText(prompt);

  if (!moderation.safe) {
    return NextResponse.json({ error: moderation.reason }, { status: 400 });
  }

  return NextResponse.json({ game: createMockGame(prompt, body.parent_id) });
}
