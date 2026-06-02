import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("开始更新时空轴...");

  // 删除现有事件
  await db.timelineEvent.deleteMany();

  // 创建新的时空轴事件，按时间顺序排列
  const events = [
    // 古代史
    { title: "元谋人活动", startDate: "-1700000", category: "CHINA", importance: 5, description: "中国境内已知最早的人类活动" },
    { title: "北京人使用火", startDate: "-700000", category: "CHINA", importance: 4, description: "北京人学会使用天然火" },
    { title: "半坡遗址", startDate: "-5000", category: "CHINA", importance: 4, description: "黄河流域新石器时代聚落遗址" },
    { title: "河姆渡遗址", startDate: "-5000", category: "CHINA", importance: 4, description: "长江流域新石器时代聚落遗址" },
    { title: "良渚文化", startDate: "-3300", category: "CHINA", importance: 5, description: "实证中华五千年文明" },

    // 夏商周
    { title: "夏朝建立", startDate: "-2070", category: "CHINA", importance: 5, description: "中国历史上第一个奴隶制王朝" },
    { title: "商朝建立", startDate: "-1600", category: "CHINA", importance: 5, description: "甲骨文出现，青铜文明鼎盛" },
    { title: "西周建立", startDate: "-1046", category: "CHINA", importance: 5, description: "武王伐纣，分封制宗法制确立" },

    // 春秋战国
    { title: "春秋时期开始", startDate: "-770", category: "CHINA", importance: 4, description: "周平王东迁洛邑" },
    { title: "战国时期开始", startDate: "-475", category: "CHINA", importance: 4, description: "七雄并立，变法图强" },
    { title: "商鞅变法", startDate: "-356", category: "CHINA", importance: 5, description: "秦国变法图强，奠定统一基础" },

    // 秦汉
    { title: "秦统一六国", startDate: "-221", category: "CHINA", importance: 5, description: "建立中国历史上第一个统一的多民族封建国家" },
    { title: "陈胜吴广起义", startDate: "-209", category: "CHINA", importance: 4, description: "中国历史上第一次大规模农民起义" },
    { title: "西汉建立", startDate: "-202", category: "CHINA", importance: 5, description: "刘邦建立汉朝，定都长安" },
    { title: "张骞出使西域", startDate: "-138", category: "CHINA", importance: 5, description: "开辟丝绸之路" },
    { title: "西域都护府设立", startDate: "-60", category: "CHINA", importance: 5, description: "新疆正式纳入中国版图" },
    { title: "王莽篡汉", startDate: "9", category: "CHINA", importance: 3, description: "新朝建立" },
    { title: "东汉建立", startDate: "25", category: "CHINA", importance: 4, description: "刘秀建立东汉" },
    { title: "蔡伦改进造纸术", startDate: "105", category: "CHINA", importance: 5, description: "推动文化传播" },

    // 三国两晋南北朝
    { title: "三国时期开始", startDate: "220", category: "CHINA", importance: 4, description: "魏蜀吴三分天下" },
    { title: "西晋统一", startDate: "280", category: "CHINA", importance: 3, description: "结束三国分裂" },
    { title: "淝水之战", startDate: "383", category: "CHINA", importance: 4, description: "东晋以少胜多击败前秦" },
    { title: "北魏孝文帝改革", startDate: "494", category: "CHINA", importance: 5, description: "汉化改革，促进民族融合" },

    // 隋唐
    { title: "隋朝统一全国", startDate: "589", category: "CHINA", importance: 5, description: "结束南北朝分裂" },
    { title: "隋朝大运河开通", startDate: "605", category: "CHINA", importance: 5, description: "沟通南北经济文化" },
    { title: "唐朝建立", startDate: "618", category: "CHINA", importance: 5, description: "李渊建立唐朝" },
    { title: "贞观之治", startDate: "627", category: "CHINA", importance: 5, description: "唐太宗开创盛世" },
    { title: "玄奘西行", startDate: "629", category: "CHINA", importance: 4, description: "前往天竺取经" },
    { title: "安史之乱爆发", startDate: "755", category: "CHINA", importance: 5, description: "唐朝由盛转衰" },
    { title: "黄巢起义", startDate: "875", category: "CHINA", importance: 4, description: "沉重打击唐朝统治" },

    // 五代十国宋元
    { title: "五代十国开始", startDate: "907", category: "CHINA", importance: 3, description: "藩镇割据延续" },
    { title: "北宋建立", startDate: "960", category: "CHINA", importance: 5, description: "赵匡胤陈桥兵变" },
    { title: "澶渊之盟", startDate: "1005", category: "CHINA", importance: 4, description: "宋辽和议" },
    { title: "靖康之变", startDate: "1127", category: "CHINA", importance: 5, description: "北宋灭亡" },
    { title: "南宋建立", startDate: "1127", category: "CHINA", importance: 4, description: "赵构建立南宋" },
    { title: "蒙古崛起", startDate: "1206", category: "CHINA", importance: 5, description: "成吉思汗统一蒙古" },
    { title: "元朝建立", startDate: "1271", category: "CHINA", importance: 5, description: "忽必烈建立元朝" },
    { title: "元朝统一全国", startDate: "1279", category: "CHINA", importance: 5, description: "结束宋金西夏并立" },

    // 明朝
    { title: "明朝建立", startDate: "1368", category: "CHINA", importance: 5, description: "朱元璋建立明朝" },
    { title: "郑和下西洋", startDate: "1405", category: "CHINA", importance: 5, description: "七次下西洋，规模空前" },
    { title: "戚继光抗倭", startDate: "1560", category: "CHINA", importance: 4, description: "抗击日本倭寇" },

    // 清朝
    { title: "清朝建立", startDate: "1636", category: "CHINA", importance: 5, description: "皇太极改国号为清" },
    { title: "清朝统一全国", startDate: "1644", category: "CHINA", importance: 5, description: "清军入关" },
    { title: "郑成功收复台湾", startDate: "1662", category: "CHINA", importance: 5, description: "驱逐荷兰殖民者" },
    { title: "雅克萨之战", startDate: "1685", category: "CHINA", importance: 4, description: "抗击沙俄侵略" },
    { title: "清朝设台湾府", startDate: "1684", category: "CHINA", importance: 4, description: "台湾正式纳入清朝版图" },

    // 中国近代史
    { title: "鸦片战争爆发", startDate: "1840", category: "CHINA", importance: 5, description: "中国近代史开端" },
    { title: "《南京条约》签订", startDate: "1842", category: "CHINA", importance: 5, description: "中国近代第一个不平等条约" },
    { title: "第二次鸦片战争", startDate: "1856", category: "CHINA", importance: 5, description: "英法联军侵华" },
    { title: "太平天国运动", startDate: "1851", category: "CHINA", importance: 5, description: "中国历史上规模最大的农民起义" },
    { title: "洋务运动开始", startDate: "1861", category: "CHINA", importance: 5, description: "师夷长技以自强" },
    { title: "甲午中日战争", startDate: "1894", category: "CHINA", importance: 5, description: "中国战败，签订《马关条约》" },
    { title: "戊戌变法", startDate: "1898", category: "CHINA", importance: 5, description: "百日维新" },
    { title: "义和团运动", startDate: "1899", category: "CHINA", importance: 4, description: "反帝爱国运动" },
    { title: "八国联军侵华", startDate: "1900", category: "CHINA", importance: 5, description: "签订《辛丑条约》" },
    { title: "辛亥革命", startDate: "1911", category: "CHINA", importance: 5, description: "推翻清朝统治，结束帝制" },
    { title: "中华民国成立", startDate: "1912", category: "CHINA", importance: 5, description: "孙中山就任临时大总统" },
    { title: "新文化运动开始", startDate: "1915", category: "CHINA", importance: 5, description: "民主与科学" },
    { title: "五四运动", startDate: "1919", category: "CHINA", importance: 5, description: "新民主主义革命开端" },
    { title: "中国共产党成立", startDate: "1921", category: "CHINA", importance: 5, description: "开天辟地的大事变" },
    { title: "第一次国共合作", startDate: "1924", category: "CHINA", importance: 4, description: "国民革命运动" },
    { title: "北伐战争", startDate: "1926", category: "CHINA", importance: 5, description: "基本推翻北洋军阀统治" },
    { title: "南昌起义", startDate: "1927", category: "CHINA", importance: 5, description: "打响武装反抗国民党第一枪" },
    { title: "秋收起义", startDate: "1927", category: "CHINA", importance: 4, description: "创建井冈山革命根据地" },
    { title: "红军长征", startDate: "1934", category: "CHINA", importance: 5, description: "战略大转移" },
    { title: "遵义会议", startDate: "1935", category: "CHINA", importance: 5, description: "党的历史上生死攸关的转折点" },
    { title: "西安事变", startDate: "1936", category: "CHINA", importance: 5, description: "抗日民族统一战线初步形成" },
    { title: "七七事变", startDate: "1937", category: "CHINA", importance: 5, description: "全面抗战开始" },
    { title: "平型关大捷", startDate: "1937", category: "CHINA", importance: 4, description: "抗战以来首次大捷" },
    { title: "台儿庄战役", startDate: "1938", category: "CHINA", importance: 4, description: "抗战以来最大胜利" },
    { title: "百团大战", startDate: "1940", category: "CHINA", importance: 4, description: "敌后战场大规模战役" },
    { title: "皖南事变", startDate: "1941", category: "CHINA", importance: 3, description: "国民党反共事件" },
    { title: "中共七大召开", startDate: "1945", category: "CHINA", importance: 5, description: "确立毛泽东思想为指导思想" },
    { title: "抗日战争胜利", startDate: "1945", category: "CHINA", importance: 5, description: "日本无条件投降" },
    { title: "重庆谈判", startDate: "1945", category: "CHINA", importance: 4, description: "国共两党谈判" },
    { title: "解放战争开始", startDate: "1946", category: "CHINA", importance: 5, description: "全面内战爆发" },
    { title: "三大战役", startDate: "1948", category: "CHINA", importance: 5, description: "辽沈、淮海、平津战役" },
    { title: "渡江战役", startDate: "1949", category: "CHINA", importance: 5, description: "解放南京" },
    { title: "中华人民共和国成立", startDate: "1949", category: "CHINA", importance: 5, description: "中国人民站起来了" },

    // 中国现代史
    { title: "抗美援朝战争", startDate: "1950", category: "CHINA", importance: 5, description: "保家卫国" },
    { title: "土地改革完成", startDate: "1952", category: "CHINA", importance: 5, description: "废除封建土地制度" },
    { title: "一五计划完成", startDate: "1957", category: "CHINA", importance: 5, description: "开始改变工业落后面貌" },
    { title: "三大改造完成", startDate: "1956", category: "CHINA", importance: 5, description: "社会主义制度确立" },
    { title: "中共八大召开", startDate: "1956", category: "CHINA", importance: 4, description: "探索建设社会主义道路的良好开端" },
    { title: "大跃进运动", startDate: "1958", category: "CHINA", importance: 4, description: "左倾错误泛滥" },
    { title: "人民公社化运动", startDate: "1958", category: "CHINA", importance: 3, description: "生产关系超越生产力发展水平" },
    { title: "三年困难时期", startDate: "1959", category: "CHINA", importance: 4, description: "国民经济严重困难" },
    { title: "大庆油田建成", startDate: "1963", category: "CHINA", importance: 4, description: "结束中国靠洋油的时代" },
    { title: "第一颗原子弹爆炸成功", startDate: "1964", category: "CHINA", importance: 5, description: "打破核垄断" },
    { title: "文化大革命开始", startDate: "1966", category: "CHINA", importance: 5, description: "十年内乱" },
    { title: "恢复联合国合法席位", startDate: "1971", category: "CHINA", importance: 5, description: "中国外交重大胜利" },
    { title: "尼克松访华", startDate: "1972", category: "CHINA", importance: 5, description: "中美关系正常化" },
    { title: "中日建交", startDate: "1972", category: "CHINA", importance: 4, description: "中日邦交正常化" },
    { title: "第一颗人造卫星发射成功", startDate: "1970", category: "CHINA", importance: 5, description: "东方红一号" },
    { title: "唐山大地震", startDate: "1976", category: "CHINA", importance: 4, description: "造成重大人员伤亡" },
    { title: "文化大革命结束", startDate: "1976", category: "CHINA", importance: 5, description: "结束十年内乱" },
    { title: "十一届三中全会召开", startDate: "1978", category: "CHINA", importance: 5, description: "改革开放的伟大转折" },
    { title: "家庭联产承包责任制实行", startDate: "1978", category: "CHINA", importance: 5, description: "农村经济体制改革" },
    { title: "深圳等经济特区设立", startDate: "1980", category: "CHINA", importance: 5, description: "对外开放迈出重要步伐" },
    { title: "中共十二大召开", startDate: "1982", category: "CHINA", importance: 4, description: "建设有中国特色社会主义" },
    { title: "城市经济体制改革全面展开", startDate: "1984", category: "CHINA", importance: 5, description: "增强企业活力" },
    { title: "开放14个沿海港口城市", startDate: "1984", category: "CHINA", importance: 4, description: "对外开放扩大" },
    { title: "中共十三大召开", startDate: "1987", category: "CHINA", importance: 4, description: "社会主义初级阶段理论" },
    { title: "海峡两岸达成九二共识", startDate: "1992", category: "CHINA", importance: 5, description: "一个中国原则" },
    { title: "邓小平南方谈话", startDate: "1992", category: "CHINA", importance: 5, description: "改革开放进入新阶段" },
    { title: "中共十四大召开", startDate: "1992", category: "CHINA", importance: 5, description: "建立社会主义市场经济体制" },
    { title: "香港回归", startDate: "1997", category: "CHINA", importance: 5, description: "一国两制成功实践" },
    { title: "中共十五大召开", startDate: "1997", category: "CHINA", importance: 4, description: "邓小平理论确立为指导思想" },
    { title: "澳门回归", startDate: "1999", category: "CHINA", importance: 5, description: "一国两制成功实践" },
    { title: "中国加入WTO", startDate: "2001", category: "CHINA", importance: 5, description: "融入经济全球化" },
    { title: "北京奥运会举办", startDate: "2008", category: "CHINA", importance: 5, description: "向世界展示中国" },
    { title: "中共十八大召开", startDate: "2012", category: "CHINA", importance: 5, description: "全面建成小康社会" },
    { title: "一带一路倡议提出", startDate: "2013", category: "CHINA", importance: 5, description: "构建人类命运共同体" },
    { title: "中共十九大召开", startDate: "2017", category: "CHINA", importance: 5, description: "习近平新时代中国特色社会主义思想" },
    { title: "脱贫攻坚战取得全面胜利", startDate: "2021", category: "CHINA", importance: 5, description: "全面建成小康社会" },
    { title: "中共二十大召开", startDate: "2022", category: "CHINA", importance: 5, description: "全面建设社会主义现代化国家" },

    // 世界古代史
    { title: "古埃及文明兴起", startDate: "-3100", category: "WORLD", importance: 4, description: "尼罗河流域文明" },
    { title: "古巴比伦王国建立", startDate: "-1894", category: "WORLD", importance: 4, description: "两河流域文明" },
    { title: "《汉谟拉比法典》颁布", startDate: "-1776", category: "WORLD", importance: 5, description: "迄今已知世界上第一部较为完整的成文法典" },
    { title: "古希腊城邦形成", startDate: "-800", category: "WORLD", importance: 4, description: "雅典、斯巴达等城邦" },
    { title: "雅典民主政治确立", startDate: "-509", category: "WORLD", importance: 5, description: "克里斯提尼改革" },
    { title: "雅典民主政治鼎盛", startDate: "-443", category: "WORLD", importance: 5, description: "伯里克利时代" },
    { title: "亚历山大东征", startDate: "-334", category: "WORLD", importance: 5, description: "建立地跨欧亚非的帝国" },
    { title: "罗马共和国建立", startDate: "-509", category: "WORLD", importance: 4, description: "罗马城邦兴起" },
    { title: "罗马帝国建立", startDate: "-27", category: "WORLD", importance: 5, description: "屋大维建立元首制" },
    { title: "基督教诞生", startDate: "1", category: "WORLD", importance: 5, description: "耶稣诞生" },

    // 世界中古史
    { title: "西罗马帝国灭亡", startDate: "476", category: "WORLD", importance: 5, description: "西欧奴隶社会终结" },
    { title: "法兰克王国建立", startDate: "481", category: "WORLD", importance: 3, description: "西欧第一个日耳曼王国" },
    { title: "伊斯兰教诞生", startDate: "622", category: "WORLD", importance: 5, description: "穆罕默德创立伊斯兰教" },
    { title: "查理曼帝国鼎盛", startDate: "800", category: "WORLD", importance: 4, description: "查理曼加冕" },
    { title: "诺曼征服", startDate: "1066", category: "WORLD", importance: 4, description: "诺曼底公爵征服英国" },
    { title: "十字军东征开始", startDate: "1096", category: "WORLD", importance: 4, description: "宗教战争" },
    { title: "蒙古西征", startDate: "1219", category: "WORLD", importance: 5, description: "成吉思汗西征" },
    { title: "黑死病流行", startDate: "1347", category: "WORLD", importance: 5, description: "欧洲人口锐减" },
    { title: "英法百年战争", startDate: "1337", category: "WORLD", importance: 4, description: "英法两国长期战争" },

    // 世界近代史
    { title: "文艺复兴开始", startDate: "1400", category: "WORLD", importance: 5, description: "人文主义兴起" },
    { title: "君士坦丁堡陷落", startDate: "1453", category: "WORLD", importance: 5, description: "东罗马帝国灭亡" },
    { title: "迪亚士到达好望角", startDate: "1487", category: "WORLD", importance: 4, description: "新航路开辟" },
    { title: "哥伦布到达美洲", startDate: "1492", category: "WORLD", importance: 5, description: "发现新大陆" },
    { title: "达伽马到达印度", startDate: "1498", category: "WORLD", importance: 5, description: "开辟通往印度的新航路" },
    { title: "麦哲伦船队环球航行", startDate: "1519", category: "WORLD", importance: 5, description: "证实地圆说" },
    { title: "马丁路德宗教改革", startDate: "1517", category: "WORLD", importance: 5, description: "打破天主教会精神垄断" },
    { title: "英国资产阶级革命", startDate: "1640", category: "WORLD", importance: 5, description: "世界近代史开端" },
    { title: "光荣革命", startDate: "1688", category: "WORLD", importance: 5, description: "英国君主立宪制确立" },
    { title: "《权利法案》颁布", startDate: "1689", category: "WORLD", importance: 5, description: "限制王权，议会至上" },
    { title: "彼得一世改革", startDate: "1721", category: "WORLD", importance: 4, description: "俄国近代化开端" },
    { title: "第一次工业革命开始", startDate: "1765", category: "WORLD", importance: 5, description: "珍妮纺纱机发明" },
    { title: "美国独立战争", startDate: "1775", category: "WORLD", importance: 5, description: "北美殖民地独立" },
    { title: "《独立宣言》发表", startDate: "1776", category: "WORLD", importance: 5, description: "美国诞生" },
    { title: "法国大革命爆发", startDate: "1789", category: "WORLD", importance: 5, description: "攻占巴士底狱" },
    { title: "《人权宣言》发表", startDate: "1789", category: "WORLD", importance: 5, description: "自由平等博爱" },
    { title: "拿破仑帝国建立", startDate: "1804", category: "WORLD", importance: 4, description: "拿破仑称帝" },
    { title: "维也纳会议召开", startDate: "1815", category: "WORLD", importance: 4, description: "重建欧洲秩序" },
    { title: "拉丁美洲独立运动", startDate: "1810", category: "WORLD", importance: 4, description: "玻利瓦尔圣马丁领导" },
    { title: "1832年英国议会改革", startDate: "1832", category: "WORLD", importance: 4, description: "扩大选举权" },
    { title: "法国二月革命", startDate: "1848", category: "WORLD", importance: 4, description: "推翻七月王朝" },
    { title: "《共产党宣言》发表", startDate: "1848", category: "WORLD", importance: 5, description: "马克思主义诞生" },
    { title: "美国内战爆发", startDate: "1861", category: "WORLD", importance: 5, description: "南北战争" },
    { title: "俄国农奴制改革", startDate: "1861", category: "WORLD", importance: 5, description: "废除农奴制" },
    { title: "日本明治维新", startDate: "1868", category: "WORLD", importance: 5, description: "日本走上资本主义道路" },
    { title: "德国统一", startDate: "1871", category: "WORLD", importance: 5, description: "德意志帝国成立" },
    { title: "巴黎公社", startDate: "1871", category: "WORLD", importance: 5, description: "无产阶级政权第一次伟大尝试" },
    { title: "第二次工业革命开始", startDate: "1870", category: "WORLD", importance: 5, description: "电气时代来临" },
    { title: "三国同盟形成", startDate: "1882", category: "WORLD", importance: 4, description: "德奥意军事同盟" },
    { title: "三国协约形成", startDate: "1907", category: "WORLD", importance: 4, description: "英法俄军事同盟" },

    // 两次世界大战
    { title: "萨拉热窝事件", startDate: "1914", category: "WORLD", importance: 5, description: "一战导火索" },
    { title: "第一次世界大战爆发", startDate: "1914", category: "WORLD", importance: 5, description: "帝国主义战争" },
    { title: "俄国二月革命", startDate: "1917", category: "WORLD", importance: 4, description: "推翻沙皇专制" },
    { title: "俄国十月革命", startDate: "1917", category: "WORLD", importance: 5, description: "建立第一个社会主义国家" },
    { title: "第一次世界大战结束", startDate: "1918", category: "WORLD", importance: 5, description: "德国投降" },
    { title: "巴黎和会召开", startDate: "1919", category: "WORLD", importance: 5, description: "凡尔赛体系建立" },
    { title: "华盛顿会议召开", startDate: "1921", category: "WORLD", importance: 5, description: "华盛顿体系建立" },
    { title: "苏联成立", startDate: "1922", category: "WORLD", importance: 5, description: "苏维埃社会主义共和国联盟" },
    { title: "美国经济大危机", startDate: "1929", category: "WORLD", importance: 5, description: "全球经济大萧条" },
    { title: "罗斯福新政开始", startDate: "1933", category: "WORLD", importance: 5, description: "国家干预经济" },
    { title: "德日意法西斯专政建立", startDate: "1933", category: "WORLD", importance: 5, description: "法西斯势力崛起" },
    { title: "西班牙内战爆发", startDate: "1936", category: "WORLD", importance: 4, description: "法西斯与反法西斯较量" },
    { title: "德国吞并奥地利", startDate: "1938", category: "WORLD", importance: 4, description: "绥靖政策顶峰" },
    { title: "慕尼黑阴谋", startDate: "1938", category: "WORLD", importance: 5, description: "绥靖政策达到顶峰" },
    { title: "德国入侵波兰", startDate: "1939", category: "WORLD", importance: 5, description: "二战全面爆发" },
    { title: "法国投降", startDate: "1940", category: "WORLD", importance: 4, description: "德国占领法国" },
    { title: "德国入侵苏联", startDate: "1941", category: "WORLD", importance: 5, description: "苏德战争爆发" },
    { title: "珍珠港事件", startDate: "1941", category: "WORLD", importance: 5, description: "太平洋战争爆发" },
    { title: "《联合国家宣言》签署", startDate: "1942", category: "WORLD", importance: 5, description: "世界反法西斯同盟形成" },
    { title: "斯大林格勒战役", startDate: "1942", category: "WORLD", importance: 5, description: "二战转折点" },
    { title: "中途岛海战", startDate: "1942", category: "WORLD", importance: 4, description: "太平洋战场转折" },
    { title: "阿拉曼战役", startDate: "1942", category: "WORLD", importance: 4, description: "北非战场转折" },
    { title: "诺曼底登陆", startDate: "1944", category: "WORLD", importance: 5, description: "开辟欧洲第二战场" },
    { title: "雅尔塔会议召开", startDate: "1945", category: "WORLD", importance: 5, description: "确定战后格局" },
    { title: "德国投降", startDate: "1945", category: "WORLD", importance: 5, description: "欧洲战场结束" },
    { title: "日本投降", startDate: "1945", category: "WORLD", importance: 5, description: "二战结束" },
    { title: "联合国成立", startDate: "1945", category: "WORLD", importance: 5, description: "维护世界和平" },

    // 冷战时期
    { title: "杜鲁门主义出台", startDate: "1947", category: "WORLD", importance: 5, description: "冷战开始" },
    { title: "马歇尔计划实施", startDate: "1947", category: "WORLD", importance: 5, description: "欧洲复兴计划" },
    { title: "北约成立", startDate: "1949", category: "WORLD", importance: 5, description: "美国主导的军事同盟" },
    { title: "德国分裂", startDate: "1949", category: "WORLD", importance: 4, description: "联邦德国和民主德国" },
    { title: "朝鲜战争爆发", startDate: "1950", category: "WORLD", importance: 5, description: "冷战热战" },
    { title: "华约成立", startDate: "1955", category: "WORLD", importance: 5, description: "两极格局正式形成" },
    { title: "苏伊士运河危机", startDate: "1956", category: "WORLD", importance: 4, description: "第二次中东战争" },
    { title: "不结盟运动成立", startDate: "1961", category: "WORLD", importance: 5, description: "第三世界崛起" },
    { title: "古巴导弹危机", startDate: "1962", category: "WORLD", importance: 5, description: "人类最接近核战争" },
    { title: "美国陷入越南战争", startDate: "1964", category: "WORLD", importance: 4, description: "美国在东南亚的泥潭" },
    { title: "欧共体成立", startDate: "1967", category: "WORLD", importance: 5, description: "欧洲联合自强" },
    { title: "日本成为资本主义世界第二经济大国", startDate: "1968", category: "WORLD", importance: 4, description: "日本经济腾飞" },
    { title: "阿波罗11号登月", startDate: "1969", category: "WORLD", importance: 5, description: "人类首次登月" },
    { title: "石油危机爆发", startDate: "1973", category: "WORLD", importance: 4, description: "中东石油禁运" },
    { title: "美国从越南撤军", startDate: "1975", category: "WORLD", importance: 4, description: "越南战争结束" },
    { title: "中美建交", startDate: "1979", category: "WORLD", importance: 5, description: "中美关系正常化" },
    { title: "苏联入侵阿富汗", startDate: "1979", category: "WORLD", importance: 4, description: "苏联扩张" },
    { title: "戈尔巴乔夫改革", startDate: "1985", category: "WORLD", importance: 5, description: "苏联改革" },
    { title: "东欧剧变", startDate: "1989", category: "WORLD", importance: 5, description: "社会主义阵营瓦解" },
    { title: "柏林墙倒塌", startDate: "1989", category: "WORLD", importance: 5, description: "德国统一前奏" },
    { title: "德国统一", startDate: "1990", category: "WORLD", importance: 5, description: "两德统一" },
    { title: "苏联解体", startDate: "1991", category: "WORLD", importance: 5, description: "冷战结束，两极格局瓦解" },

    // 当代世界
    { title: "欧盟成立", startDate: "1993", category: "WORLD", importance: 5, description: "欧洲一体化深化" },
    { title: "北约轰炸南联盟", startDate: "1999", category: "WORLD", importance: 4, description: "科索沃战争" },
    { title: "911事件", startDate: "2001", category: "WORLD", importance: 5, description: "恐怖主义袭击" },
    { title: "阿富汗战争", startDate: "2001", category: "WORLD", importance: 4, description: "美国反恐战争" },
    { title: "伊拉克战争", startDate: "2003", category: "WORLD", importance: 4, description: "美国入侵伊拉克" },
    { title: "全球金融危机", startDate: "2008", category: "WORLD", importance: 5, description: "次贷危机引发" },
    { title: "阿拉伯之春", startDate: "2010", category: "WORLD", importance: 4, description: "中东政治动荡" },
    { title: "叙利亚内战", startDate: "2011", category: "WORLD", importance: 4, description: "人道主义危机" },
    { title: "乌克兰危机", startDate: "2014", category: "WORLD", importance: 4, description: "克里米亚事件" },
    { title: "英国脱欧", startDate: "2016", category: "WORLD", importance: 4, description: "欧洲一体化挫折" },
    { title: "朝鲜半岛无核化谈判", startDate: "2018", category: "WORLD", importance: 4, description: "朝美领导人会晤" },
    { title: "新冠疫情全球大流行", startDate: "2020", category: "WORLD", importance: 5, description: "全球公共卫生危机" },
    { title: "俄乌冲突爆发", startDate: "2022", category: "WORLD", importance: 5, description: "欧洲安全危机" },
    { title: "全球气候行动加强", startDate: "2023", category: "WORLD", importance: 4, description: "应对气候变化" },
  ];

  // 按时间排序
  events.sort((a, b) => {
    const aNum = parseInt(a.startDate);
    const bNum = parseInt(b.startDate);
    return aNum - bNum;
  });

  // 批量创建
  for (const event of events) {
    await db.timelineEvent.create({
      data: {
        title: event.title,
        startDate: event.startDate,
        category: event.category,
        importance: event.importance,
        description: event.description,
      },
    });
  }

  console.log(`\n完成！共添加 ${events.length} 个时空轴事件`);
  console.log(`其中中国事件: ${events.filter(e => e.category === "CHINA").length} 个`);
  console.log(`其中世界事件: ${events.filter(e => e.category === "WORLD").length} 个`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
