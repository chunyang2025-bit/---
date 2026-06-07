const bannedKeywords = [
  '原神',
  '米哈游',
  '宝可梦',
  '任天堂',
  '腾讯游戏',
  '网易游戏',
  'genshin',
  'mihoyo',
  'pokemon',
  'nintendo',
  'nsfw'
];

export function moderateText(input: string) {
  const normalized = input.toLowerCase();
  const hit = bannedKeywords.find((keyword) => normalized.includes(keyword.toLowerCase()));

  if (!input.trim()) {
    return {
      safe: false,
      reason: '请输入一个故事创意。'
    };
  }

  if (hit) {
    return {
      safe: false,
      reason: '检测到包含受保护的版权 IP 或敏感词，请换个充满创意的词汇吧！'
    };
  }

  return {
    safe: true,
    reason: ''
  };
}
