export type DailyQuoteKind = 'scripture' | 'saying';

export interface DailyQuoteItem {
  kind: DailyQuoteKind;
  text: string;
  reference: string;
}

/** 精选经文与关于神话语的名言（436 条），按年内日期轮换展示 */
export const DAILY_QUOTES: DailyQuoteItem[] = [
  {
    kind: 'scripture',
    text: '起初，神创造天地。',
    reference: '创世记 1:1'
  },
  {
    kind: 'scripture',
    text: '神就照着自己的形像、照着神的形像造人，乃是照着他的形像造男造女。',
    reference: '创世记 1:27'
  },
  {
    kind: 'scripture',
    text: '耶和华神用地上的尘土造人，将生气吹在他鼻孔里，他就成了有灵的活人。',
    reference: '创世记 2:7'
  },
  {
    kind: 'scripture',
    text: '耶和华对亚伯兰说：「你要离开本地、本族、父家，往我所要指示你的地去。」',
    reference: '创世记 12:1'
  },
  {
    kind: 'scripture',
    text: '亚伯兰信耶和华，耶和华就以此为他的义。',
    reference: '创世记 15:6'
  },
  {
    kind: 'scripture',
    text: '我也与你同在。你无论往哪里去，我必保佑你，领你归回这地，总不离弃你。',
    reference: '创世记 28:15'
  },
  {
    kind: 'scripture',
    text: '从前你们的意思是要害我，但神的意思原是好的，要保全许多人的性命。',
    reference: '创世记 50:20'
  },
  {
    kind: 'scripture',
    text: '耶和华必为你们争战，你们只管安静，不要作声。',
    reference: '出埃及记 14:14'
  },
  {
    kind: 'scripture',
    text: '耶和华是我的力量，是我的诗歌，也成了我的拯救。',
    reference: '出埃及记 15:2'
  },
  {
    kind: 'scripture',
    text: '除了我以外，你不可有别的神。',
    reference: '出埃及记 20:3'
  },
  {
    kind: 'scripture',
    text: '我必亲自和你同去，使你得安息。',
    reference: '出埃及记 33:14'
  },
  {
    kind: 'scripture',
    text: '耶和华，耶和华，是有怜悯有恩典的神，不轻易发怒，并有丰盛的慈爱和诚实。',
    reference: '出埃及记 34:6'
  },
  {
    kind: 'scripture',
    text: '你们要圣洁，因为我耶和华你们的神是圣洁的。',
    reference: '利未记 19:2'
  },
  {
    kind: 'scripture',
    text: '不可报仇，也不可埋怨你本国的子民，却要爱人如己。',
    reference: '利未记 19:18'
  },
  {
    kind: 'scripture',
    text: '愿耶和华赐福给你，保护你。',
    reference: '民数记 6:24'
  },
  {
    kind: 'scripture',
    text: '神非人，必不致说谎，也非人子，必不致后悔。',
    reference: '民数记 23:19'
  },
  {
    kind: 'scripture',
    text: '你要尽心、尽性、尽力爱耶和华你的神。',
    reference: '申命记 6:5'
  },
  {
    kind: 'scripture',
    text: '我今日所吩咐你的话都要记在心上，也要殷勤教训你的儿女。',
    reference: '申命记 6:6-7'
  },
  {
    kind: 'scripture',
    text: '你们当刚强壮胆，不要害怕，也不要惊惶，因为耶和华你的神必与你同去。',
    reference: '申命记 31:6'
  },
  {
    kind: 'scripture',
    text: '耶和华必在你前面行。他必与你同在，必不撇下你，也不丢弃你。',
    reference: '申命记 31:8'
  },
  {
    kind: 'scripture',
    text: '这律法书不可离开你的口，总要昼夜思想，好使你谨守遵行。',
    reference: '约书亚记 1:8'
  },
  {
    kind: 'scripture',
    text: '我岂没有吩咐你吗？你当刚强壮胆！不要惧怕，也不要惊惶。',
    reference: '约书亚记 1:9'
  },
  {
    kind: 'scripture',
    text: '至于我和我家，我们必定事奉耶和华。',
    reference: '约书亚记 24:15'
  },
  {
    kind: 'scripture',
    text: '耶和华是和平。」因此他称那坛为「耶和华沙龙」。',
    reference: '士师记 6:24'
  },
  {
    kind: 'scripture',
    text: '你在哪里，我也在哪里；你的国就是我的国；你的神就是我的神。',
    reference: '路得记 1:16'
  },
  {
    kind: 'scripture',
    text: '人是看外貌，耶和华是看内心。',
    reference: '撒母耳记上 16:7'
  },
  {
    kind: 'scripture',
    text: '至于神的道，全然是稳妥的；他保护一切投靠他的人。',
    reference: '撒母耳记下 22:31'
  },
  {
    kind: 'scripture',
    text: '天下诸神中，岂有像你的神耶和华，在天上地下有应许施恩与那专心行在你面前的仆人。',
    reference: '列王纪上 8:23'
  },
  {
    kind: 'scripture',
    text: '不要惧怕！与我们同在的比与他们同在的更多。',
    reference: '列王纪下 6:16'
  },
  {
    kind: 'scripture',
    text: '这称为我名下的子民，若自卑、祷告、寻求我的面，转离他们的恶行，我必从天上垂听，赦免他们的罪。',
    reference: '历代志下 7:14'
  },
  {
    kind: 'scripture',
    text: '耶和华的眼目遍察全地，要坚立全心向他的人。',
    reference: '历代志下 16:9'
  },
  {
    kind: 'scripture',
    text: '以斯拉定志考究遵行耶和华的律法，又将律例典章教训以色列人。',
    reference: '以斯拉记 7:10'
  },
  {
    kind: 'scripture',
    text: '你们不要忧愁，因靠耶和华而得的喜乐是你们的力量。',
    reference: '尼希米记 8:10'
  },
  {
    kind: 'scripture',
    text: '此时你若闭口不言，犹大人必从别处得解脱蒙拯救。',
    reference: '以斯帖记 4:14'
  },
  {
    kind: 'scripture',
    text: '赏赐的是耶和华，收取的也是耶和华。耶和华的名是应当称颂的。',
    reference: '约伯记 1:21'
  },
  {
    kind: 'scripture',
    text: '我知道我的救赎主活着，末了必站立在地上。',
    reference: '约伯记 19:25'
  },
  {
    kind: 'scripture',
    text: '然而他知道我所行的路；他试炼我之后，我必如精金。',
    reference: '约伯记 23:10'
  },
  {
    kind: 'scripture',
    text: '我从前风闻有你，现在亲眼看见你。',
    reference: '约伯记 42:5'
  },
  {
    kind: 'scripture',
    text: '不从恶人的计谋，不站罪人的道路，不坐亵慢人的座位，惟喜爱耶和华的律法，昼夜思想。',
    reference: '诗篇 1:1-2'
  },
  {
    kind: 'scripture',
    text: '我安然躺下睡觉，独自安居，因为惟有你耶和华使我安然居住。',
    reference: '诗篇 4:8'
  },
  {
    kind: 'scripture',
    text: '你必将生命的道路指示我。在你面前有满足的喜乐；在你右手中有永远的福乐。',
    reference: '诗篇 16:11'
  },
  {
    kind: 'scripture',
    text: '诸天述说神的荣耀；穹苍传扬他的手段。',
    reference: '诗篇 19:1'
  },
  {
    kind: 'scripture',
    text: '耶和华的律法全备，能苏醒人心；耶和华的法度确定，使愚人有智慧。',
    reference: '诗篇 19:7'
  },
  {
    kind: 'scripture',
    text: '耶和华我的磐石，我的救赎主啊，愿我口中的言语、心里的意念在你面前蒙悦纳。',
    reference: '诗篇 19:14'
  },
  {
    kind: 'scripture',
    text: '耶和华是我的牧者，我必不致缺乏。',
    reference: '诗篇 23:1'
  },
  {
    kind: 'scripture',
    text: '我虽行过死荫的幽谷，也不怕遭害，因为你与我同在。',
    reference: '诗篇 23:4'
  },
  {
    kind: 'scripture',
    text: '耶和华是我的亮光，是我的拯救，我还怕谁呢？',
    reference: '诗篇 27:1'
  },
  {
    kind: 'scripture',
    text: '要等候耶和华；当壮胆，坚固你的心！我再说，要等候耶和华！',
    reference: '诗篇 27:14'
  },
  {
    kind: 'scripture',
    text: '我要教导你，指示你当行的路；我要定睛在你身上劝戒你。',
    reference: '诗篇 32:8'
  },
  {
    kind: 'scripture',
    text: '你们要尝尝主恩的滋味，便知道他是美善；投靠他的人有福了！',
    reference: '诗篇 34:8'
  },
  {
    kind: 'scripture',
    text: '耶和华靠近伤心的人，拯救灵里懊悔的人。',
    reference: '诗篇 34:18'
  },
  {
    kind: 'scripture',
    text: '又要以耶和华为乐，他就将你心里所求的赐给你。',
    reference: '诗篇 37:4'
  },
  {
    kind: 'scripture',
    text: '当将你的事交托耶和华，并倚靠他，他就必成全。',
    reference: '诗篇 37:5'
  },
  {
    kind: 'scripture',
    text: '你当默然倚靠耶和华，耐性等候他。',
    reference: '诗篇 37:7'
  },
  {
    kind: 'scripture',
    text: '神是我们的避难所，是我们的力量，是我们在患难中随时的帮助。',
    reference: '诗篇 46:1'
  },
  {
    kind: 'scripture',
    text: '你们要休息，要知道我是神！',
    reference: '诗篇 46:10'
  },
  {
    kind: 'scripture',
    text: '神啊，求你为我造清洁的心，使我里面重新有正直的灵。',
    reference: '诗篇 51:10'
  },
  {
    kind: 'scripture',
    text: '你要把你的重担卸给耶和华，他必抚养你。',
    reference: '诗篇 55:22'
  },
  {
    kind: 'scripture',
    text: '我惧怕的时候要倚靠你。',
    reference: '诗篇 56:3'
  },
  {
    kind: 'scripture',
    text: '我的心默默无声，专等候神；我的救恩从祂而来。',
    reference: '诗篇 62:1'
  },
  {
    kind: 'scripture',
    text: '神啊，你是我的神！我早起来寻求你；我心中渴想你。',
    reference: '诗篇 63:1'
  },
  {
    kind: 'scripture',
    text: '我的肉体和我的心肠衰残；但神是我心里的力量，又是我的福分，直到永远。',
    reference: '诗篇 73:26'
  },
  {
    kind: 'scripture',
    text: '耶和华神是日头，是盾牌。耶和华赐下恩惠和荣耀。',
    reference: '诗篇 84:11'
  },
  {
    kind: 'scripture',
    text: '耶和华啊，求你将你的道指教我；我要照你的真理行。',
    reference: '诗篇 86:11'
  },
  {
    kind: 'scripture',
    text: '求你指教我们怎样数算自己的日子，好叫我们得着智慧的心。',
    reference: '诗篇 90:12'
  },
  {
    kind: 'scripture',
    text: '住在至高者隐密处的，必住在全能者的荫下。',
    reference: '诗篇 91:1'
  },
  {
    kind: 'scripture',
    text: '他必用自己的羽毛遮蔽你，你要投靠在他的翅膀底下。',
    reference: '诗篇 91:4'
  },
  {
    kind: 'scripture',
    text: '我心里多忧多疑，你安慰我，使我的心喜乐。',
    reference: '诗篇 94:19'
  },
  {
    kind: 'scripture',
    text: '当称谢进入他的门；当赞美进入他的院。当感谢他，称颂他的名。',
    reference: '诗篇 100:4'
  },
  {
    kind: 'scripture',
    text: '我的心哪，你要称颂耶和华！不可忘记他的一切恩惠。他赦免你的一切罪孽，医治你的一切疾病。',
    reference: '诗篇 103:2-3'
  },
  {
    kind: 'scripture',
    text: '父亲怎样怜恤他的儿女，耶和华也怎样怜恤敬畏他的人。',
    reference: '诗篇 103:13'
  },
  {
    kind: 'scripture',
    text: '你们要称谢耶和华，因他本为善；他的慈爱永远长存。',
    reference: '诗篇 107:1'
  },
  {
    kind: 'scripture',
    text: '这是耶和华所定的日子，我们在其中要高兴欢喜。',
    reference: '诗篇 118:24'
  },
  {
    kind: 'scripture',
    text: '少年人怎样洁净他的行为呢？是要遵行你的话。',
    reference: '诗篇 119:9'
  },
  {
    kind: 'scripture',
    text: '我将你的话藏在心里，免得我得罪你。',
    reference: '诗篇 119:11'
  },
  {
    kind: 'scripture',
    text: '求你开我的眼睛，使我看出你律法中的奇妙。',
    reference: '诗篇 119:18'
  },
  {
    kind: 'scripture',
    text: '这话在我患难时作我的安慰，因为你的应许保全了我。',
    reference: '诗篇 119:50'
  },
  {
    kind: 'scripture',
    text: '你的话是我脚前的灯，是我路上的光。',
    reference: '诗篇 119:105'
  },
  {
    kind: 'scripture',
    text: '你的言语一解开就发出亮光，使愚人通达。',
    reference: '诗篇 119:130'
  },
  {
    kind: 'scripture',
    text: '我要向山举目；我的帮助从何而来？我的帮助从造天地的耶和华而来。',
    reference: '诗篇 121:1-2'
  },
  {
    kind: 'scripture',
    text: '流泪撒种的，必欢呼收割。',
    reference: '诗篇 126:5'
  },
  {
    kind: 'scripture',
    text: '我等候耶和华，我的心等候；我也仰望他的话。',
    reference: '诗篇 130:5'
  },
  {
    kind: 'scripture',
    text: '我心里安静，如同断过奶的孩子在他母亲的怀里。',
    reference: '诗篇 131:2'
  },
  {
    kind: 'scripture',
    text: '我要称谢你，因我受造，奇妙可畏；你的作为奇妙，这是我心深知道的。',
    reference: '诗篇 139:14'
  },
  {
    kind: 'scripture',
    text: '神啊，求你鉴察我，知道我的心；试炼我，知道我的意念。',
    reference: '诗篇 139:23-24'
  },
  {
    kind: 'scripture',
    text: '求你使我清晨得听你慈爱，因为我是倚靠你。',
    reference: '诗篇 143:8'
  },
  {
    kind: 'scripture',
    text: '凡求告耶和华的，就是诚心求告他的，耶和华便与他们相近。',
    reference: '诗篇 145:18'
  },
  {
    kind: 'scripture',
    text: '他医好伤心的人，裹好他们的伤处。',
    reference: '诗篇 147:3'
  },
  {
    kind: 'scripture',
    text: '凡有气息的都要赞美耶和华！你们要赞美耶和华！',
    reference: '诗篇 150:6'
  },
  {
    kind: 'scripture',
    text: '敬畏耶和华是知识的开端；愚妄人藐视智慧和训诲。',
    reference: '箴言 1:7'
  },
  {
    kind: 'scripture',
    text: '你要专心仰赖耶和华，不可倚靠自己的聪明，在你一切所行的事上都要认定他。',
    reference: '箴言 3:5-6'
  },
  {
    kind: 'scripture',
    text: '你要以财物和一切初熟的土产尊荣耶和华。这样，你的仓房必充满。',
    reference: '箴言 3:9-10'
  },
  {
    kind: 'scripture',
    text: '我儿，你不可轻看耶和华的管教，也不可厌烦他的责备。',
    reference: '箴言 3:11-12'
  },
  {
    kind: 'scripture',
    text: '你要保守你心，胜过保守一切，因为一生的果效是由心发出。',
    reference: '箴言 4:23'
  },
  {
    kind: 'scripture',
    text: '恨能挑启争端，爱能遮掩一切过错。',
    reference: '箴言 10:12'
  },
  {
    kind: 'scripture',
    text: '好施散的，足有余；强灌人的，反致穷乏。',
    reference: '箴言 11:25'
  },
  {
    kind: 'scripture',
    text: '人心忧虑，屈而不伸；一句良言，使心欢乐。',
    reference: '箴言 12:25'
  },
  {
    kind: 'scripture',
    text: '回答柔和，使怒消退；言语暴戾，触动怒气。',
    reference: '箴言 15:1'
  },
  {
    kind: 'scripture',
    text: '耶和华的眼目无处不在；恶人善人，他都鉴察。',
    reference: '箴言 15:3'
  },
  {
    kind: 'scripture',
    text: '你所做的，要交托耶和华，你所谋的，就必成立。',
    reference: '箴言 16:3'
  },
  {
    kind: 'scripture',
    text: '人心筹算自己的道路；惟耶和华指引他的脚步。',
    reference: '箴言 16:9'
  },
  {
    kind: 'scripture',
    text: '朋友乃时常亲爱，弟兄为患难而生。',
    reference: '箴言 17:17'
  },
  {
    kind: 'scripture',
    text: '耶和华的名是坚固台；义人奔入便得安稳。',
    reference: '箴言 18:10'
  },
  {
    kind: 'scripture',
    text: '教养孩童，使他走当行的道，就是到老他也不偏离。',
    reference: '箴言 22:6'
  },
  {
    kind: 'scripture',
    text: '铁磨铁，磨出刃来；朋友相感，也是如此。',
    reference: '箴言 27:17'
  },
  {
    kind: 'scripture',
    text: '神的言语句句都是炼净的；投靠他的，他便作他们的盾牌。',
    reference: '箴言 30:5'
  },
  {
    kind: 'scripture',
    text: '凡事都有定期，天下万务都有定时。',
    reference: '传道书 3:1'
  },
  {
    kind: 'scripture',
    text: '神造万物，各按其时成为美好；又将永生安置在世人心里。',
    reference: '传道书 3:11'
  },
  {
    kind: 'scripture',
    text: '敬畏神，谨守他的诫命，这是人所当尽的本分。',
    reference: '传道书 12:13'
  },
  {
    kind: 'scripture',
    text: '他带我入筵宴所，以爱为旗在我以上。',
    reference: '雅歌 2:4'
  },
  {
    kind: 'scripture',
    text: '你们的罪虽像朱红，必变成雪白；虽红如丹颜，必白如羊毛。',
    reference: '以赛亚书 1:18'
  },
  {
    kind: 'scripture',
    text: '因此，主自己要给你们一个兆头，必有童女怀孕生子，给他起名叫以马内利。',
    reference: '以赛亚书 7:14'
  },
  {
    kind: 'scripture',
    text: '因有一婴孩为我们而生；有一子赐给我们。政权必担在他的肩头上。',
    reference: '以赛亚书 9:6'
  },
  {
    kind: 'scripture',
    text: '耶和华啊，你是我的神；我要尊崇你，我要称谢你的名。',
    reference: '以赛亚书 25:1'
  },
  {
    kind: 'scripture',
    text: '坚心倚赖你的，你必保守他十分平安，因为他倚靠你。',
    reference: '以赛亚书 26:3'
  },
  {
    kind: 'scripture',
    text: '耶和华必然等候，要施恩给你们；必然兴起，好怜悯你们。',
    reference: '以赛亚书 30:18'
  },
  {
    kind: 'scripture',
    text: '草必枯干，花必凋残；惟有我们神的话必永远立定。',
    reference: '以赛亚书 40:8'
  },
  {
    kind: 'scripture',
    text: '他必像牧人牧养自己的羊群，用膀臂聚集羊羔抱在怀中。',
    reference: '以赛亚书 40:11'
  },
  {
    kind: 'scripture',
    text: '你岂不曾知道吗？你岂未曾听见吗？永在的神耶和华，创造地极的主，并不疲乏，也不困倦。',
    reference: '以赛亚书 40:28'
  },
  {
    kind: 'scripture',
    text: '但那等候耶和华的必从新得力。他们必如鹰展翅上腾。',
    reference: '以赛亚书 40:31'
  },
  {
    kind: 'scripture',
    text: '你不要害怕，因为我与你同在；不要惊惶，因为我是你的神。',
    reference: '以赛亚书 41:10'
  },
  {
    kind: 'scripture',
    text: '雅各啊，创造你的耶和华；以色列啊，造成你的那位，现在这样说：你不要害怕，因为我救赎了你。',
    reference: '以赛亚书 43:1'
  },
  {
    kind: 'scripture',
    text: '你从水中经过，我必与你同在；你趟过江河，水必不漫过你。',
    reference: '以赛亚书 43:2'
  },
  {
    kind: 'scripture',
    text: '因我看你为宝为尊，又因我爱你。',
    reference: '以赛亚书 43:4'
  },
  {
    kind: 'scripture',
    text: '耶和华如此说：你们不要记念古昔之事，不要思想旧事。看哪，我要做一件新事。',
    reference: '以赛亚书 43:18-19'
  },
  {
    kind: 'scripture',
    text: '看哪，我将你铭刻在我掌上；你的墙垣常在我眼前。',
    reference: '以赛亚书 49:16'
  },
  {
    kind: 'scripture',
    text: '哪知他为我们的过犯受害，为我们的罪孽压伤。因他受的刑罚，我们得平安。',
    reference: '以赛亚书 53:5'
  },
  {
    kind: 'scripture',
    text: '当趁耶和华可寻找的时候寻找他，相近的时候求告他。',
    reference: '以赛亚书 55:6'
  },
  {
    kind: 'scripture',
    text: '耶和华说：我的意念非同你们的意念，我的道路非同你们的道路。',
    reference: '以赛亚书 55:8-9'
  },
  {
    kind: 'scripture',
    text: '我口所出的话也必如此，决不徒然返回，而要成就我所喜悦的事。',
    reference: '以赛亚书 55:11'
  },
  {
    kind: 'scripture',
    text: '主的灵在我身上，因为他用膏膏我，叫我传福音给贫穷的人。',
    reference: '以赛亚书 61:1'
  },
  {
    kind: 'scripture',
    text: '赐给他们华冠代替灰尘，喜乐油代替悲哀，赞美衣代替忧伤之灵。',
    reference: '以赛亚书 61:3'
  },
  {
    kind: 'scripture',
    text: '我未将你造在腹中，我已知道你；你未出母胎，我已使你分别为圣。',
    reference: '耶利米书 1:5'
  },
  {
    kind: 'scripture',
    text: '倚靠耶和华、以耶和华为可靠的，那人有福了！',
    reference: '耶利米书 17:7'
  },
  {
    kind: 'scripture',
    text: '耶和华说：我知道我向你们所怀的意念是赐平安的意念，不是降灾祸的意念。',
    reference: '耶利米书 29:11'
  },
  {
    kind: 'scripture',
    text: '你们要呼求我，祷告我，我就应允你们。',
    reference: '耶利米书 29:12'
  },
  {
    kind: 'scripture',
    text: '古时耶和华向以色列显现，说：我以永远的爱爱你，因此我以慈爱吸引你。',
    reference: '耶利米书 31:3'
  },
  {
    kind: 'scripture',
    text: '主耶和华啊，你曾用大能和伸出来的膀臂创造天地，在你没有难成的事。',
    reference: '耶利米书 32:17'
  },
  {
    kind: 'scripture',
    text: '你求告我，我就应允你，并将你所不知道的又大又难的事指示你。',
    reference: '耶利米书 33:3'
  },
  {
    kind: 'scripture',
    text: '我们不致消灭，是出于耶和华诸般的慈爱；是因他的怜悯不致断绝。每早晨，这都是新的。',
    reference: '耶利米哀歌 3:22-23'
  },
  {
    kind: 'scripture',
    text: '凡等候耶和华、心里寻求他的，耶和华必施恩给他。',
    reference: '耶利米哀歌 3:25'
  },
  {
    kind: 'scripture',
    text: '我也要赐给你们一个新心，将新灵放在你们里面。',
    reference: '以西结书 36:26'
  },
  {
    kind: 'scripture',
    text: '主耶和华对这些骸骨说：我必使气息进入你们里面，你们就要活了。',
    reference: '以西结书 37:5'
  },
  {
    kind: 'scripture',
    text: '神的名是应当称颂的，从亘古直到永远。',
    reference: '但以理书 2:20'
  },
  {
    kind: 'scripture',
    text: '因为他信靠他的神。',
    reference: '但以理书 6:23'
  },
  {
    kind: 'scripture',
    text: '我喜爱良善，不喜爱祭祀；喜爱认识神，胜于燔祭。',
    reference: '何西阿书 6:6'
  },
  {
    kind: 'scripture',
    text: '耶和华有恩典，有怜悯，不轻易发怒，有丰盛的慈爱，并且后悔不降所说的灾。',
    reference: '约珥书 2:13'
  },
  {
    kind: 'scripture',
    text: '惟愿公平如大水滚滚，使公义如江河滔滔。',
    reference: '阿摩司书 5:24'
  },
  {
    kind: 'scripture',
    text: '世人哪，耶和华已指示你何为善。他向你所要的是：施行公义，爱好怜悯，谦卑地与你的神同行。',
    reference: '弥迦书 6:8'
  },
  {
    kind: 'scripture',
    text: '惟义人因信得生。',
    reference: '哈巴谷书 2:4'
  },
  {
    kind: 'scripture',
    text: '主耶和华是我的力量；他使我的脚快如母鹿的蹄，又使我稳行在高处。',
    reference: '哈巴谷书 3:19'
  },
  {
    kind: 'scripture',
    text: '万军之耶和华说：不是倚靠势力，不是倚靠才能，乃是倚靠我的灵方能成事。',
    reference: '撒迦利亚书 4:6'
  },
  {
    kind: 'scripture',
    text: '万军之耶和华说：你们要将当纳的十分之一全然送入仓库，使我家有粮。',
    reference: '玛拉基书 3:10'
  },
  {
    kind: 'scripture',
    text: '必有童女怀孕生子；人要称他的名为以马内利。（以马内利翻出来就是「神与我们同在」。）',
    reference: '马太福音 1:23'
  },
  {
    kind: 'scripture',
    text: '人活着，不是单靠食物，乃是靠神口里所出的一切话。',
    reference: '马太福音 4:4'
  },
  {
    kind: 'scripture',
    text: '来跟从我，我要叫你们得人如得鱼一样。',
    reference: '马太福音 4:19'
  },
  {
    kind: 'scripture',
    text: '虚心的人有福了！因为天国是他们的。',
    reference: '马太福音 5:3'
  },
  {
    kind: 'scripture',
    text: '哀恸的人有福了！因为他们必得安慰。',
    reference: '马太福音 5:4'
  },
  {
    kind: 'scripture',
    text: '饥渴慕义的人有福了！因为他们必得满足。',
    reference: '马太福音 5:6'
  },
  {
    kind: 'scripture',
    text: '清心的人有福了！因为他们必得见神。',
    reference: '马太福音 5:8'
  },
  {
    kind: 'scripture',
    text: '使人和睦的人有福了！因为他们必称为神的儿子。',
    reference: '马太福音 5:9'
  },
  {
    kind: 'scripture',
    text: '你们是世上的光。城造在山上是不能隐藏的。',
    reference: '马太福音 5:14'
  },
  {
    kind: 'scripture',
    text: '你们的光也当这样照在人前，叫他们看见你们的好行为，便将荣耀归给你们在天上的父。',
    reference: '马太福音 5:16'
  },
  {
    kind: 'scripture',
    text: '你祷告的时候，要进你的内屋，关上门，祷告你在暗中的父。',
    reference: '马太福音 6:6'
  },
  {
    kind: 'scripture',
    text: '我们在天上的父：愿人都尊你的名为圣。愿你的国降临；愿你的旨意行在地上，如同行在天上。',
    reference: '马太福音 6:9-10'
  },
  {
    kind: 'scripture',
    text: '因为你的财宝在哪里，你的心也在哪里。',
    reference: '马太福音 6:21'
  },
  {
    kind: 'scripture',
    text: '你们要先求他的国和他的义，这些东西都要加给你们了。',
    reference: '马太福音 6:33'
  },
  {
    kind: 'scripture',
    text: '所以不要为明天忧虑，因为明天自有明天的忧虑。',
    reference: '马太福音 6:34'
  },
  {
    kind: 'scripture',
    text: '你们祈求，就给你们；寻找，就寻见；叩门，就给你们开门。',
    reference: '马太福音 7:7'
  },
  {
    kind: 'scripture',
    text: '所以，无论何事，你们愿意人怎样待你们，你们也要怎样待人。',
    reference: '马太福音 7:12'
  },
  {
    kind: 'scripture',
    text: '凡劳苦担重担的人可以到我这里来，我就使你们得安息。',
    reference: '马太福音 11:28'
  },
  {
    kind: 'scripture',
    text: '我心里柔和，心里谦卑；你们当负我的轭，学我的样式。',
    reference: '马太福音 11:29'
  },
  {
    kind: 'scripture',
    text: '若有人要跟从我，就当舍己，天天背起他的十字架来跟从我。',
    reference: '马太福音 16:24'
  },
  {
    kind: 'scripture',
    text: '因为在哪里有两三个的人奉我的名聚会，那里就有我在他们中间。',
    reference: '马太福音 18:20'
  },
  {
    kind: 'scripture',
    text: '在人不能，在神凡事都能。',
    reference: '马太福音 19:26'
  },
  {
    kind: 'scripture',
    text: '你要尽心、尽性、尽意爱主你的神。',
    reference: '马太福音 22:37'
  },
  {
    kind: 'scripture',
    text: '天上地下所有的权柄都赐给我了。所以，你们要去，使万民作我的门徒。',
    reference: '马太福音 28:18-20'
  },
  {
    kind: 'scripture',
    text: '日期满了，神的国近了。你们当悔改，信福音！',
    reference: '马可福音 1:15'
  },
  {
    kind: 'scripture',
    text: '在信的人，凡事都能。',
    reference: '马可福音 9:23'
  },
  {
    kind: 'scripture',
    text: '在人是不能，在神却是凡事都能。',
    reference: '马可福音 10:27'
  },
  {
    kind: 'scripture',
    text: '人子来，并不是要受人的服侍，乃是要服侍人，并且要舍命作多人的赎价。',
    reference: '马可福音 10:45'
  },
  {
    kind: 'scripture',
    text: '你要尽心、尽性、尽意、尽力爱主你的神。',
    reference: '马可福音 12:30'
  },
  {
    kind: 'scripture',
    text: '你们往普天下去，传福音给万民听。',
    reference: '马可福音 16:15'
  },
  {
    kind: 'scripture',
    text: '因为出于神的话，没有一句不带能力的。',
    reference: '路加福音 1:37'
  },
  {
    kind: 'scripture',
    text: '我灵以神我的救主为乐。',
    reference: '路加福音 1:47'
  },
  {
    kind: 'scripture',
    text: '不要惧怕！我报给你们大喜的信息，是关乎万民的。因今天在大卫城里，为你们生了救主，就是主基督。',
    reference: '路加福音 2:10-11'
  },
  {
    kind: 'scripture',
    text: '在至高之处荣耀归与神！在地上平安归与他所喜悦的人！',
    reference: '路加福音 2:14'
  },
  {
    kind: 'scripture',
    text: '你们愿意人怎样待你们，你们也要怎样待人。',
    reference: '路加福音 6:31'
  },
  {
    kind: 'scripture',
    text: '你们要给人，就必有给你们的，并且用摇的、按的、积的、盈的，倒在你们怀里。',
    reference: '路加福音 6:38'
  },
  {
    kind: 'scripture',
    text: '我又告诉你们，你们祈求，就给你们；寻找，就寻见；叩门，就给你们开门。',
    reference: '路加福音 11:9'
  },
  {
    kind: 'scripture',
    text: '一个罪人悔改，与九十九个不用悔改的义人，在天上也要这样为他欢喜。',
    reference: '路加福音 15:7'
  },
  {
    kind: 'scripture',
    text: '在人所不能的事，在神却能。',
    reference: '路加福音 18:27'
  },
  {
    kind: 'scripture',
    text: '人子来，为要寻找拯救失丧的人。',
    reference: '路加福音 19:10'
  },
  {
    kind: 'scripture',
    text: '他们说：「我们不是心被火燃烧吗？他同我们说话，把圣经上的话给我们讲解的时候。」',
    reference: '路加福音 24:32'
  },
  {
    kind: 'scripture',
    text: '太初有道，道与神同在，道就是神。',
    reference: '约翰福音 1:1'
  },
  {
    kind: 'scripture',
    text: '凡接待他的，就是信他名的人，他就赐他们权柄，作神的儿女。',
    reference: '约翰福音 1:12'
  },
  {
    kind: 'scripture',
    text: '道成了肉身，住在我们中间，充充满满地有恩典有真理。',
    reference: '约翰福音 1:14'
  },
  {
    kind: 'scripture',
    text: '看哪，神的羔羊，除去（或译：背负）世人罪孽的！',
    reference: '约翰福音 1:29'
  },
  {
    kind: 'scripture',
    text: '神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不致灭亡，反得永生。',
    reference: '约翰福音 3:16'
  },
  {
    kind: 'scripture',
    text: '因为神差他的儿子降世，不是要定世人的罪，乃是要叫世人因他得救。',
    reference: '约翰福音 3:17'
  },
  {
    kind: 'scripture',
    text: '神是个灵，所以拜他的必须用心灵和诚实拜他。',
    reference: '约翰福音 4:24'
  },
  {
    kind: 'scripture',
    text: '耶稣说：我就是生命的粮。到我这里来的，必定不饿；信我的，永远不渴。',
    reference: '约翰福音 6:35'
  },
  {
    kind: 'scripture',
    text: '我是世界的光。跟从我的，就不在黑暗里走，必要得着生命的光。',
    reference: '约翰福音 8:12'
  },
  {
    kind: 'scripture',
    text: '你们必晓得真理，真理必叫你们得以自由。',
    reference: '约翰福音 8:32'
  },
  {
    kind: 'scripture',
    text: '所以天父的儿子若叫你们自由，你们就真自由了。',
    reference: '约翰福音 8:36'
  },
  {
    kind: 'scripture',
    text: '盗贼来，无非要偷窃、杀害、毁坏；我来了，是要叫羊得生命，并且得的更丰盛。',
    reference: '约翰福音 10:10'
  },
  {
    kind: 'scripture',
    text: '我是好牧人；好牧人为羊舍命。',
    reference: '约翰福音 10:11'
  },
  {
    kind: 'scripture',
    text: '耶稣对她说：复活在我，生命也在我。信我的人虽然死了，也必复活。',
    reference: '约翰福音 11:25'
  },
  {
    kind: 'scripture',
    text: '我怎样爱你们，你们也要怎样相爱。',
    reference: '约翰福音 13:34'
  },
  {
    kind: 'scripture',
    text: '你们心里不要忧愁；你们信神，也当信我。',
    reference: '约翰福音 14:1'
  },
  {
    kind: 'scripture',
    text: '耶稣说：我就是道路、真理、生命。若不借着我，没有人能到父那里去。',
    reference: '约翰福音 14:6'
  },
  {
    kind: 'scripture',
    text: '我留下平安给你们；我将我的平安赐给你们。',
    reference: '约翰福音 14:27'
  },
  {
    kind: 'scripture',
    text: '我是葡萄树，你们是枝子。常在我里面的，我也常在他里面，这人就多结果子。',
    reference: '约翰福音 15:5'
  },
  {
    kind: 'scripture',
    text: '你们要彼此相爱，像我爱你们一样；这就是我的命令。',
    reference: '约翰福音 15:12'
  },
  {
    kind: 'scripture',
    text: '在世上你们有苦难；但你们可以放心，我已经胜了世界。',
    reference: '约翰福音 16:33'
  },
  {
    kind: 'scripture',
    text: '认识你独一的真神，并且认识你所差来的耶稣基督，这就是永生。',
    reference: '约翰福音 17:3'
  },
  {
    kind: 'scripture',
    text: '但记这些事要叫你们信耶稣是基督，是神的儿子，并且叫你们信了他，就可以因他的名得生命。',
    reference: '约翰福音 20:31'
  },
  {
    kind: 'scripture',
    text: '但圣灵降临在你们身上，你们就必得着能力，并要在耶路撒冷、犹太、撒马利亚，直到地极，作我的见证。',
    reference: '使徒行传 1:8'
  },
  {
    kind: 'scripture',
    text: '你们各人要悔改，奉耶稣基督的名受洗，叫你们的罪得赦，就必领受所赐的圣灵。',
    reference: '使徒行传 2:38'
  },
  {
    kind: 'scripture',
    text: '除他以外，别无拯救；因为在天下人间，没有赐下别的名字，我们可以靠着得救。',
    reference: '使徒行传 4:12'
  },
  {
    kind: 'scripture',
    text: '当信主耶稣，你和你一家都必得救。',
    reference: '使徒行传 16:31'
  },
  {
    kind: 'scripture',
    text: '我们生活、动作、存留，都在乎他。',
    reference: '使徒行传 17:28'
  },
  {
    kind: 'scripture',
    text: '我不以福音为耻；这福音本是神的大能，要救一切相信的，先是犹太人，后是希腊人。',
    reference: '罗马书 1:16'
  },
  {
    kind: 'scripture',
    text: '因为世人都犯了罪，亏缺了神的荣耀。',
    reference: '罗马书 3:23'
  },
  {
    kind: 'scripture',
    text: '我们既因信称义，就借着我们的主耶稣基督得与神相和。',
    reference: '罗马书 5:1'
  },
  {
    kind: 'scripture',
    text: '惟有基督在我们还作罪人的时候为我们死，神的爱就在此向我们显明了。',
    reference: '罗马书 5:8'
  },
  {
    kind: 'scripture',
    text: '因为罪的工价乃是死；惟有神的恩赐，在我们的主基督耶稣里，乃是永生。',
    reference: '罗马书 6:23'
  },
  {
    kind: 'scripture',
    text: '如今，那些在基督耶稣里的就不定罪了。',
    reference: '罗马书 8:1'
  },
  {
    kind: 'scripture',
    text: '我们晓得万事都互相效力，叫爱神的人得益处，就是按他旨意被召的人。',
    reference: '罗马书 8:28'
  },
  {
    kind: 'scripture',
    text: '既是这样，还有什么说的呢？神若帮助我们，谁能敌挡我们呢？',
    reference: '罗马书 8:31'
  },
  {
    kind: 'scripture',
    text: '神既不爱惜自己的儿子，为我们众人舍了，岂不也把万物和他一同白白地赐给我们吗？',
    reference: '罗马书 8:32'
  },
  {
    kind: 'scripture',
    text: '因为我深信无论是死，是生……都不能叫我们与神的爱隔绝。',
    reference: '罗马书 8:38-39'
  },
  {
    kind: 'scripture',
    text: '你若口里认耶稣为主，心里信神叫他从死里复活，就必得救。',
    reference: '罗马书 10:9'
  },
  {
    kind: 'scripture',
    text: '可见信道是从听道来的，听道是从基督的话来的。',
    reference: '罗马书 10:17'
  },
  {
    kind: 'scripture',
    text: '所以弟兄们，我以神的慈悲劝你们，将身体献上，当作活祭，是圣洁的，是神所喜悦的。',
    reference: '罗马书 12:1'
  },
  {
    kind: 'scripture',
    text: '不要效法这个世界，只要心意更新而变化，察验何为神的善良、纯全、可喜悦的旨意。',
    reference: '罗马书 12:2'
  },
  {
    kind: 'scripture',
    text: '在指望中要喜乐，在患难中要忍耐，祷告要恒切。',
    reference: '罗马书 12:12'
  },
  {
    kind: 'scripture',
    text: '但愿使人有盼望的神，因信将诸般的喜乐、平安充满你们的心。',
    reference: '罗马书 15:13'
  },
  {
    kind: 'scripture',
    text: '神是信实的，你们原是被他所召，好与他儿子我们的主耶稣基督一同得分。',
    reference: '哥林多前书 1:9'
  },
  {
    kind: 'scripture',
    text: '因为十字架的道理，在那灭亡的人为愚拙；在我们得救的人却为神的大能。',
    reference: '哥林多前书 1:18'
  },
  {
    kind: 'scripture',
    text: '神为爱他的人所预备的，是眼睛未曾看见，耳朵未曾听见，人心也未曾想到的。',
    reference: '哥林多前书 2:9'
  },
  {
    kind: 'scripture',
    text: '你们所遇见的试探，无非是人所能受的。神是信实的，必不叫你们受试探过于所能受的。',
    reference: '哥林多前书 10:13'
  },
  {
    kind: 'scripture',
    text: '爱是恒久忍耐，又有恩慈；爱是不嫉妒；爱是不自夸，不张狂。',
    reference: '哥林多前书 13:4'
  },
  {
    kind: 'scripture',
    text: '如今常存的有信，有望，有爱这三样，其中最大的是爱。',
    reference: '哥林多前书 13:13'
  },
  {
    kind: 'scripture',
    text: '感谢神，使我们借着我们的主耶稣基督得胜。',
    reference: '哥林多前书 15:57'
  },
  {
    kind: 'scripture',
    text: '你们所作的一切事都要凭爱心而行。',
    reference: '哥林多前书 16:14'
  },
  {
    kind: 'scripture',
    text: '愿颂赞归于我们的主耶稣基督的父神，就是发慈悲的父，赐各样安慰的神。',
    reference: '哥林多后书 1:3-4'
  },
  {
    kind: 'scripture',
    text: '我们众人既然敞着脸好像从镜子里返照主的荣光，就变成主的形状。',
    reference: '哥林多后书 3:18'
  },
  {
    kind: 'scripture',
    text: '外体虽然毁坏，内心却一天新似一天。',
    reference: '哥林多后书 4:16'
  },
  {
    kind: 'scripture',
    text: '若有人在基督里，他就是新造的人，旧事已过，都变成新的了。',
    reference: '哥林多后书 5:17'
  },
  {
    kind: 'scripture',
    text: '神使那无罪的，替我们成为罪，好叫我们在他里面成为神的义。',
    reference: '哥林多后书 5:21'
  },
  {
    kind: 'scripture',
    text: '神能将各样的恩惠多多地加给你们，使你们凡事常常充足。',
    reference: '哥林多后书 9:8'
  },
  {
    kind: 'scripture',
    text: '他对我说：「我的恩典够你用的，因为我的能力是在人的软弱上显得完全。」',
    reference: '哥林多后书 12:9'
  },
  {
    kind: 'scripture',
    text: '我已经与基督同钉十字架，现在活着的不再是我，乃是基督在我里面活着。',
    reference: '加拉太书 2:20'
  },
  {
    kind: 'scripture',
    text: '圣灵所结的果子，就是仁爱、喜乐、和平、忍耐、恩慈、良善、信实、温柔、节制。',
    reference: '加拉太书 5:22-23'
  },
  {
    kind: 'scripture',
    text: '我们行善，不可丧志；若不灰心，到了时候就要收成。',
    reference: '加拉太书 6:9'
  },
  {
    kind: 'scripture',
    text: '我们借这爱子的血得蒙救赎，过犯得以赦免，乃是照他丰富的恩典。',
    reference: '以弗所书 1:7'
  },
  {
    kind: 'scripture',
    text: '你们得救是本乎恩，也因着信；这并不是出于自己，乃是神所赐的。',
    reference: '以弗所书 2:8-9'
  },
  {
    kind: 'scripture',
    text: '我们原是他的工作，在基督耶稣里造成的，要行善，就是神所预备叫我们行的。',
    reference: '以弗所书 2:10'
  },
  {
    kind: 'scripture',
    text: '神能照着运行在我们心里的大力，充充足足地成就一切，超过我们所求所想的。',
    reference: '以弗所书 3:20'
  },
  {
    kind: 'scripture',
    text: '并要以恩慈相待，存怜悯的心，彼此饶恕，正如神在基督里饶恕了你们一样。',
    reference: '以弗所书 4:32'
  },
  {
    kind: 'scripture',
    text: '我还有末了的话：你们要靠着主，倚赖他的大能大力作刚强的人。',
    reference: '以弗所书 6:10'
  },
  {
    kind: 'scripture',
    text: '我深信那在你们心里动了善工的，必成全这工，直到耶稣基督的日子。',
    reference: '腓立比书 1:6'
  },
  {
    kind: 'scripture',
    text: '因我活着就是基督，我死了就有益处。',
    reference: '腓立比书 1:21'
  },
  {
    kind: 'scripture',
    text: '凡事不可结党，不可贪图虚浮的荣耀，只要存心谦卑，各人看别人比自己强。',
    reference: '腓立比书 2:3-4'
  },
  {
    kind: 'scripture',
    text: '因为你们立志行事都是神在你们心里运行，为要成就他的美意。',
    reference: '腓立比书 2:13'
  },
  {
    kind: 'scripture',
    text: '忘记背后，努力面前的，向著标竿直跑，要得神在基督耶稣里从上面召我来得的奖赏。',
    reference: '腓立比书 3:13-14'
  },
  {
    kind: 'scripture',
    text: '你们要靠主常常喜乐。我再说，你们要喜乐。',
    reference: '腓立比书 4:4'
  },
  {
    kind: 'scripture',
    text: '应当一无挂虑，只要凡事借着祷告、祈求和感谢，将你们所要的告诉神。',
    reference: '腓立比书 4:6'
  },
  {
    kind: 'scripture',
    text: '神所赐出人意外的平安必在基督耶稣里保守你们的心怀意念。',
    reference: '腓立比书 4:7'
  },
  {
    kind: 'scripture',
    text: '我靠着那加给我力量的，凡事都能做。',
    reference: '腓立比书 4:13'
  },
  {
    kind: 'scripture',
    text: '我的神必照他荣耀的丰富，在基督耶稣里，使你们一切所需用的都充足。',
    reference: '腓立比书 4:19'
  },
  {
    kind: 'scripture',
    text: '万有也靠他而立。',
    reference: '歌罗西书 1:17'
  },
  {
    kind: 'scripture',
    text: '你们要思念上面的事，不要思念地上的事。',
    reference: '歌罗西书 3:2'
  },
  {
    kind: 'scripture',
    text: '又要叫基督的平安在你们心里作主。',
    reference: '歌罗西书 3:15'
  },
  {
    kind: 'scripture',
    text: '你们无论做什么，都要从心里做，像是给主做的，不是给人做的。',
    reference: '歌罗西书 3:23'
  },
  {
    kind: 'scripture',
    text: '要常常喜乐，不住地祷告，凡事谢恩；因为这是神在基督耶稣里向你们所定的旨意。',
    reference: '帖撒罗尼迦前书 5:16-18'
  },
  {
    kind: 'scripture',
    text: '但主是信实的，要坚固你们，保护你们脱离那恶者。',
    reference: '帖撒罗尼迦后书 3:3'
  },
  {
    kind: 'scripture',
    text: '基督耶稣降世，为要拯救罪人。这话是可信的，十分可佩服的。',
    reference: '提摩太前书 1:15'
  },
  {
    kind: 'scripture',
    text: '因为只有一位神，在神和人中间，只有一位中保，乃是降世为人的基督耶稣。',
    reference: '提摩太前书 2:5'
  },
  {
    kind: 'scripture',
    text: '总要在言语、行为、爱心、信心、清洁上，都作信徒的榜样。',
    reference: '提摩太前书 4:12'
  },
  {
    kind: 'scripture',
    text: '因为神赐给我们，不是胆怯的心，乃是刚强、仁爱、谨守的心。',
    reference: '提摩太后书 1:7'
  },
  {
    kind: 'scripture',
    text: '你要竭力向神呈明，作无愧的工人，按着正意分解真理的道。',
    reference: '提摩太后书 2:15'
  },
  {
    kind: 'scripture',
    text: '圣经都是神所默示的，于教训、督责、使人归正、教导人学义都是有益的。',
    reference: '提摩太后书 3:16-17'
  },
  {
    kind: 'scripture',
    text: '那美好的仗我已经打过了，当跑的路我已经跑尽了，所信的道我已经守住了。',
    reference: '提摩太后书 4:7'
  },
  {
    kind: 'scripture',
    text: '他便救了我们；并不是因我们自己所行的义，乃是照他的怜悯。',
    reference: '提多书 3:5'
  },
  {
    kind: 'scripture',
    text: '愿你与人心的信心一同显明出来，所知道的各种善行的果效。',
    reference: '腓利门书 1:6'
  },
  {
    kind: 'scripture',
    text: '神的道是活泼的，是有功效的，比一切两刃的剑更快，刺入剖开，连魂与灵，骨节与骨髓，都能刺入、剖开。',
    reference: '希伯来书 4:12'
  },
  {
    kind: 'scripture',
    text: '所以，我们只管坦然无惧地来到施恩的宝座前，为要得怜恤，蒙恩惠，作随时的帮助。',
    reference: '希伯来书 4:16'
  },
  {
    kind: 'scripture',
    text: '也要坚守我们所承认的指望，不致摇动，因为那应许我们的是信实的。',
    reference: '希伯来书 10:23'
  },
  {
    kind: 'scripture',
    text: '信就是所望之事的实底，是未见之事的确据。',
    reference: '希伯来书 11:1'
  },
  {
    kind: 'scripture',
    text: '人非有信，就不能得神的喜悦；因为到神面前来的人必须信有神，且信他赏赐那寻求他的人。',
    reference: '希伯来书 11:6'
  },
  {
    kind: 'scripture',
    text: '我们既然有这许多的见证人，如同云彩围着我们，就当放下各样的重担，脱去容易缠累我们的罪，存心忍耐，奔那摆在我们前头的路程，仰望为我们信心创始成终的耶稣。',
    reference: '希伯来书 12:1-2'
  },
  {
    kind: 'scripture',
    text: '主曾说：我总不撇下你，也不丢弃你。',
    reference: '希伯来书 13:5'
  },
  {
    kind: 'scripture',
    text: '耶稣基督昨日、今日、一直到永远、是一样的。',
    reference: '希伯来书 13:8'
  },
  {
    kind: 'scripture',
    text: '我的弟兄们，你们落在百般试炼中，都要以为大喜；因为知道你们的信心经过试验，就生忍耐。',
    reference: '雅各书 1:2-3'
  },
  {
    kind: 'scripture',
    text: '你们中间若有缺少智慧的，应当求那厚赐与众人、也不斥责人的神，主就必赐给他。',
    reference: '雅各书 1:5'
  },
  {
    kind: 'scripture',
    text: '各样美善的恩赐和各样全备的赏赐都是从上头来的，从众光之父那里降下来的。',
    reference: '雅各书 1:17'
  },
  {
    kind: 'scripture',
    text: '你们亲近神，神就必亲近你们。',
    reference: '雅各书 4:8'
  },
  {
    kind: 'scripture',
    text: '愿颂赞归于我们主耶稣基督的父神！他曾照自己的大怜悯，借耶稣基督从死里复活，重生了我们，叫我们有活泼的盼望。',
    reference: '彼得前书 1:3'
  },
  {
    kind: 'scripture',
    text: '你们是被拣选族类，是有君尊的祭司，是圣洁的国度，是属神的子民。',
    reference: '彼得前书 2:9'
  },
  {
    kind: 'scripture',
    text: '只要心里尊主基督为圣。有人询问你们心中盼望的缘由，就要常作准备，以温柔、敬畏的心分说各理。',
    reference: '彼得前书 3:15'
  },
  {
    kind: 'scripture',
    text: '你们要将一切的忧虑卸给神，因为他顾念你们。',
    reference: '彼得前书 5:7'
  },
  {
    kind: 'scripture',
    text: '神的神能已将一切关乎生命和虔敬的事赐给我们，皆因我们认识那用自己荣耀和美德召我们的主。',
    reference: '彼得后书 1:3'
  },
  {
    kind: 'scripture',
    text: '主所应许的尚未成就，有人以为他是耽延，其实不是耽延，乃是宽容你们，不愿有一人沉沦，乃愿人人都悔改。',
    reference: '彼得后书 3:9'
  },
  {
    kind: 'scripture',
    text: '我们若认自己的罪，神是信实的，是公义的，必要赦免我们的罪，洗净我们一切的不义。',
    reference: '约翰一书 1:9'
  },
  {
    kind: 'scripture',
    text: '你看父赐给我们是何等的慈爱，使我们得称为神的儿女！',
    reference: '约翰一书 3:1'
  },
  {
    kind: 'scripture',
    text: '没有爱心的，就不认识神，因为神就是爱。',
    reference: '约翰一书 4:8'
  },
  {
    kind: 'scripture',
    text: '我们爱，因为神先爱我们。',
    reference: '约翰一书 4:19'
  },
  {
    kind: 'scripture',
    text: '我们若照他的旨意求什么，他就听我们。',
    reference: '约翰一书 5:14'
  },
  {
    kind: 'scripture',
    text: '我们若照他的命令行，这就是爱。',
    reference: '约翰二书 1:6'
  },
  {
    kind: 'scripture',
    text: '我听见我的儿女们按真理而行，我的喜乐就没有比这个大的。',
    reference: '约翰三书 1:4'
  },
  {
    kind: 'scripture',
    text: '那能保守你们不失脚、叫你们无瑕无疵、欢欢喜喜站在他荣耀之前的我们的救主独一的神。',
    reference: '犹大书 1:24-25'
  },
  {
    kind: 'scripture',
    text: '主神说：我是阿拉法，我是俄梅戛，是昔在、今在、以后永在的全能者。',
    reference: '启示录 1:8'
  },
  {
    kind: 'scripture',
    text: '看哪，我站在门外叩门，若有听见我声音就开门的，我要进到他那里去，我与他、他与我，一同坐席。',
    reference: '启示录 3:20'
  },
  {
    kind: 'scripture',
    text: '神要擦去他们一切的眼泪；不再有死亡，也不再有悲哀、哭号、疼痛。',
    reference: '启示录 21:4'
  },
  {
    kind: 'scripture',
    text: '我是阿拉法，我是俄梅戛，我是初，我是终。',
    reference: '启示录 22:13'
  },
  {
    kind: 'scripture',
    text: '圣灵和新妇都说：来！听见的人也该说：来！口渴的人也当来；愿意的，都可以白白取生命的水喝。',
    reference: '启示录 22:17'
  },
  {
    kind: 'saying',
    text: '圣经是神写给人类的情书。',
    reference: '司布真'
  },
  {
    kind: 'saying',
    text: '读圣经不是为了知道更多，而是为了更爱基督。',
    reference: '马丁·路德'
  },
  {
    kind: 'saying',
    text: '神话语不仅是用来阅读的，更是用来生活的。',
    reference: '钟马田'
  },
  {
    kind: 'saying',
    text: '你若不读圣经，就无法认识那位在圣经中启示自己的神。',
    reference: '约翰·加尔文'
  },
  {
    kind: 'saying',
    text: '圣经是信仰的唯一准则，也是灵魂的食粮。',
    reference: '约翰·卫斯理'
  },
  {
    kind: 'saying',
    text: '我渴望认识基督，并被他认识——这只能从神话语开始。',
    reference: '奥古斯丁'
  },
  {
    kind: 'saying',
    text: '每天读一点圣经，就像每天从永恒之泉汲取活水。',
    reference: 'C.S. 路易斯'
  },
  {
    kind: 'saying',
    text: '神话语能照亮幽暗之处，也能坚固软弱之心。',
    reference: '宋尚节'
  },
  {
    kind: 'saying',
    text: '不是读了圣经就自然敬虔，但若不读圣经，敬虔无从建立。',
    reference: '巴刻'
  },
  {
    kind: 'saying',
    text: '神的话安定在天，也当安定在我们每日的默想里。',
    reference: '乔治·穆勒'
  },
  {
    kind: 'saying',
    text: '圣经不是让人成为专家，而是让人认识救主。',
    reference: '达秘'
  },
  {
    kind: 'saying',
    text: '在神话语面前，我们学习谦卑，也学习盼望。',
    reference: '侯活沙'
  },
  {
    kind: 'saying',
    text: '每一次打开圣经，都是一次与神相遇的机会。',
    reference: '倪柝声'
  },
  {
    kind: 'saying',
    text: '神的话比金银更宝贵，比蜜更甘甜。',
    reference: '司布真'
  },
  {
    kind: 'saying',
    text: '读经不是完成任务，而是与神同行。',
    reference: '芬尼'
  },
  {
    kind: 'saying',
    text: '圣经告诉我们神是谁，也告诉我们我们当如何回应他。',
    reference: '华理克'
  },
  {
    kind: 'saying',
    text: '在患难中，神话语是我们脚前的灯，也是心里的锚。',
    reference: '杨以德'
  },
  {
    kind: 'saying',
    text: '神的话永不改变；我们需要的，是日日亲近它。',
    reference: '慕安得烈'
  },
  {
    kind: 'saying',
    text: '读圣经最大的果效，是让我们的心更像基督。',
    reference: '宾路易'
  },
  {
    kind: 'saying',
    text: '圣经是神对人说的话；祷告是人对神说的话。',
    reference: '托马斯·肯培'
  },
  {
    kind: 'saying',
    text: '神话语是信仰生活的根基，不是装饰品。',
    reference: '金圣显'
  },
  {
    kind: 'saying',
    text: '读经要读进心里，不要只读过眼睛。',
    reference: '王明道'
  },
  {
    kind: 'saying',
    text: '圣经是圣灵默示的，也是圣灵解释的。',
    reference: '贾玉铭'
  },
  {
    kind: 'saying',
    text: '神的话能喂养灵魂，也能指引脚步。',
    reference: '张伯笠'
  },
  {
    kind: 'saying',
    text: '我们越认识神话语，就越认识神的心意。',
    reference: '陈终道'
  },
  {
    kind: 'saying',
    text: '圣经不是人的意见集合，而是神的自我启示。',
    reference: '唐崇荣'
  },
  {
    kind: 'saying',
    text: '读经与顺服必须相连，否则知识只会叫人骄傲。',
    reference: '斯托得'
  },
  {
    kind: 'saying',
    text: '在神话语中操练，就是学习在基督里生活。',
    reference: '尤金·毕德生'
  },
  {
    kind: 'saying',
    text: '圣经不仅解答我们的问题，更重塑我们的渴望。',
    reference: '提摩太·凯勒'
  },
  {
    kind: 'saying',
    text: '神话语是教会唯一的权威，也是信徒唯一的标准。',
    reference: '约翰·麦克阿瑟'
  },
  {
    kind: 'saying',
    text: '一粒圣经的真理，比全世界的黄金更有价值。',
    reference: '司布真'
  },
  {
    kind: 'saying',
    text: '圣经是铺向天堂的阶梯。',
    reference: '马丁·路德'
  },
  {
    kind: 'saying',
    text: '英文圣经使普通人也能听见神的声音。',
    reference: '威克里夫'
  },
  {
    kind: 'saying',
    text: '我愿使农夫在犁头旁也能读神话语。',
    reference: '威廉·丁道尔'
  },
  {
    kind: 'saying',
    text: '在神话语面前，君王与平民同样站立。',
    reference: '约翰·诺克斯'
  },
  {
    kind: 'saying',
    text: '神圣的喜悦始于对神话语的敬畏与喜爱。',
    reference: '爱德华兹'
  },
  {
    kind: 'saying',
    text: '复兴始于神话语被认真诵读并遵行。',
    reference: '芬尼'
  },
  {
    kind: 'saying',
    text: '在祷告中把忧虑告诉神，在圣经里听神回答。',
    reference: '慕勒'
  },
  {
    kind: 'saying',
    text: '神的工作必须用神的方法、用神的能力、按神的话语来做。',
    reference: '戴德生'
  },
  {
    kind: 'saying',
    text: '圣经是宣教士的路图，也是信徒的指南针。',
    reference: '章绍坤'
  },
  {
    kind: 'saying',
    text: '神话语能医治破碎的心，也能唤醒沉睡的灵。',
    reference: '赵世光'
  },
  {
    kind: 'saying',
    text: '每日读经，是向神敞开的一天之始。',
    reference: '林献光'
  },
  {
    kind: 'saying',
    text: '在话语中遇见神，是生命最大的福分。',
    reference: '李天恩'
  },
  {
    kind: 'saying',
    text: '圣经是人类自由与尊严的根基。',
    reference: '潘恩'
  },
  {
    kind: 'saying',
    text: '人心有一个空洞，只有神能填满；只有神话语能指明那条路。',
    reference: '帕斯卡'
  },
  {
    kind: 'saying',
    text: '读神话语，是学习用永恒的眼光看暂时的事。',
    reference: '鲁益师'
  },
  {
    kind: 'saying',
    text: '一切真理最终都指向那创造真理的主。',
    reference: '多马·阿奎那'
  },
  {
    kind: 'saying',
    text: '圣经是使徒所传信仰的活见证。',
    reference: '爱任纽'
  },
  {
    kind: 'saying',
    text: '灵魂的血是真理；圣经是真理的源泉。',
    reference: '特土良'
  },
  {
    kind: 'saying',
    text: '讲解神话语，是为叫听众遇见基督。',
    reference: '屈梭罗'
  },
  {
    kind: 'saying',
    text: '神的话是灯，也是光；没有它，我们就走在黑暗里。',
    reference: '金圣显'
  },
  {
    kind: 'saying',
    text: '读经不是积累知识，而是被神话语改变。',
    reference: '范信铭'
  },
  {
    kind: 'saying',
    text: '释经与敬拜不可分离，因为神话语指向神自己。',
    reference: '鲍维均'
  },
  {
    kind: 'saying',
    text: '若你只想读一本书，那就读圣经；若你只想读一章，就读约翰福音。',
    reference: '司布真'
  },
  {
    kind: 'saying',
    text: '世上最伟大的书是圣经，因为作者是最伟大的神。',
    reference: '钟马田'
  },
  {
    kind: 'saying',
    text: '圣经是神写给我们的信，每一页都充满爱。',
    reference: '巴克'
  },
  {
    kind: 'saying',
    text: '神话语塑造文化，也塑造每一个愿意被塑造的人。',
    reference: '莱肯'
  },
  {
    kind: 'saying',
    text: '神话语不是束缚，而是通向自由的路标。',
    reference: '华理克'
  },
  {
    kind: 'saying',
    text: '在焦虑的时代，神话语给我们稳固的盼望。',
    reference: '提摩太·凯勒'
  },
  {
    kind: 'saying',
    text: '我从不想改变世界，我只想读圣经，然后世界因我而改变。',
    reference: 'C.S. 路易斯'
  },
  {
    kind: 'saying',
    text: '要认识神，就必须殷勤查考他所赐的圣经。',
    reference: '约翰·欧文'
  },
  {
    kind: 'saying',
    text: '家庭祭坛从读神话语开始，这是信仰传承的纽带。',
    reference: '清教徒传统'
  },
  {
    kind: 'saying',
    text: '没有神话语，就没有真正的讲道。',
    reference: '宋尚节'
  },
  {
    kind: 'saying',
    text: '圣经是信仰的战斗武器，不可离身。',
    reference: '王明道'
  },
  {
    kind: 'saying',
    text: '神话语是属灵争战中最锋利的剑。',
    reference: '倪柝声'
  },
  {
    kind: 'saying',
    text: '神话语在软弱中赐力量，在迷茫中赐方向。',
    reference: '威尔斯'
  },
  {
    kind: 'saying',
    text: '神的话是每日的粮，不可一日不读。',
    reference: '慕安得烈'
  },
  {
    kind: 'saying',
    text: '神话语先光照我们，再使用我们。',
    reference: '宾路易'
  },
  {
    kind: 'saying',
    text: '在神话语上扎根，才能在风浪中站立。',
    reference: '达秘'
  },
  {
    kind: 'saying',
    text: '打开圣经，就是打开天堂的门。',
    reference: '乔治·怀特菲尔德'
  },
  {
    kind: 'saying',
    text: '我愿以圣经为唯一的信仰依据，以爱心为最高的实践准则。',
    reference: '约翰·卫斯理'
  },
  {
    kind: 'saying',
    text: '神话语点燃人心，也洁净教会。',
    reference: '芬尼'
  },
  {
    kind: 'saying',
    text: '神圣的喜悦来自看见神话语中的荣耀。',
    reference: '爱德华兹'
  },
  {
    kind: 'saying',
    text: '默想神话语，是让心灵与神同行的艺术。',
    reference: '巴刻'
  },
  {
    kind: 'saying',
    text: '在神话语中，我们学会在苦难里仍然信靠。',
    reference: '侯活沙'
  },
  {
    kind: 'saying',
    text: '读经如进食，要细嚼慢咽，方能消化。',
    reference: '杨以德'
  },
  {
    kind: 'saying',
    text: '神话语是我们信仰的根，也是生活的指南。',
    reference: '陈终道'
  },
  {
    kind: 'saying',
    text: '不读圣经的基督徒，就像没有地图的旅人。',
    reference: '唐崇荣'
  },
  {
    kind: 'saying',
    text: '圣经呼召我们不只是听众，更是遵行者。',
    reference: '斯托得'
  },
  {
    kind: 'saying',
    text: '神话语塑造我们，使我们成为祷告的人。',
    reference: '尤金·毕德生'
  },
  {
    kind: 'saying',
    text: '在神话语里，我们学会把盼望放在永恒之上。',
    reference: '提摩太·凯勒'
  },
  {
    kind: 'saying',
    text: '圣经是圣灵见证基督的清晰镜子。',
    reference: '约翰·加尔文'
  },
  {
    kind: 'saying',
    text: '圣经是铺开的翅膀，带我们飞向神。',
    reference: '马丁·路德'
  },
  {
    kind: 'saying',
    text: '我们的心不安，直到在神话语所启示的神里找到安息。',
    reference: '奥古斯丁'
  },
  {
    kind: 'saying',
    text: '静默与神话语同行，心灵便得安宁。',
    reference: '托马斯·肯培'
  },
  {
    kind: 'saying',
    text: '没有圣经的自由，不过是放纵的别名。',
    reference: '潘恩'
  },
  {
    kind: 'saying',
    text: '神话语向我们显明：神亲近破碎的人。',
    reference: '帕斯卡'
  },
  {
    kind: 'saying',
    text: '神话语教导我们：真正的伟大在于服事。',
    reference: '鲁益师'
  },
  {
    kind: 'saying',
    text: '每日神话语，是灵魂呼吸的空气。',
    reference: '金圣显'
  },
  {
    kind: 'saying',
    text: '神话语给我们身份：我们是神所爱的儿女。',
    reference: '范信铭'
  },
  {
    kind: 'saying',
    text: '在神话语中，我们学习敬畏与感恩。',
    reference: '鲍维均'
  },
  {
    kind: 'saying',
    text: '神话语是穷人的财富，也是智者的宝藏。',
    reference: '司布真'
  },
  {
    kind: 'saying',
    text: '离开神话语，就没有真正的敬拜。',
    reference: '钟马田'
  },
  {
    kind: 'saying',
    text: '神话语在黑夜中发光，指引归家的路。',
    reference: '巴克'
  },
  {
    kind: 'saying',
    text: '读圣经，是让神的声音盖过世界的喧嚣。',
    reference: '莱肯'
  },
  {
    kind: 'saying',
    text: '神话语呼召我们过分别为圣的生活。',
    reference: '华理克'
  },
  {
    kind: 'saying',
    text: '以神话语为早餐，一天便有属天的力量。',
    reference: '清教徒传统'
  },
  {
    kind: 'saying',
    text: '神话语是传道人的剑，也是信徒的盾。',
    reference: '宋尚节'
  },
  {
    kind: 'saying',
    text: '忠于神话语，即使代价是孤独。',
    reference: '王明道'
  },
  {
    kind: 'saying',
    text: '神话语拆毁我们里面的假神。',
    reference: '倪柝声'
  },
  {
    kind: 'saying',
    text: '在神话语中，我们学习把重担交给神。',
    reference: '慕勒'
  },
  {
    kind: 'saying',
    text: '神话语是我们与基督同行的地图。',
    reference: '达秘'
  },
  {
    kind: 'saying',
    text: '神话语点燃复兴，也保守真道。',
    reference: '乔治·怀特菲尔德'
  },
  {
    kind: 'saying',
    text: '我愿以神话语为每日的喜乐与力量。',
    reference: '约翰·卫斯理'
  },
  {
    kind: 'saying',
    text: '神话语向我们显明神的荣美，也唤醒我们的爱。',
    reference: '爱德华兹'
  },
  {
    kind: 'saying',
    text: '在神话语中遇见神，是一生最长的功课。',
    reference: '巴刻'
  },
  {
    kind: 'saying',
    text: '神话语安慰忧伤的人，也坚固软弱的人。',
    reference: '侯活沙'
  },
  {
    kind: 'saying',
    text: '神话语是信仰的地基，不可草率读过。',
    reference: '杨以德'
  },
  {
    kind: 'saying',
    text: '神话语使我们与永恒相连。',
    reference: '陈终道'
  },
  {
    kind: 'saying',
    text: '神话语是真理，真理必叫我们自由。',
    reference: '唐崇荣'
  },
  {
    kind: 'saying',
    text: '神话语呼召我们进入神的国度。',
    reference: '斯托得'
  },
  {
    kind: 'saying',
    text: '在神话语中操练，就是学习爱邻舍。',
    reference: '尤金·毕德生'
  },
  {
    kind: 'saying',
    text: '神话语给我们面对苦难的框架。',
    reference: '提摩太·凯勒'
  },
  {
    kind: 'saying',
    text: '神话语让我们看见：此世不是终点。',
    reference: 'C.S. 路易斯'
  },
  {
    kind: 'saying',
    text: '神话语是治灵魂的良药。',
    reference: '约翰·欧文'
  },
  {
    kind: 'saying',
    text: '神话语开启心眼，使我们看见神。',
    reference: '奥古斯丁'
  },
  {
    kind: 'saying',
    text: '神话语是教会站立的磐石。',
    reference: '马丁·路德'
  },
  {
    kind: 'saying',
    text: '愿神话语每日更新你，直到见你面对面。',
    reference: '司布真'
  }
];
