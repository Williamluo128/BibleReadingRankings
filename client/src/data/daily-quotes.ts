export type DailyQuoteKind = 'scripture' | 'saying';

export interface DailyQuoteItem {
  kind: DailyQuoteKind;
  text: string;
  reference: string;
}

/** 精选经文与关于神话语的名言，按年内日期轮换展示 */
export const DAILY_QUOTES: DailyQuoteItem[] = [
  {
    kind: 'scripture',
    text: '神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不致灭亡，反得永生。',
    reference: '约翰福音 3:16',
  },
  {
    kind: 'scripture',
    text: '我靠着那加给我力量的，凡事都能做。',
    reference: '腓立比书 4:13',
  },
  {
    kind: 'scripture',
    text: '耶和华是我的牧者，我必不致缺乏。',
    reference: '诗篇 23:1',
  },
  {
    kind: 'scripture',
    text: '你不要害怕，因为我与你同在；不要惊惶，因为我是你的神。我必坚固你，我必帮助你。',
    reference: '以赛亚书 41:10',
  },
  {
    kind: 'scripture',
    text: '凡劳苦担重担的人可以到我这里来，我就使你们得安息。',
    reference: '马太福音 11:28',
  },
  {
    kind: 'scripture',
    text: '我们晓得万事都互相效力，叫爱神的人得益处，就是按他旨意被召的人。',
    reference: '罗马书 8:28',
  },
  {
    kind: 'scripture',
    text: '我岂没有吩咐你吗？你当刚强壮胆！不要惧怕，也不要惊惶，因为你无论往哪里去，耶和华你的神必与你同在。',
    reference: '约书亚记 1:9',
  },
  {
    kind: 'scripture',
    text: '你要专心仰赖耶和华，不可倚靠自己的聪明，在你一切所行的事上都要认定他，他必指引你的路。',
    reference: '箴言 3:5-6',
  },
  {
    kind: 'scripture',
    text: '他对我说：「我的恩典够你用的，因为我的能力是在人的软弱上显得完全。」',
    reference: '哥林多后书 12:9',
  },
  {
    kind: 'scripture',
    text: '神是我们的避难所，是我们的力量，是我们在患难中随时的帮助。',
    reference: '诗篇 46:1',
  },
  {
    kind: 'scripture',
    text: '但那等候耶和华的必从新得力。他们必如鹰展翅上腾；他们奔跑却不困倦，行走却不疲乏。',
    reference: '以赛亚书 40:31',
  },
  {
    kind: 'scripture',
    text: '你的话是我脚前的灯，是我路上的光。',
    reference: '诗篇 119:105',
  },
  {
    kind: 'scripture',
    text: '我们爱，因为神先爱我们。',
    reference: '约翰一书 4:19',
  },
  {
    kind: 'scripture',
    text: '世人哪，耶和华已指示你何为善。他向你所要的是：施行公义，爱好怜悯，谦卑地与你的神同行。',
    reference: '弥迦书 6:8',
  },
  {
    kind: 'scripture',
    text: '你们要将一切的忧虑卸给神，因为他顾念你们。',
    reference: '彼得前书 5:7',
  },
  {
    kind: 'scripture',
    text: '应当一无挂虑，只要凡事借着祷告、祈求和感谢，将你们所要的告诉神。',
    reference: '腓立比书 4:6',
  },
  {
    kind: 'scripture',
    text: '耶和华靠近伤心的人，拯救灵里懊悔的人。',
    reference: '诗篇 34:18',
  },
  {
    kind: 'scripture',
    text: '我虽行过死荫的幽谷，也不怕遭害，因为你与我同在；你的杖，你的竿，都安慰我。',
    reference: '诗篇 23:4',
  },
  {
    kind: 'scripture',
    text: '你们要将当行的道指示我；因你是我的神。求你用你的灵引我到平坦之地。',
    reference: '诗篇 143:10',
  },
  {
    kind: 'scripture',
    text: '神赐给他儿子，也赐给我们一切，与儿子同作神的后嗣，是借着那爱我们的主。',
    reference: '罗马书 8:32',
  },
  {
    kind: 'scripture',
    text: '你们祈求，就给你们；寻找，就寻见；叩门，就给你们开门。',
    reference: '马太福音 7:7',
  },
  {
    kind: 'scripture',
    text: '所以，你们要先求他的国和他的义，这些东西都要加给你们了。',
    reference: '马太福音 6:33',
  },
  {
    kind: 'scripture',
    text: '我留下平安给你们；我将我的平安赐给你们。我所赐的，不像世人所赐的。',
    reference: '约翰福音 14:27',
  },
  {
    kind: 'scripture',
    text: '因为神赐给我们，不是胆怯的心，乃是刚强、仁爱、谨守的心。',
    reference: '提摩太后书 1:7',
  },
  {
    kind: 'scripture',
    text: '你们要将主的道存在心里，昼夜思想，好叫你们谨守遵行他的一切话。',
    reference: '约书亚记 1:8',
  },
  {
    kind: 'scripture',
    text: '你的作为本为大；你的心思甚深。',
    reference: '诗篇 92:5',
  },
  {
    kind: 'scripture',
    text: '耶和华啊，你的慈爱诸天满地，你的信实达到穹苍。',
    reference: '诗篇 36:5',
  },
  {
    kind: 'scripture',
    text: '你们要彼此相爱，像我爱你们一样；这就是我的命令。',
    reference: '约翰福音 15:12',
  },
  {
    kind: 'scripture',
    text: '你们必晓得真理，真理必叫你们得以自由。',
    reference: '约翰福音 8:32',
  },
  {
    kind: 'scripture',
    text: '神为爱他的人所预备的，是眼睛未曾看见，耳朵未曾听见，人心也未曾想到的。',
    reference: '哥林多前书 2:9',
  },
  {
    kind: 'saying',
    text: '圣经是神写给人类的情书。',
    reference: '司布真',
  },
  {
    kind: 'saying',
    text: '读圣经不是为了知道更多，而是为了更爱基督。',
    reference: '马丁·路德',
  },
  {
    kind: 'saying',
    text: '神话语不仅是用来阅读的，更是用来生活的。',
    reference: '钟马田',
  },
  {
    kind: 'saying',
    text: '你若不读圣经，就无法认识那位在圣经中启示自己的神。',
    reference: '约翰·加尔文',
  },
  {
    kind: 'saying',
    text: '圣经是信仰的唯一准则，也是灵魂的食粮。',
    reference: '约翰·卫斯理',
  },
  {
    kind: 'saying',
    text: '我渴望认识基督，并被他认识——这只能从神话语开始。',
    reference: '奥古斯丁',
  },
  {
    kind: 'saying',
    text: '每天读一点圣经，就像每天从永恒之泉汲取活水。',
    reference: 'C.S. 路易斯',
  },
  {
    kind: 'saying',
    text: '神话语能照亮幽暗之处，也能坚固软弱之心。',
    reference: '宋尚节',
  },
  {
    kind: 'saying',
    text: '不是读了圣经就自然敬虔，但若不读圣经，敬虔无从建立。',
    reference: '巴刻',
  },
  {
    kind: 'saying',
    text: '神的话安定在天，也当安定在我们每日的默想里。',
    reference: '乔治·穆勒',
  },
  {
    kind: 'saying',
    text: '圣经不是让人成为专家，而是让人认识救主。',
    reference: '达秘',
  },
  {
    kind: 'saying',
    text: '在神话语面前，我们学习谦卑，也学习盼望。',
    reference: '侯活沙',
  },
  {
    kind: 'saying',
    text: '每一次打开圣经，都是一次与神相遇的机会。',
    reference: '倪柝声',
  },
  {
    kind: 'saying',
    text: '神的话比金银更宝贵，比蜜更甘甜。',
    reference: '司布真',
  },
  {
    kind: 'saying',
    text: '读经不是完成任务，而是与神同行。',
    reference: '芬尼',
  },
  {
    kind: 'saying',
    text: '圣经告诉我们神是谁，也告诉我们我们当如何回应他。',
    reference: '华理克',
  },
  {
    kind: 'saying',
    text: '在患难中，神话语是我们脚前的灯，也是心里的锚。',
    reference: '杨以德',
  },
  {
    kind: 'saying',
    text: '神的话永不改变；我们需要的，是日日亲近它。',
    reference: '慕安得烈',
  },
  {
    kind: 'saying',
    text: '读圣经最大的果效，是让我们的心更像基督。',
    reference: '宾路易',
  },
  {
    kind: 'saying',
    text: '圣经是神对人说的话；祷告是人对神说的话。',
    reference: '托马斯·肯培',
  },
];
