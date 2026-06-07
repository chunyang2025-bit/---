import type { Game } from './game-types';

export const seedGames: Game[] = [
  {
    id: 'mist-temple',
    title: '雨夜破庙',
    description: '国风修仙开局，三次选择决定你是救人、夺剑，还是被旧神盯上。',
    core_prompt: '国风修仙，破庙暴雨，刺客倒在门外。',
    compiled_prompt: '以国风修仙为基调，生成一个破庙暴雨中的互动短剧本。',
    creator_name: '灵动织造',
    likes_count: 328,
    plays_count: 2461,
    remix_count: 74,
    created_at: '2026-06-07T10:00:00.000Z',
    nodes: [
      {
        node_tag: 'start',
        story_text: '雨像断线的珠子砸在破庙瓦檐。你醒来时，香案下压着一柄无鞘短剑，门外有人低声喊你的名字。',
        image_url: '/scenes/temple.svg',
        bg_color_hex: '#16213a',
        is_ending: false,
        options: [
          { text: '推门查看', next_tag: 'door' },
          { text: '拔出短剑', next_tag: 'sword' },
          { text: '躲到神像后', next_tag: 'idol' }
        ]
      },
      {
        node_tag: 'door',
        story_text: '门外倒着一名黑衣刺客，胸口插着半截桃木签。他看见你，笑着说：“终于等到你转世。”',
        image_url: '/scenes/temple.svg',
        bg_color_hex: '#26324d',
        is_ending: false,
        options: [
          { text: '救他', next_tag: 'save' },
          { text: '追问转世', next_tag: 'truth' }
        ]
      },
      {
        node_tag: 'sword',
        story_text: '短剑一出，庙中所有烛火同时变成青色。剑身映出另一个你，正站在十年前的同一场雨里。',
        image_url: '/scenes/sword.svg',
        bg_color_hex: '#0f3d3e',
        is_ending: false,
        options: [
          { text: '斩断倒影', next_tag: 'cut' },
          { text: '把剑收回', next_tag: 'save' }
        ]
      },
      {
        node_tag: 'idol',
        story_text: '神像背后不是墙，而是一条向下的石阶。阶上刻着你的生辰，最后一行写着：今夜勿信活人。',
        image_url: '/scenes/stairs.svg',
        bg_color_hex: '#21152f',
        is_ending: false,
        options: [
          { text: '沿阶下行', next_tag: 'under' },
          { text: '回到庙门', next_tag: 'door' }
        ]
      },
      {
        node_tag: 'save',
        story_text: '你替刺客拔出木签，雨声骤停。他把一枚铜钱塞进你掌心：“去城南，当铺老板知道你欠了几条命。”',
        image_url: '/scenes/coin.svg',
        bg_color_hex: '#374151',
        is_ending: true,
        options: []
      },
      {
        node_tag: 'truth',
        story_text: '刺客说你曾是斩妖司最后一任司主。话音未落，庙中神像睁眼，称你为逃犯。结局：旧案重启。',
        image_url: '/scenes/idol.svg',
        bg_color_hex: '#3f1d2a',
        is_ending: true,
        options: []
      },
      {
        node_tag: 'cut',
        story_text: '你斩断倒影，也斩断了自己的过去。天亮后，庙外多了一座无名新坟。结局：无根之人。',
        image_url: '/scenes/sword.svg',
        bg_color_hex: '#111827',
        is_ending: true,
        options: []
      },
      {
        node_tag: 'under',
        story_text: '石阶尽头是一间账房，墙上挂满写着你名字的欠条。你不是转世，你是被反复赎回的债。结局：命价未清。',
        image_url: '/scenes/stairs.svg',
        bg_color_hex: '#2b2235',
        is_ending: true,
        options: []
      }
    ]
  },
  {
    id: 'neon-alley',
    title: '赛博城隍',
    description: '霓虹雨巷里的城隍庙，把每个失眠的人都登记成待处理案件。',
    core_prompt: '赛博国潮，午夜城隍庙，失眠者被系统审判。',
    compiled_prompt: '生成赛博国潮风的都市怪谈互动故事。',
    creator_name: '夜行样本',
    likes_count: 512,
    plays_count: 3890,
    remix_count: 119,
    created_at: '2026-06-07T10:08:00.000Z',
    nodes: [
      {
        node_tag: 'start',
        story_text: '凌晨三点，你的手机自动导航到一座夹在便利店和数据中心之间的城隍庙。屏幕弹出：请领取今日判词。',
        image_url: '/scenes/neon-temple.svg',
        bg_color_hex: '#082f49',
        is_ending: false,
        options: [
          { text: '扫描香炉二维码', next_tag: 'qr' },
          { text: '关闭手机离开', next_tag: 'leave' },
          { text: '进入偏殿', next_tag: 'side' }
        ]
      },
      {
        node_tag: 'qr',
        story_text: '二维码打开一份你的梦境记录。系统标红一行：你连续七天梦见同一个陌生人，他正在替你生活。',
        image_url: '/scenes/neon-temple.svg',
        bg_color_hex: '#164e63',
        is_ending: false,
        options: [
          { text: '删除梦境', next_tag: 'delete' },
          { text: '联系陌生人', next_tag: 'call' }
        ]
      },
      {
        node_tag: 'leave',
        story_text: '你转身离开，却在每块橱窗玻璃里看见自己仍跪在庙前。导航提示：路线偏离，福报扣除中。',
        image_url: '/scenes/alley.svg',
        bg_color_hex: '#312e81',
        is_ending: false,
        options: [
          { text: '跑进雨里', next_tag: 'rain' },
          { text: '回去上香', next_tag: 'qr' }
        ]
      },
      {
        node_tag: 'side',
        story_text: '偏殿里供着一排旧硬盘。管理员说：“每个人的阴德都要备份，你想查哪一年？”',
        image_url: '/scenes/server-shrine.svg',
        bg_color_hex: '#0f172a',
        is_ending: false,
        options: [
          { text: '查今年', next_tag: 'thisyear' },
          { text: '查出生前', next_tag: 'before' }
        ]
      },
      {
        node_tag: 'delete',
        story_text: '你按下删除，陌生人的人生瞬间空白。第二天，你醒来时发现自己的名字也从所有系统里消失了。结局：注销成功。',
        image_url: '/scenes/alley.svg',
        bg_color_hex: '#111827',
        is_ending: true,
        options: []
      },
      {
        node_tag: 'call',
        story_text: '电话接通，对面是你的声音：“别回家，我已经把钥匙还给城隍了。”结局：双账户人生。',
        image_url: '/scenes/neon-temple.svg',
        bg_color_hex: '#155e75',
        is_ending: true,
        options: []
      },
      {
        node_tag: 'rain',
        story_text: '雨水像乱码一样落下，你的影子被冲进下水道。城隍庙给你发来评价请求。结局：低分逃亡。',
        image_url: '/scenes/alley.svg',
        bg_color_hex: '#1e1b4b',
        is_ending: true,
        options: []
      },
      {
        node_tag: 'thisyear',
        story_text: '今年的备份只有一个文件：今晚。你意识到这一切正在被实时写入，连犹豫也会计费。结局：活体日志。',
        image_url: '/scenes/server-shrine.svg',
        bg_color_hex: '#1f2937',
        is_ending: true,
        options: []
      },
      {
        node_tag: 'before',
        story_text: '出生前的硬盘里有一段录像：你亲手选择了这座城市和这场失眠。结局：自愿降临。',
        image_url: '/scenes/server-shrine.svg',
        bg_color_hex: '#4c1d95',
        is_ending: true,
        options: []
      }
    ]
  },
  {
    id: 'sealed-room',
    title: '第七间茶室',
    description: '微型密室逃脱。茶盏、屏风、账本和一枚总在变冷的印章。',
    core_prompt: '中式茶馆密室，七个房间，印章谜题。',
    compiled_prompt: '生成一个低成本、文字驱动的中式密室互动故事。',
    creator_name: '南窗谜案',
    likes_count: 227,
    plays_count: 1734,
    remix_count: 42,
    created_at: '2026-06-07T10:16:00.000Z',
    nodes: [
      {
        node_tag: 'start',
        story_text: '你醒在一间无门茶室。桌上七盏茶依次变冷，墙上屏风画着一个正在离席的人。',
        image_url: '/scenes/tea-room.svg',
        bg_color_hex: '#1c1917',
        is_ending: false,
        options: [
          { text: '查看茶盏', next_tag: 'cups' },
          { text: '掀开屏风', next_tag: 'screen' },
          { text: '翻账本', next_tag: 'ledger' }
        ]
      },
      {
        node_tag: 'cups',
        story_text: '七盏茶的水面各映出一扇门，但只有第三盏里的人影与你动作相反。',
        image_url: '/scenes/tea-room.svg',
        bg_color_hex: '#292524',
        is_ending: false,
        options: [
          { text: '喝第三盏', next_tag: 'third' },
          { text: '打翻所有茶', next_tag: 'spill' }
        ]
      },
      {
        node_tag: 'screen',
        story_text: '屏风后仍是屏风，一层层画着你刚才的选择。最里面那层，画中人已经转身看你。',
        image_url: '/scenes/screen.svg',
        bg_color_hex: '#3c2f2f',
        is_ending: false,
        options: [
          { text: '问他出口', next_tag: 'ask' },
          { text: '撕开画布', next_tag: 'tear' }
        ]
      },
      {
        node_tag: 'ledger',
        story_text: '账本只记一笔：你欠茶室主人一个结局。旁边压着一枚冰冷印章，印面刻着“再来”。',
        image_url: '/scenes/ledger.svg',
        bg_color_hex: '#422006',
        is_ending: false,
        options: [
          { text: '盖章', next_tag: 'stamp' },
          { text: '合上账本', next_tag: 'screen' }
        ]
      },
      {
        node_tag: 'third',
        story_text: '茶入口的一刻，房间倒转。你从屏风画里走出来，看见另一个人坐在桌前醒来。结局：换座。',
        image_url: '/scenes/screen.svg',
        bg_color_hex: '#1f2937',
        is_ending: true,
        options: []
      },
      {
        node_tag: 'spill',
        story_text: '茶水流成七条线，汇到墙角成门。你推门而出，发现门外是第一间茶室。结局：循环加一。',
        image_url: '/scenes/tea-room.svg',
        bg_color_hex: '#44403c',
        is_ending: true,
        options: []
      },
      {
        node_tag: 'ask',
        story_text: '画中人说：“出口在你不选的那条路里。”他说完，你的所有选项同时消失。结局：沉默房间。',
        image_url: '/scenes/screen.svg',
        bg_color_hex: '#0f172a',
        is_ending: true,
        options: []
      },
      {
        node_tag: 'tear',
        story_text: '画布裂开，露出一张路演签到表。你的名字后面写着：Demo 体验者。结局：第四面墙。',
        image_url: '/scenes/ledger.svg',
        bg_color_hex: '#3f1d2a',
        is_ending: true,
        options: []
      },
      {
        node_tag: 'stamp',
        story_text: '印章落下，账本自动翻到新页。标题写着你刚刚创造的故事名。结局：成为作者。',
        image_url: '/scenes/ledger.svg',
        bg_color_hex: '#14532d',
        is_ending: true,
        options: []
      }
    ]
  }
];
