import { PrismaClient, QuestionType } from "@prisma/client";

const db = new PrismaClient();

type TopicRule = {
  test: RegExp;
  focus: string;
  correct: string;
  wrong: [string, string, string];
  significance: string;
  falseClaim: string;
  falseReason: string;
  tags: string[];
};

function doc(text: string) {
  return {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  };
}

function options(correct: string, wrong: [string, string, string]) {
  return [
    { label: "A", content: wrong[0] },
    { label: "B", content: correct },
    { label: "C", content: wrong[1] },
    { label: "D", content: wrong[2] },
  ];
}

const rules: TopicRule[] = [
  {
    test: /中华文明的起源|早期国家|文明产生|早期文明共性/,
    focus: "多元一体、满天星斗式起源和早期国家形成",
    correct: "中华文明起源呈现多元一体格局，早期国家形成与农业发展、阶层分化和礼制秩序密切相关",
    wrong: ["中华文明只起源于黄河流域一个中心", "早期国家已经形成成熟的中央集权官僚制度", "早期文明主要依靠海外贸易推动形成"],
    significance: "有助于理解中华文明连续性、多元性和早期国家形态。",
    falseClaim: "中华文明起源只有黄河流域一个中心，其他区域文明影响很小。",
    falseReason: "考古发现表明，黄河、长江、辽河等区域文明共同构成多元一体格局。",
    tags: ["文明起源", "早期国家"],
  },
  {
    test: /春秋战国|诸侯纷争|列国纷争/,
    focus: "周王室衰微、诸侯争霸和兼并战争推动统一趋势",
    correct: "春秋战国时期礼乐秩序瓦解，诸侯争霸和兼并战争推动政治格局由分裂走向统一",
    wrong: ["周天子重新强化了对各诸侯国的直接控制", "诸侯纷争阻断了社会经济和思想文化变化", "春秋战国政治格局长期保持西周分封秩序不变"],
    significance: "这是理解变法运动、百家争鸣和秦统一的重要背景。",
    falseClaim: "春秋战国时期诸侯争霸只造成破坏，没有推动统一趋势。",
    falseReason: "兼并战争客观上促进区域整合，为统一多民族国家的建立创造条件。",
    tags: ["春秋战国", "政治格局"],
  },
  {
    test: /丝绸之路|边疆治理/,
    focus: "汉代丝绸之路与统一多民族国家治理",
    correct: "张骞通西域后，丝绸之路促进中外经济文化交流，也加强了汉朝对西域的经营",
    wrong: ["丝绸之路只是一条军事征服路线", "汉代对边疆地区完全实行郡县同制", "丝绸之路使中国古代经济中心转移到西域"],
    significance: "体现汉代大一统国家的开放气象和边疆治理能力。",
    falseClaim: "丝绸之路主要功能是军事扩张，与经济文化交流关系不大。",
    falseReason: "丝绸之路的重要价值在于沟通东西方贸易、技术、宗教和文化。",
    tags: ["丝绸之路", "边疆治理"],
  },
  {
    test: /江南经济|经济重心南移/,
    focus: "魏晋南北朝以来江南开发的原因与影响",
    correct: "北方人口南迁带来劳动力和先进生产技术，促进江南经济开发",
    wrong: ["江南开发主要依靠海外殖民扩张", "江南地区在秦汉以前已长期超过北方", "江南开发使南北经济交流完全中断"],
    significance: "为后来经济重心南移奠定基础。",
    falseClaim: "江南经济开发与北方人口南迁没有直接关系。",
    falseReason: "人口南迁带来劳动力、技术和生产经验，是江南开发的重要条件。",
    tags: ["江南开发", "经济重心南移"],
  },
  {
    test: /隋唐盛世|唐朝三治世|盛世局面|从隋唐盛世/,
    focus: "隋唐统一、制度创新和开放气象",
    correct: "隋唐盛世建立在国家统一、制度完善、经济恢复发展和民族交融基础之上",
    wrong: ["唐朝盛世只依靠闭关自守实现", "五代十国结束了藩镇割据问题", "隋唐时期科举制削弱了中央集权"],
    significance: "体现中国古代统一多民族国家发展的重要高峰。",
    falseClaim: "隋唐盛世主要依靠对外封闭和限制交流形成。",
    falseReason: "隋唐时期交通发达、民族交往和中外交流活跃，开放包容是重要特征。",
    tags: ["隋唐", "盛世"],
  },
  {
    test: /租庸调|两税法/,
    focus: "赋税制度由人丁控制向资产和土地征税转变",
    correct: "两税法按资产和土地分夏秋两季征税，弱化了以人丁为核心的征税方式",
    wrong: ["两税法恢复了西周井田制", "租庸调制以商品货币经济为唯一基础", "两税法取消了国家财政收入"],
    significance: "反映唐中后期土地兼并和户籍控制削弱后的财政调整。",
    falseClaim: "两税法仍完全按照成年男丁数量征税。",
    falseReason: "两税法的重要变化是以资产、土地为主要征税依据。",
    tags: ["赋税制度", "两税法"],
  },
  {
    test: /思想领域的演变|程朱理学|理学/,
    focus: "儒学吸收佛道思想并发展为理学",
    correct: "程朱理学强调天理、格物致知和道德修养，适应宋代重建伦理秩序的需要",
    wrong: ["程朱理学彻底否定儒家纲常伦理", "理学只关注自然科学实验", "理学产生于春秋时期并由孔子完成"],
    significance: "对后世政治伦理、教育和社会生活产生深远影响。",
    falseClaim: "程朱理学与儒学传统没有关系，是完全外来的思想体系。",
    falseReason: "理学以儒学为主体，同时吸收佛道思想进行理论化重构。",
    tags: ["理学", "思想文化"],
  },
  {
    test: /文学艺术|唐诗|辽宋夏金元的文化/,
    focus: "文学艺术与社会变迁的关系",
    correct: "唐诗、宋词、元曲等文学成就与城市经济、士人群体和社会生活变化密切相关",
    wrong: ["唐诗宋词元曲都产生于同一朝代", "文学艺术发展完全脱离社会经济变化", "宋元文化的主要特点是没有市民文化因素"],
    significance: "帮助从社会史角度理解思想文化繁荣。",
    falseClaim: "宋词、元曲的发展与城市和市民文化没有关系。",
    falseReason: "城市经济和市民阶层发展，为词曲传播提供了社会土壤。",
    tags: ["文学艺术", "文化史"],
  },
  {
    test: /两宋的政治|北宋加强中央集权/,
    focus: "北宋加强中央集权与积贫积弱",
    correct: "北宋通过分化事权、重文轻武等措施加强中央集权，但也带来行政效率和军事问题",
    wrong: ["北宋完全恢复藩镇割据以巩固统治", "北宋重武轻文导致武将专权", "北宋中央集权措施消除了所有边患"],
    significance: "体现制度调整可能同时带来积极效果和新的问题。",
    falseClaim: "北宋加强中央集权后，军事力量因此长期保持强盛。",
    falseReason: "重文轻武和兵权分散有利于防范武将专权，但也造成军事效率下降。",
    tags: ["北宋", "中央集权"],
  },
  {
    test: /辽夏金元|少数民族政权|因俗而治/,
    focus: "民族政权治理与多民族交融",
    correct: "辽夏金元等政权常采用因俗而治方式，体现不同区域和族群治理的差异化",
    wrong: ["少数民族政权完全拒绝吸收中原制度", "因俗而治意味着没有任何中央管理", "辽夏金元时期民族交往完全停止"],
    significance: "有助于理解统一多民族国家发展的历史基础。",
    falseClaim: "辽夏金元政权只保留本民族制度，从未吸收中原制度。",
    falseReason: "这些政权普遍吸收中原制度，同时保留本族治理传统。",
    tags: ["民族政权", "因俗而治"],
  },
  {
    test: /明清思想|时代危机/,
    focus: "明清时期思想文化与社会危机",
    correct: "明清之际出现经世致用、工商皆本等思想，反映商品经济发展和专制强化下的社会思考",
    wrong: ["明清思想完全没有批判色彩", "明清时期中国已经完成近代民主革命", "明清思想主流是全面否定儒学传统"],
    significance: "反映传统社会内部的新变化和时代局限。",
    falseClaim: "明清之际思想没有任何现实关怀，只关注空疏义理。",
    falseReason: "黄宗羲、顾炎武等思想家强调经世致用，对君主专制和社会问题有所反思。",
    tags: ["明清", "思想文化"],
  },
  {
    test: /第二次鸦片战争/,
    focus: "第二次鸦片战争与半殖民地化加深",
    correct: "第二次鸦片战争使列强侵略权益扩大，中国半殖民地化程度进一步加深",
    wrong: ["第二次鸦片战争使中国完全赢得关税自主", "战争后清政府立即废除所有不平等条约", "第二次鸦片战争标志抗日战争开始"],
    significance: "推动清政府面临更深民族危机，也刺激洋务运动兴起。",
    falseClaim: "第二次鸦片战争后中国主权得到全面恢复。",
    falseReason: "列强取得更多通商、传教、赔款等权益，民族危机加深。",
    tags: ["第二次鸦片战争", "民族危机"],
  },
  {
    test: /太平天国/,
    focus: "太平天国运动的反封建反侵略性质与局限",
    correct: "太平天国运动沉重打击清王朝统治，但农民阶级局限使其难以建立稳定的新制度",
    wrong: ["太平天国运动由资产阶级政党领导", "《天朝田亩制度》已经在全国完全实现", "太平天国运动发生于抗日战争时期"],
    significance: "反映农民阶级探索国家出路的历史作用和局限。",
    falseClaim: "太平天国运动的失败说明农民阶级没有任何历史作用。",
    falseReason: "太平天国沉重打击清朝和外国侵略势力，但受阶级局限而失败。",
    tags: ["太平天国", "农民运动"],
  },
  {
    test: /戊戌|维新/,
    focus: "维新变法与制度改良",
    correct: "戊戌维新主张学习西方政治制度，试图通过变法救亡图存",
    wrong: ["戊戌维新主张恢复闭关锁国", "维新派以农民起义方式推翻清王朝", "戊戌维新最终建立了共和政体"],
    significance: "体现资产阶级维新派对国家出路的探索。",
    falseClaim: "戊戌维新完全不涉及政治制度改革。",
    falseReason: "维新派主张设议院、兴民权、改革官制等，具有制度改革诉求。",
    tags: ["戊戌变法", "救亡图存"],
  },
  {
    test: /义和团|八国联军/,
    focus: "义和团运动与八国联军侵华",
    correct: "义和团运动具有反帝爱国性质，但也存在盲目排外等局限",
    wrong: ["义和团运动是完全成熟的资产阶级革命", "八国联军侵华后中国摆脱列强控制", "义和团运动由中国共产党领导"],
    significance: "反映民族危机激化下民众反抗与近代中国困境。",
    falseClaim: "义和团运动没有反帝爱国性质。",
    falseReason: "义和团以反抗列强侵略为突出特点，但斗争方式存在局限。",
    tags: ["义和团", "八国联军"],
  },
  {
    test: /辛亥革命|中华民国|临时约法/,
    focus: "辛亥革命、中华民国和《临时约法》",
    correct: "辛亥革命推翻清王朝，建立中华民国，推动民主共和观念传播",
    wrong: ["辛亥革命彻底完成反帝反封建任务", "《临时约法》确立君主专制制度", "中华民国成立于五四运动之后"],
    significance: "是中国近代政治制度变革的重要里程碑。",
    falseClaim: "辛亥革命彻底改变了中国半殖民地半封建社会性质。",
    falseReason: "辛亥革命推翻帝制，但没有完成反帝反封建任务。",
    tags: ["辛亥革命", "中华民国"],
  },
  {
    test: /新文化运动/,
    focus: "民主与科学、思想解放和局限",
    correct: "新文化运动高举民主与科学旗帜，猛烈批判封建礼教，促进思想解放",
    wrong: ["新文化运动主张全面恢复尊孔复古", "新文化运动发生在鸦片战争以前", "新文化运动直接建立了新中国"],
    significance: "为马克思主义传播和五四运动准备了思想条件。",
    falseClaim: "新文化运动的核心口号是尊孔复古。",
    falseReason: "新文化运动倡导民主与科学，反对旧道德旧文化。",
    tags: ["新文化运动", "思想解放"],
  },
  {
    test: /国共合作|北伐|国民革命/,
    focus: "第一次国共合作与国民革命",
    correct: "第一次国共合作推动国民革命兴起，北伐战争基本推翻北洋军阀统治",
    wrong: ["第一次国共合作发生在新中国成立以后", "北伐战争的目标是推翻清王朝", "国民革命失败后国共合作立即长期稳定延续"],
    significance: "展示中国共产党探索民主革命道路的早期实践。",
    falseClaim: "北伐战争的主要对象是清朝皇帝。",
    falseReason: "北伐战争主要打击吴佩孚、孙传芳、张作霖等北洋军阀势力。",
    tags: ["国共合作", "北伐战争"],
  },
  {
    test: /南昌起义|井冈山|工农武装割据|红军长征/,
    focus: "农村包围城市、武装夺取政权道路",
    correct: "井冈山道路把土地革命、武装斗争和根据地建设结合起来",
    wrong: ["井冈山道路主张放弃农村根据地", "南昌起义发生在抗美援朝时期", "长征标志新民主主义革命完全胜利"],
    significance: "标志中国共产党独立领导武装斗争和探索革命新道路。",
    falseClaim: "工农武装割据道路照搬了俄国城市中心革命道路。",
    falseReason: "它从中国国情出发，探索农村包围城市、武装夺取政权道路。",
    tags: ["井冈山道路", "武装斗争"],
  },
  {
    test: /北洋军阀|民族工业短暂春天/,
    focus: "北洋时期政治乱象与社会经济文化变化",
    correct: "北洋军阀统治时期政治分裂，但民族工业和新思想文化仍有发展",
    wrong: ["北洋时期全国政治长期高度统一", "民族工业短暂春天主要发生在秦汉时期", "北洋时期没有任何思想文化变化"],
    significance: "体现近代中国社会转型的复杂性。",
    falseClaim: "北洋军阀统治时期民族工业完全停滞，没有发展机会。",
    falseReason: "一战期间列强暂时放松侵略，民族工业出现短暂春天。",
    tags: ["北洋军阀", "民族工业"],
  },
  {
    test: /抗战|正面战场|敌后战场|全民族抗战/,
    focus: "全民族抗战和两个战场相互配合",
    correct: "正面战场和敌后战场共同构成全民族抗战的重要组成部分",
    wrong: ["抗日战争只存在一个战场", "敌后战场完全脱离人民群众", "抗战胜利主要依靠清政府洋务运动"],
    significance: "体现中华民族团结抗战和中国共产党中流砥柱作用。",
    falseClaim: "敌后战场与抗战胜利没有重要关系。",
    falseReason: "敌后战场牵制和打击大量日军，是全民族抗战的重要支撑。",
    tags: ["抗日战争", "全民族抗战"],
  },
  {
    test: /重庆谈判|三大战役|人民解放战争|战略反攻/,
    focus: "解放战争由争取和平到战略决战",
    correct: "三大战役基本消灭国民党军队主力，加速人民解放战争胜利",
    wrong: ["重庆谈判发生在明清时期", "战略反攻始于辽沈战役之后", "三大战役直接结束了鸦片战争"],
    significance: "反映人民力量壮大和国民党统治走向崩溃。",
    falseClaim: "三大战役后国民党军队主力仍基本完整。",
    falseReason: "辽沈、淮海、平津三大战役基本消灭国民党军队主力。",
    tags: ["解放战争", "三大战役"],
  },
  {
    test: /新中国成立|政权巩固|社会主义制度确立/,
    focus: "新中国成立和社会主义制度确立",
    correct: "新中国成立实现民族独立和人民解放，三大改造基本完成标志社会主义制度建立",
    wrong: ["新中国成立标志中国进入封建社会", "三大改造发生在辛亥革命之前", "新中国成立后没有进行政权巩固工作"],
    significance: "开启中国历史新纪元。",
    falseClaim: "三大改造完成标志资本主义制度在中国确立。",
    falseReason: "三大改造基本完成标志社会主义基本制度在中国建立。",
    tags: ["新中国", "社会主义制度"],
  },
  {
    test: /中共八大|大跃进|文化大革命|社会主义建设/,
    focus: "社会主义建设探索的成就与曲折",
    correct: "中共八大正确分析国内主要矛盾，但后来探索中出现大跃进、人民公社化等严重失误",
    wrong: ["中共八大提出以阶级斗争为中心的长期方针", "大跃进完全符合经济发展规律", "文化大革命促进了民主法治建设"],
    significance: "说明社会主义建设需要立足国情、尊重经济规律。",
    falseClaim: "大跃进和人民公社化运动完全符合客观经济规律。",
    falseReason: "这些运动急于求成，违背经济规律，造成严重困难。",
    tags: ["社会主义建设", "曲折探索"],
  },
  {
    test: /南方谈话|社会主义市场经济|改革开放/,
    focus: "改革开放深化与社会主义市场经济体制目标",
    correct: "1992年南方谈话进一步解放思想，推动建立社会主义市场经济体制目标的提出",
    wrong: ["南方谈话否定改革开放方向", "社会主义市场经济等同于放弃社会主义制度", "南方谈话发生于洋务运动时期"],
    significance: "推动改革开放进入新阶段。",
    falseClaim: "社会主义市场经济体制目标意味着放弃社会主义基本制度。",
    falseReason: "社会主义市场经济是在社会主义制度下发挥市场配置资源作用。",
    tags: ["南方谈话", "社会主义市场经济"],
  },
  {
    test: /大河文明|五大早期大河/,
    focus: "大河流域农业文明的共同特征",
    correct: "早期大河文明通常依托农业灌溉、文字、城市和国家组织发展",
    wrong: ["大河文明都以机器工业为基础", "所有大河文明都位于欧洲西部", "大河文明完全没有阶级分化"],
    significance: "有助于比较不同早期文明的共性和差异。",
    falseClaim: "早期大河文明都没有文字和国家组织。",
    falseReason: "古埃及、两河流域、印度河流域、中国等文明都出现不同形式的文字、城市和国家组织。",
    tags: ["大河文明", "世界古代史"],
  },
  {
    test: /文明交流|跨洲帝国|罗马帝国/,
    focus: "古代帝国扩张与文明交流",
    correct: "古代帝国扩张和商贸往来促进区域文明交流，也伴随征服和冲突",
    wrong: ["古代帝国扩张完全阻断文明交流", "罗马帝国从未跨越地中海区域", "古代文明之间没有任何技术传播"],
    significance: "说明文明交流方式既包括和平交往，也包括战争和征服。",
    falseClaim: "古代文明交流只可能通过和平贸易实现。",
    falseReason: "战争、迁徙、帝国扩张和商贸往来都可能推动文明交流。",
    tags: ["文明交流", "古代帝国"],
  },
  {
    test: /中古时期的欧洲|拜占庭|俄罗斯/,
    focus: "封君封臣、庄园和中古欧洲多元格局",
    correct: "中古西欧以封君封臣制度和庄园经济为重要特征，拜占庭和俄罗斯也形成各自传统",
    wrong: ["中古欧洲完全实现民族国家统一", "庄园经济以现代工厂制度为核心", "拜占庭帝国与罗马传统毫无关系"],
    significance: "帮助理解近代西欧社会转型的历史背景。",
    falseClaim: "中古西欧已经普遍建立现代民族国家和资本主义工厂制度。",
    falseReason: "中古西欧的典型特征是封建等级关系和庄园经济。",
    tags: ["中古欧洲", "封建制度"],
  },
  {
    test: /中古时期的亚洲|大化改新|朝鲜|奥斯曼/,
    focus: "中古亚洲文明的多样发展",
    correct: "日本大化改新学习唐制，奥斯曼帝国兴起后控制亚欧交通要道",
    wrong: ["大化改新主要学习英国议会制度", "奥斯曼帝国位于美洲大陆", "中古亚洲各地区制度完全相同"],
    significance: "体现亚洲文明交流和区域国家发展的多样性。",
    falseClaim: "日本大化改新主要学习近代英国君主立宪制。",
    falseReason: "大化改新主要学习中国隋唐制度，推动日本中央集权化。",
    tags: ["中古亚洲", "大化改新"],
  },
  {
    test: /美洲三大文明/,
    focus: "玛雅、阿兹特克和印加文明",
    correct: "玛雅、阿兹特克和印加文明是欧洲到来前美洲重要文明代表",
    wrong: ["三大文明都起源于黄河流域", "印加文明以地中海城邦为中心", "美洲文明在欧洲到来前没有农业"],
    significance: "说明世界文明发展具有多中心和多样性。",
    falseClaim: "欧洲人到来前美洲不存在成熟文明。",
    falseReason: "玛雅、阿兹特克、印加文明在城市、农业、宗教和国家组织方面有重要成就。",
    tags: ["美洲文明", "世界文明"],
  },
  {
    test: /新航路|四大航海家|地理大发现/,
    focus: "新航路开辟的动因、路线和影响",
    correct: "新航路开辟受商品经济发展、寻金热、传播宗教和航海技术进步等因素推动",
    wrong: ["新航路开辟发生在第二次工业革命之后", "哥伦布船队首次完成环球航行", "新航路开辟使世界联系完全中断"],
    significance: "世界开始由相对分散走向整体联系。",
    falseClaim: "麦哲伦本人完整完成了环球航行并安全返回欧洲。",
    falseReason: "麦哲伦在途中遇难，完成环球航行的是其船队。",
    tags: ["新航路开辟", "世界市场"],
  },
  {
    test: /早期殖民|哥伦布大交换|商业革命|价格革命|全球联系/,
    focus: "全球联系初步建立的经济与社会影响",
    correct: "哥伦布大交换推动物种、人口和疾病跨洲传播，商业革命和价格革命改变欧洲经济结构",
    wrong: ["哥伦布大交换只发生在亚洲内部", "价格革命使欧洲商品经济完全消失", "早期殖民扩张没有造成殖民地灾难"],
    significance: "体现全球联系增强与殖民掠夺并存。",
    falseClaim: "早期殖民扩张只促进交流，没有任何暴力和掠夺。",
    falseReason: "殖民扩张伴随奴役、掠夺和人口灾难，也推动资本原始积累。",
    tags: ["哥伦布大交换", "早期殖民"],
  },
  {
    test: /文艺复兴|宗教改革|启蒙|思想解放/,
    focus: "近代欧洲思想解放运动",
    correct: "文艺复兴强调人文主义，宗教改革冲击天主教会权威，启蒙运动倡导理性和制度批判",
    wrong: ["文艺复兴主张完全消灭人的价值", "宗教改革强化了罗马教皇对欧洲所有国家的控制", "启蒙运动发生在古埃及早王朝时期"],
    significance: "为资产阶级革命和近代社会转型提供思想武器。",
    falseClaim: "启蒙运动的核心是维护君主专制和教会特权。",
    falseReason: "启蒙思想家强调理性、自由、平等、法治和权力制衡。",
    tags: ["思想解放", "启蒙运动"],
  },
  {
    test: /资产阶级革命|君主立宪|三权分立|法国共和|英法美/,
    focus: "英美法资产阶级革命和近代政治制度",
    correct: "英国形成君主立宪制，美国确立三权分立的共和制，法国共和道路更曲折",
    wrong: ["英国光荣革命后建立绝对君主专制", "美国1787年宪法废除联邦制", "法国大革命没有触动封建等级制度"],
    significance: "标志资本主义政治制度在不同国情下确立。",
    falseClaim: "美国1787年宪法没有体现分权制衡原则。",
    falseReason: "美国宪法把国家权力分为立法、行政、司法三部分并相互制衡。",
    tags: ["资产阶级革命", "政治制度"],
  },
  {
    test: /共产党宣言|马克思主义/,
    focus: "马克思主义诞生",
    correct: "1848年《共产党宣言》发表，标志马克思主义诞生",
    wrong: ["《共产党宣言》发表于秦朝", "马克思主义主张维护封建等级制度", "巴黎公社发生在《共产党宣言》发表之前几百年"],
    significance: "为国际工人运动提供科学理论指导。",
    falseClaim: "《共产党宣言》的发表标志启蒙运动开始。",
    falseReason: "它标志马克思主义诞生，与国际工人运动发展密切相关。",
    tags: ["马克思主义", "共产党宣言"],
  },
  {
    test: /工业革命|两次工业革命/,
    focus: "两次工业革命的技术特点和世界影响",
    correct: "第一次工业革命以蒸汽机和机器生产为代表，第二次工业革命以电力、内燃机和化学工业等为代表",
    wrong: ["两次工业革命都发生在古代希腊", "第二次工业革命完全没有科学理论支撑", "工业革命使世界市场彻底消失"],
    significance: "推动生产力飞跃和资本主义世界市场发展。",
    falseClaim: "第二次工业革命与科学技术结合不明显。",
    falseReason: "第二次工业革命的重要特点是科学研究与工业生产紧密结合。",
    tags: ["工业革命", "世界市场"],
  },
  {
    test: /殖民体系|民族独立|亚洲觉醒|拉丁美洲独立/,
    focus: "世界殖民体系形成与亚非拉民族独立运动",
    correct: "资本主义世界殖民体系形成加深亚非拉被压迫状况，也激发民族独立运动",
    wrong: ["殖民体系形成意味着殖民地获得完全平等地位", "亚洲觉醒发生在古代两河流域", "拉丁美洲独立运动与殖民统治没有关系"],
    significance: "体现殖民扩张和民族解放运动的历史互动。",
    falseClaim: "殖民主义只有进步作用，没有压迫和掠夺。",
    falseReason: "殖民主义客观上传播部分近代因素，但本质上伴随压迫、掠夺和不平等。",
    tags: ["殖民体系", "民族独立"],
  },
  {
    test: /第一次世界大战|凡尔赛|华盛顿体系|萨拉热窝/,
    focus: "一战爆发与战后国际秩序",
    correct: "萨拉热窝事件是一战导火索，战后形成凡尔赛-华盛顿体系",
    wrong: ["一战爆发根本原因是美苏冷战", "凡尔赛体系彻底消除了帝国主义矛盾", "萨拉热窝事件发生在二战结束后"],
    significance: "说明帝国主义矛盾和强权政治影响国际秩序。",
    falseClaim: "凡尔赛-华盛顿体系建立后，战胜国与战败国矛盾完全消失。",
    falseReason: "该体系具有强权政治色彩，隐藏着新的矛盾和战争因素。",
    tags: ["一战", "国际秩序"],
  },
  {
    test: /十月革命|二月革命|苏联经济政策/,
    focus: "俄国革命与苏联社会主义实践",
    correct: "十月革命建立了世界上第一个社会主义国家，苏联经济政策经历战时共产主义、新经济政策等调整",
    wrong: ["二月革命直接建立社会主义国家", "新经济政策完全取消国家调节", "十月革命发生在中国唐朝"],
    significance: "开辟人类探索社会主义道路的新纪元。",
    falseClaim: "二月革命和十月革命的结果完全相同。",
    falseReason: "二月革命推翻沙皇专制，十月革命建立社会主义政权。",
    tags: ["十月革命", "苏联"],
  },
  {
    test: /第二次世界大战|雅尔塔|联合国|战后国际秩序/,
    focus: "二战与雅尔塔体系、联合国",
    correct: "第二次世界大战后形成雅尔塔体系，联合国成为维护国际和平与安全的重要组织",
    wrong: ["联合国成立于秦朝", "雅尔塔体系完全体现殖民地国家平等参与", "二战后国际秩序与美苏力量对比无关"],
    significance: "奠定战后国际政治格局，并影响冷战形成。",
    falseClaim: "联合国的宗旨是发动世界战争。",
    falseReason: "联合国宗旨包括维护国际和平与安全、发展友好关系等。",
    tags: ["二战", "联合国"],
  },
  {
    test: /冷战|两极|多极化/,
    focus: "冷战、两极格局与多极化趋势",
    correct: "冷战是以美苏为首的两大阵营在政治、经济、军事和意识形态上的长期对峙",
    wrong: ["冷战意味着美苏从未进行任何间接冲突", "两极格局在一战后立即形成", "多极化趋势说明世界只剩一个力量中心"],
    significance: "帮助理解二战后国际格局演变。",
    falseClaim: "多极化趋势意味着世界力量中心越来越单一。",
    falseReason: "多极化强调多个力量中心发展，冲击单一霸权或两极格局。",
    tags: ["冷战", "多极化"],
  },
  {
    test: /和平与发展|当代世界/,
    focus: "当代世界新特点与时代主题",
    correct: "和平与发展是当今时代主题，但世界仍面临霸权主义、地区冲突和发展不平衡等问题",
    wrong: ["当代世界已经不存在任何安全问题", "经济全球化只给所有国家带来完全相同收益", "和平与发展主题意味着国际竞争消失"],
    significance: "有助于把握当代国际关系的基本趋势和复杂性。",
    falseClaim: "和平与发展成为时代主题，说明世界已经没有冲突和挑战。",
    falseReason: "时代主题不等于问题消失，地区冲突、贫富差距和全球治理难题仍然存在。",
    tags: ["当代世界", "和平发展"],
  },
  {
    test: /中国古代政治制度的演变|西方政治制度的演变|官员选拔|法律传统|西方法律体系/,
    focus: "选择性必修中的制度比较与治理传统",
    correct: "制度演变要结合历史条件分析，比较中外制度时应关注权力结构、选官方式、法律观念和社会基础",
    wrong: ["所有国家政治制度都在同一时期以同一路径形成", "中国古代官员选拔从未发生变化", "西方法律体系与罗马法传统没有关系"],
    significance: "适合训练制度史比较和历史解释能力。",
    falseClaim: "比较中外制度时只需要判断优劣，不需要分析历史条件。",
    falseReason: "历史比较应结合经济基础、社会结构、思想文化和时代背景。",
    tags: ["制度史", "选择性必修"],
  },
  {
    test: /中华文化与世界文化交流/,
    focus: "中华文化传播与中外文化交流",
    correct: "中华文化在吸收外来文化的同时也向外传播，体现开放包容和交流互鉴",
    wrong: ["中华文化从未吸收任何外来因素", "文化交流只发生在现代互联网时代", "中外文化交流必然导致本民族文化消失"],
    significance: "有助于理解中华文化连续性、包容性和世界影响。",
    falseClaim: "中华文化发展完全封闭，从不与外部文化交流。",
    falseReason: "丝绸之路、佛教传入、东亚文化圈等都体现中外文化交流。",
    tags: ["文化交流", "中华文化"],
  },
];

function pickRule(title: string, lessonTitle: string, tags: string[]): TopicRule {
  const haystack = `${title} ${lessonTitle} ${tags.join(" ")}`;
  return (
    rules.find((rule) => rule.test.test(haystack)) ?? {
      test: /.*/,
      focus: `${title}的背景、内容和影响`,
      correct: `${title}需要放在“${lessonTitle}”的时代背景中，从原因、过程和影响三个层次理解`,
      wrong: [
        `${title}只需要孤立背诵标题，不需要联系时代背景`,
        `${title}与本课其他知识点完全没有联系`,
        `${title}的历史影响可以脱离具体史实随意判断`,
      ],
      significance: `有助于形成对《${lessonTitle}》的整体理解。`,
      falseClaim: `${title}可以脱离时代背景和相关史实单独判断。`,
      falseReason: "历史解释必须结合时空背景、材料信息和前后联系。",
      tags: tags.length ? tags : ["历史解释"],
    }
  );
}

async function main() {
  const points = await db.knowledgePoint.findMany({
    where: { questionLinks: { none: {} } },
    orderBy: [{ lesson: { unit: { textbook: { sortOrder: "asc" } } } }, { lesson: { unit: { sortOrder: "asc" } } }, { lesson: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    select: {
      id: true,
      title: true,
      tags: true,
      difficulty: true,
      lesson: {
        select: {
          title: true,
          unit: { select: { textbook: { select: { title: true } } } },
        },
      },
    },
  });

  let createdQuestions = 0;
  let createdLinks = 0;

  for (const point of points) {
    const rule = pickRule(point.title, point.lesson.title, point.tags);
    const baseTags = [...new Set([...point.tags, ...rule.tags, point.lesson.unit.textbook.title])].slice(0, 8);
    const difficulty = Math.max(1, Math.min(3, point.difficulty || 1));

    const seeds = [
      {
        type: QuestionType.MC,
        stem: `关于“${point.title}”，下列理解最准确的是？`,
        options: options(rule.correct, rule.wrong),
        correctAnswer: "B",
        solution: `${rule.correct}。这一考点的核心是${rule.focus}。`,
        timeEstimate: 60,
      },
      {
        type: QuestionType.TRUE_FALSE,
        stem: `判断正误：${rule.falseClaim}`,
        options: [
          { label: "正", content: "" },
          { label: "错", content: "" },
        ],
        correctAnswer: "B",
        solution: rule.falseReason,
        timeEstimate: 45,
      },
      {
        type: QuestionType.MC,
        stem: `学习“${point.title}”时，最应该把握的历史意义是？`,
        options: options(rule.significance, [
          "只用于记忆一个孤立年代，不需要理解历史联系",
          "说明历史发展没有阶段差异，也不存在因果关系",
          "可以完全脱离教材主题和材料信息进行判断",
        ]),
        correctAnswer: "B",
        solution: `${rule.significance}答题时要把具体史实、时代背景和影响层次结合起来。`,
        timeEstimate: 60,
      },
    ];

    for (let index = 0; index < seeds.length; index += 1) {
      const seed = seeds[index];
      const source = `知识点补题:${point.id}:${index + 1}`;
      const existing = await db.question.findFirst({ where: { source }, select: { id: true } });
      const question =
        existing ??
        (await db.question.create({
          data: {
            type: seed.type,
            difficulty,
            stem: doc(seed.stem),
            options: seed.options,
            correctAnswer: seed.correctAnswer,
            solution: doc(seed.solution),
            source,
            tags: baseTags,
            timeEstimate: seed.timeEstimate,
            isPublished: true,
          },
          select: { id: true },
        }));

      if (!existing) createdQuestions += 1;

      await db.knowledgePointOnQuestion.createMany({
        data: [{ questionId: question.id, knowledgePointId: point.id }],
        skipDuplicates: true,
      });
      createdLinks += 1;
    }
  }

  console.log(`Missing knowledge points processed: ${points.length}`);
  console.log(`Questions created: ${createdQuestions}`);
  console.log(`Question links ensured: ${createdLinks}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
