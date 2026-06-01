import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const events = [
  // ═══════════════════════════════════════════════
  // 中国古代史
  // ═══════════════════════════════════════════════

  // 远古时期
  { title: "元谋人活动", description: "中国境内已知最早的人类，距今约170万年", startDate: "-1700000", category: "CHINA", importance: 5, era: "远古时期", dynasty: null, tags: ["史前"], location: "云南元谋" },
  { title: "北京人活动", description: "距今约70万—20万年，使用打制石器，学会使用天然火", startDate: "-700000", category: "CHINA", importance: 4, era: "远古时期", dynasty: null, tags: ["史前"], location: "北京周口店" },
  { title: "半坡居民定居", description: "距今约6000年，黄河流域农耕文明代表，种植粟", startDate: "-4000", category: "CHINA", importance: 3, era: "远古时期", dynasty: null, tags: ["史前", "农耕"], location: "陕西西安" },
  { title: "河姆渡居民定居", description: "距今约7000年，长江流域农耕文明代表，种植水稻", startDate: "-5000", category: "CHINA", importance: 3, era: "远古时期", dynasty: null, tags: ["史前", "农耕"], location: "浙江余姚" },
  { title: "炎黄部落联盟", description: "炎帝、黄帝结成联盟，逐渐形成日后的华夏族", startDate: "-3000", category: "CHINA", importance: 4, era: "远古时期", dynasty: null, tags: ["传说"], location: "黄河流域" },

  // 夏商周
  { title: "夏朝建立", description: "约公元前2070年，禹建立夏朝，中国第一个王朝", startDate: "-2070", category: "CHINA", importance: 5, era: "夏商周", dynasty: "夏", tags: ["王朝建立"], location: "河南偃师" },
  { title: "商朝甲骨文", description: "商朝后期出现甲骨文，是中国最早的成熟文字", startDate: "-1200", category: "CHINA", importance: 4, era: "夏商周", dynasty: "商", tags: ["文化"], location: "河南安阳" },
  { title: "武王伐纣建西周", description: "公元前1046年，周武王灭商，建立西周，实行分封制", startDate: "-1046", category: "CHINA", importance: 5, era: "夏商周", dynasty: "周", tags: ["王朝建立", "分封制"], location: "镐京" },
  { title: "国人暴动", description: "公元前841年，西周国人暴动，是中国有确切纪年的开始", startDate: "-841", category: "CHINA", importance: 3, era: "夏商周", dynasty: "周", tags: ["政治事件"], location: "镐京" },
  { title: "平王东迁", description: "公元前770年，周平王迁都洛邑，东周开始", startDate: "-770", category: "CHINA", importance: 4, era: "夏商周", dynasty: "周", tags: ["都城迁移"], location: "洛邑" },

  // 春秋战国
  { title: "春秋五争霸", description: "春秋时期齐桓公、晋文公等五位霸主先后称霸", startDate: "-685", category: "CHINA", importance: 4, era: "春秋战国", dynasty: "周", tags: ["争霸"], location: "中原" },
  { title: "孔子创立儒学", description: "春秋晚期，孔子创立儒家学派，提出仁、礼思想", startDate: "-551", category: "CHINA", importance: 5, era: "春秋战国", dynasty: "周", tags: ["思想", "儒学"], location: "鲁国" },
  { title: "商鞅变法", description: "公元前356年，秦国商鞅变法，使秦国走上富强之路", startDate: "-356", category: "CHINA", importance: 5, era: "春秋战国", dynasty: "周", tags: ["变法", "改革"], location: "秦国" },
  { title: "百家争鸣", description: "战国时期思想文化繁荣，儒、道、墨、法等学派争鸣", startDate: "-475", category: "CHINA", importance: 5, era: "春秋战国", dynasty: "周", tags: ["思想", "文化"], location: "各国" },

  // 秦汉
  { title: "秦统一六国", description: "公元前221年，秦王嬴政统一六国，建立中国历史上第一个统一的中央集权国家", startDate: "-221", category: "CHINA", importance: 5, era: "秦汉", dynasty: "秦", tags: ["统一", "中央集权"], location: "咸阳" },
  { title: "秦始皇统一文字货币度量衡", description: "统一度量衡、货币和文字，促进经济文化交流", startDate: "-220", category: "CHINA", importance: 5, era: "秦汉", dynasty: "秦", tags: ["统一", "经济"], location: "全国" },
  { title: "焚书坑儒", description: "公元前213—前212年，秦始皇焚书坑儒，钳制思想", startDate: "-213", category: "CHINA", importance: 4, era: "秦汉", dynasty: "秦", tags: ["思想专制"], location: "咸阳" },
  { title: "陈胜吴广起义", description: "公元前209年，中国历史上第一次大规模农民起义", startDate: "-209", category: "CHINA", importance: 5, era: "秦汉", dynasty: "秦", tags: ["农民起义"], location: "大泽乡" },
  { title: "西汉建立", description: "公元前202年，刘邦建立西汉，定都长安", startDate: "-202", category: "CHINA", importance: 5, era: "秦汉", dynasty: "汉", tags: ["王朝建立"], location: "长安" },
  { title: "罢黜百家独尊儒术", description: "公元前134年，汉武帝采纳董仲舒建议，儒学成为正统思想", startDate: "-134", category: "CHINA", importance: 5, era: "秦汉", dynasty: "汉", tags: ["思想", "儒学"], location: "长安" },
  { title: "张骞出使西域", description: "公元前138年、前119年，张骞两次出使西域，开辟丝绸之路", startDate: "-138", category: "CHINA", importance: 5, era: "秦汉", dynasty: "汉", tags: ["外交", "丝绸之路"], location: "西域" },
  { title: "西域都护府设立", description: "公元前60年，西汉设立西域都护府，新疆正式纳入中国版图", startDate: "-60", category: "CHINA", importance: 5, era: "秦汉", dynasty: "汉", tags: ["边疆治理"], location: "西域" },
  { title: "王莽篡汉", description: "公元8年，王莽建立新朝，西汉灭亡", startDate: "8", category: "CHINA", importance: 3, era: "秦汉", dynasty: "新", tags: ["政权更替"], location: "长安" },
  { title: "东汉建立", description: "公元25年，刘秀建立东汉，定都洛阳", startDate: "25", category: "CHINA", importance: 4, era: "秦汉", dynasty: "汉", tags: ["王朝建立"], location: "洛阳" },
  { title: "蔡伦改进造纸术", description: "公元105年，蔡伦改进造纸术，推动文化传播", startDate: "105", category: "CHINA", importance: 5, era: "秦汉", dynasty: "汉", tags: ["科技", "文化"], location: "洛阳" },
  { title: "黄巾起义", description: "公元184年，张角领导黄巾起义，东汉名存实亡", startDate: "184", category: "CHINA", importance: 4, era: "秦汉", dynasty: "汉", tags: ["农民起义"], location: "各地" },

  // 三国两晋南北朝
  { title: "官渡之战", description: "公元200年，曹操以少胜多击败袁绍，奠定统一北方基础", startDate: "200", category: "CHINA", importance: 4, era: "三国两晋南北朝", dynasty: "汉", tags: ["战争"], location: "官渡" },
  { title: "赤壁之战", description: "公元208年，孙刘联军以少胜多击败曹操，奠定三国鼎立基础", startDate: "208", category: "CHINA", importance: 5, era: "三国两晋南北朝", dynasty: "三国", tags: ["战争"], location: "赤壁" },
  { title: "三国鼎立形成", description: "公元220—229年，魏蜀吴三国先后建立，三国鼎立局面形成", startDate: "220", category: "CHINA", importance: 5, era: "三国两晋南北朝", dynasty: "三国", tags: ["政权并立"], location: "全国" },
  { title: "西晋统一", description: "公元280年，西晋灭吴，短暂统一全国", startDate: "280", category: "CHINA", importance: 3, era: "三国两晋南北朝", dynasty: "晋", tags: ["统一"], location: "洛阳" },
  { title: "淝水之战", description: "公元383年，东晋以少胜多击败前秦，南北对峙局面延续", startDate: "383", category: "CHINA", importance: 4, era: "三国两晋南北朝", dynasty: "晋", tags: ["战争"], location: "淝水" },
  { title: "北魏孝文帝改革", description: "公元494年起，北魏孝文帝推行汉化改革，促进民族融合", startDate: "494", category: "CHINA", importance: 5, era: "三国两晋南北朝", dynasty: "北魏", tags: ["改革", "民族融合"], location: "洛阳" },

  // 隋唐
  { title: "隋朝统一全国", description: "公元589年，隋灭陈，结束南北分裂局面", startDate: "589", category: "CHINA", importance: 5, era: "隋唐", dynasty: "隋", tags: ["统一"], location: "大兴城" },
  { title: "大运河开通", description: "公元605年起，隋炀帝开凿大运河，贯通南北交通", startDate: "605", category: "CHINA", importance: 5, era: "隋唐", dynasty: "隋", tags: ["工程", "经济"], location: "全国" },
  { title: "科举制创立", description: "隋朝创立科举制，打破门阀世族垄断仕途的局面", startDate: "605", category: "CHINA", importance: 5, era: "隋唐", dynasty: "隋", tags: ["制度", "选官"], location: "全国" },
  { title: "贞观之治", description: "唐太宗贞观年间（627—649），政治清明，经济繁荣", startDate: "627", category: "CHINA", importance: 5, era: "隋唐", dynasty: "唐", tags: ["盛世"], location: "长安" },
  { title: "玄奘西行", description: "公元629年，玄奘西行天竺取经，促进中印文化交流", startDate: "629", category: "CHINA", importance: 4, era: "隋唐", dynasty: "唐", tags: ["文化交流"], location: "天竺" },
  { title: "武则天称帝", description: "公元690年，武则天称帝，改国号周，中国唯一女皇帝", startDate: "690", category: "CHINA", importance: 4, era: "隋唐", dynasty: "唐", tags: ["政治"], location: "洛阳" },
  { title: "开元盛世", description: "唐玄宗开元年间（713—741），唐朝达到鼎盛", startDate: "713", category: "CHINA", importance: 5, era: "隋唐", dynasty: "唐", tags: ["盛世"], location: "长安" },
  { title: "安史之乱爆发", description: "公元755年，安禄山、史思明叛乱，唐朝由盛转衰", startDate: "755", category: "CHINA", importance: 5, era: "隋唐", dynasty: "唐", tags: ["战乱"], location: "中原" },
  { title: "黄巢起义", description: "公元875年，黄巢起义，沉重打击唐朝统治", startDate: "875", category: "CHINA", importance: 4, era: "隋唐", dynasty: "唐", tags: ["农民起义"], location: "各地" },
  { title: "唐朝灭亡", description: "公元907年，朱温灭唐，五代十国开始", startDate: "907", category: "CHINA", importance: 4, era: "隋唐", dynasty: "唐", tags: ["王朝灭亡"], location: "开封" },

  // 五代十国宋元
  { title: "北宋建立", description: "公元960年，赵匡胤陈桥兵变，建立北宋", startDate: "960", category: "CHINA", importance: 5, era: "宋元", dynasty: "宋", tags: ["王朝建立"], location: "开封" },
  { title: "王安石变法", description: "公元1069年，王安石推行变法，试图富国强兵", startDate: "1069", category: "CHINA", importance: 5, era: "宋元", dynasty: "宋", tags: ["变法", "改革"], location: "开封" },
  { title: "靖康之变", description: "公元1127年，金军攻破开封，北宋灭亡", startDate: "1127", category: "CHINA", importance: 5, era: "宋元", dynasty: "宋", tags: ["战乱"], location: "开封" },
  { title: "南宋建立", description: "公元1127年，赵构建立南宋，定都临安", startDate: "1127", category: "CHINA", importance: 4, era: "宋元", dynasty: "宋", tags: ["王朝建立"], location: "临安" },
  { title: "岳飞抗金", description: "南宋初年，岳飞率领岳家军抗击金军，收复失地", startDate: "1130", category: "CHINA", importance: 4, era: "宋元", dynasty: "宋", tags: ["战争", "抗金"], location: "中原" },
  { title: "蒙古崛起", description: "1206年，铁木真统一蒙古，建立蒙古汗国", startDate: "1206", category: "CHINA", importance: 4, era: "宋元", dynasty: null, tags: ["民族", "统一"], location: "蒙古" },
  { title: "元朝建立", description: "1271年，忽必烈改国号为元，1279年灭南宋统一全国", startDate: "1271", category: "CHINA", importance: 5, era: "宋元", dynasty: "元", tags: ["王朝建立", "统一"], location: "大都" },
  { title: "活字印刷术发明", description: "北宋毕昇发明活字印刷术，推动文化传播", startDate: "1040", category: "CHINA", importance: 5, era: "宋元", dynasty: "宋", tags: ["科技", "文化"], location: "毕昇" },
  { title: "指南针应用于航海", description: "北宋时期指南针开始应用于航海，推动海上贸易", startDate: "1100", category: "CHINA", importance: 4, era: "宋元", dynasty: "宋", tags: ["科技", "航海"], location: "沿海" },
  { title: "火药武器广泛使用", description: "宋元时期火药武器广泛用于军事", startDate: "1100", category: "CHINA", importance: 4, era: "宋元", dynasty: "宋", tags: ["科技", "军事"], location: "各地" },

  // 明清
  { title: "明朝建立", description: "1368年，朱元璋建立明朝，定都南京", startDate: "1368", category: "CHINA", importance: 5, era: "明清", dynasty: "明", tags: ["王朝建立"], location: "南京" },
  { title: "郑和下西洋", description: "1405—1433年，郑和七次下西洋，加强中外交流", startDate: "1405", category: "CHINA", importance: 5, era: "明清", dynasty: "明", tags: ["航海", "外交"], location: "西洋" },
  { title: "内阁制度形成", description: "明成祖时期内阁制度正式形成，成为皇帝顾问机构", startDate: "1402", category: "CHINA", importance: 3, era: "明清", dynasty: "明", tags: ["政治制度"], location: "北京" },
  { title: "戚继光抗倭", description: "明朝中期，戚继光率军抗击倭寇，保卫东南沿海", startDate: "1560", category: "CHINA", importance: 4, era: "明清", dynasty: "明", tags: ["抗倭", "军事"], location: "东南沿海" },
  { title: "李自成起义", description: "1644年，李自成攻入北京，崇祯帝自缢，明朝灭亡", startDate: "1644", category: "CHINA", importance: 5, era: "明清", dynasty: "明", tags: ["农民起义", "王朝灭亡"], location: "北京" },
  { title: "清朝建立", description: "1636年皇太极改国号为清，1644年入关定都北京", startDate: "1644", category: "CHINA", importance: 5, era: "明清", dynasty: "清", tags: ["王朝建立"], location: "北京" },
  { title: "军机处设立", description: "1729年，雍正帝设立军机处，君主专制达到顶峰", startDate: "1729", category: "CHINA", importance: 5, era: "明清", dynasty: "清", tags: ["政治制度", "专制"], location: "北京" },
  { title: "闭关锁国政策", description: "清朝实行闭关锁国政策，限制对外贸易", startDate: "1757", category: "CHINA", importance: 4, era: "明清", dynasty: "清", tags: ["政策", "对外关系"], location: "广州" },
  { title: "鸦片战争爆发", description: "1840年，英国发动鸦片战争，中国开始沦为半殖民地半封建社会", startDate: "1840", category: "CHINA", importance: 5, era: "明清", dynasty: "清", tags: ["战争", "近代史开端"], location: "东南沿海" },

  // 中国近代史
  { title: "《南京条约》签订", description: "1842年，中国近代第一个不平等条约", startDate: "1842", category: "CHINA", importance: 5, era: "近代史", dynasty: "清", tags: ["不平等条约"], location: "南京" },
  { title: "太平天国运动", description: "1851—1864年，洪秀全领导太平天国运动", startDate: "1851", category: "CHINA", importance: 5, era: "近代史", dynasty: "清", tags: ["农民起义"], location: "金田" },
  { title: "第二次鸦片战争", description: "1856—1860年，英法联军发动第二次鸦片战争", startDate: "1856", category: "CHINA", importance: 4, era: "近代史", dynasty: "清", tags: ["战争"], location: "北京" },
  { title: "洋务运动", description: "19世纪60—90年代，洋务派学习西方技术，自强、求富", startDate: "1861", category: "CHINA", importance: 5, era: "近代史", dynasty: "清", tags: ["改革", "近代化"], location: "全国" },
  { title: "甲午中日战争", description: "1894—1895年，甲午战争中国战败，签订《马关条约》", startDate: "1894", category: "CHINA", importance: 5, era: "近代史", dynasty: "清", tags: ["战争", "不平等条约"], location: "黄海" },
  { title: "戊戌变法", description: "1898年，康有为、梁启超等推动维新变法，历时103天", startDate: "1898", category: "CHINA", importance: 5, era: "近代史", dynasty: "清", tags: ["变法", "维新"], location: "北京" },
  { title: "八国联军侵华", description: "1900年，八国联军侵华，次年签订《辛丑条约》", startDate: "1900", category: "CHINA", importance: 5, era: "近代史", dynasty: "清", tags: ["战争", "不平等条约"], location: "北京" },
  { title: "清帝退位", description: "1912年2月12日，宣统帝溥仪退位，清朝灭亡", startDate: "1912", category: "CHINA", importance: 5, era: "近代史", dynasty: "清", tags: ["王朝灭亡"], location: "北京" },
  { title: "辛亥革命（武昌起义）", description: "1911年10月10日，武昌起义爆发，推翻清朝统治", startDate: "1911", category: "CHINA", importance: 5, era: "近代史", dynasty: "清", tags: ["革命"], location: "武昌" },
  { title: "中华民国成立", description: "1912年1月1日，孙中山在南京就任临时大总统", startDate: "1912", category: "CHINA", importance: 5, era: "近代史", dynasty: null, tags: ["共和", "民国"], location: "南京" },
  { title: "新文化运动", description: "1915年起，陈独秀、李大钊等倡导民主与科学", startDate: "1915", category: "CHINA", importance: 5, era: "近代史", dynasty: null, tags: ["思想解放"], location: "北京" },
  { title: "五四运动爆发", description: "1919年5月4日，北京学生游行，新民主主义革命开端", startDate: "1919", category: "CHINA", importance: 5, era: "近代史", dynasty: null, tags: ["爱国运动", "新民主主义"], location: "北京" },
  { title: "中国共产党成立", description: "1921年7月，中共一大在上海召开，中国共产党诞生", startDate: "1921", category: "CHINA", importance: 5, era: "近代史", dynasty: null, tags: ["建党"], location: "上海" },
  { title: "北伐战争", description: "1926—1928年，国民革命军北伐，基本推翻北洋军阀统治", startDate: "1926", category: "CHINA", importance: 5, era: "近代史", dynasty: null, tags: ["战争", "统一"], location: "全国" },
  { title: "南昌起义", description: "1927年8月1日，南昌起义打响武装反抗国民党反动派第一枪", startDate: "1927", category: "CHINA", importance: 5, era: "近代史", dynasty: null, tags: ["建军"], location: "南昌" },
  { title: "秋收起义与井冈山根据地", description: "1927年秋收起义后，毛泽东率部上井冈山，开辟农村包围城市道路", startDate: "1927", category: "CHINA", importance: 5, era: "近代史", dynasty: null, tags: ["革命道路"], location: "井冈山" },
  { title: "红军长征", description: "1934—1936年，红军完成二万五千里长征", startDate: "1934", category: "CHINA", importance: 5, era: "近代史", dynasty: null, tags: ["长征"], location: "全国" },
  { title: "九一八事变", description: "1931年9月18日，日本发动九一八事变，侵占东北", startDate: "1931", category: "CHINA", importance: 5, era: "近代史", dynasty: null, tags: ["抗日"], location: "沈阳" },
  { title: "西安事变", description: "1936年12月12日，张学良、杨虎城发动兵谏，促成抗日民族统一战线", startDate: "1936", category: "CHINA", importance: 5, era: "近代史", dynasty: null, tags: ["抗日", "统一战线"], location: "西安" },
  { title: "卢沟桥事变", description: "1937年7月7日，日本发动全面侵华战争", startDate: "1937", category: "CHINA", importance: 5, era: "近代史", dynasty: null, tags: ["抗日战争"], location: "北平" },
  { title: "南京大屠杀", description: "1937年12月，日军在南京屠杀30万以上中国平民和战俘", startDate: "1937", category: "CHINA", importance: 5, era: "近代史", dynasty: null, tags: ["惨案"], location: "南京" },
  { title: "台儿庄战役", description: "1938年，国民党军队在台儿庄取得抗战以来正面战场最大胜利", startDate: "1938", category: "CHINA", importance: 4, era: "近代史", dynasty: null, tags: ["抗日战争"], location: "台儿庄" },
  { title: "百团大战", description: "1940年，八路军发动百团大战，是抗战期间规模最大的战役", startDate: "1940", category: "CHINA", importance: 4, era: "近代史", dynasty: null, tags: ["抗日战争"], location: "华北" },
  { title: "抗日战争胜利", description: "1945年8月15日，日本宣布无条件投降", startDate: "1945", category: "CHINA", importance: 5, era: "近代史", dynasty: null, tags: ["抗日战争胜利"], location: "全国" },
  { title: "重庆谈判", description: "1945年8—10月，国共重庆谈判，签订《双十协定》", startDate: "1945", category: "CHINA", importance: 4, era: "近代史", dynasty: null, tags: ["谈判"], location: "重庆" },
  { title: "解放战争（全面内战爆发）", description: "1946年6月，国民党进攻中原解放区，全面内战爆发", startDate: "1946", category: "CHINA", importance: 5, era: "近代史", dynasty: null, tags: ["解放战争"], location: "全国" },
  { title: "三大战役", description: "1948年9月—1949年1月，辽沈、淮海、平津三大战役", startDate: "1948", category: "CHINA", importance: 5, era: "近代史", dynasty: null, tags: ["解放战争"], location: "全国" },
  { title: "渡江战役与南京解放", description: "1949年4月，百万雄师过大江，解放南京", startDate: "1949", category: "CHINA", importance: 5, era: "近代史", dynasty: null, tags: ["解放战争"], location: "南京" },
  { title: "中华人民共和国成立", description: "1949年10月1日，开国大典，新中国成立", startDate: "1949", category: "CHINA", importance: 5, era: "现代史", dynasty: null, tags: ["建国"], location: "北京" },

  // 中国现代史
  { title: "抗美援朝", description: "1950—1953年，中国人民志愿军入朝作战", startDate: "1950", category: "CHINA", importance: 5, era: "现代史", dynasty: null, tags: ["战争", "外交"], location: "朝鲜" },
  { title: "土地改革", description: "1950—1952年，新解放区进行土地改革", startDate: "1950", category: "CHINA", importance: 4, era: "现代史", dynasty: null, tags: ["改革", "土地"], location: "全国" },
  { title: "三大改造", description: "1953—1956年，对农业、手工业、资本主义工商业的社会主义改造", startDate: "1953", category: "CHINA", importance: 5, era: "现代史", dynasty: null, tags: ["社会主义改造"], location: "全国" },
  { title: "一五计划", description: "1953—1957年，第一个五年计划，奠定工业化基础", startDate: "1953", category: "CHINA", importance: 5, era: "现代史", dynasty: null, tags: ["经济建设"], location: "全国" },
  { title: "和平共处五项原则", description: "1953年，周恩来提出和平共处五项原则", startDate: "1953", category: "CHINA", importance: 5, era: "现代史", dynasty: null, tags: ["外交"], location: "北京" },
  { title: "万隆会议", description: "1955年，周恩来参加万隆会议，提出求同存异方针", startDate: "1955", category: "CHINA", importance: 4, era: "现代史", dynasty: null, tags: ["外交"], location: "万隆" },
  { title: "大跃进与人民公社化运动", description: "1958年，大跃进和人民公社化运动，左倾错误泛滥", startDate: "1958", category: "CHINA", importance: 4, era: "现代史", dynasty: null, tags: ["经济", "失误"], location: "全国" },
  { title: "文化大革命", description: "1966—1976年，十年文革动乱", startDate: "1966", category: "CHINA", importance: 5, era: "现代史", dynasty: null, tags: ["政治运动"], location: "全国" },
  { title: "中国恢复联合国合法席位", description: "1971年10月，第26届联大恢复中国在联合国的合法席位", startDate: "1971", category: "CHINA", importance: 5, era: "现代史", dynasty: null, tags: ["外交"], location: "联合国" },
  { title: "尼克松访华", description: "1972年2月，美国总统尼克松访华，中美关系开始正常化", startDate: "1972", category: "CHINA", importance: 5, era: "现代史", dynasty: null, tags: ["外交", "中美关系"], location: "北京" },
  { title: "中日邦交正常化", description: "1972年9月，中日建立外交关系", startDate: "1972", category: "CHINA", importance: 4, era: "现代史", dynasty: null, tags: ["外交"], location: "北京" },
  { title: "十一届三中全会（改革开放）", description: "1978年12月，确立改革开放政策，工作重心转移到经济建设", startDate: "1978", category: "CHINA", importance: 5, era: "现代史", dynasty: null, tags: ["改革开放"], location: "北京" },
  { title: "家庭联产承包责任制", description: "1978年起，农村实行家庭联产承包责任制", startDate: "1978", category: "CHINA", importance: 5, era: "现代史", dynasty: null, tags: ["农村改革"], location: "安徽凤阳" },
  { title: "深圳经济特区设立", description: "1980年，设立深圳、珠海、汕头、厦门经济特区", startDate: "1980", category: "CHINA", importance: 5, era: "现代史", dynasty: null, tags: ["改革开放", "特区"], location: "深圳" },
  { title: "香港回归", description: "1997年7月1日，中国恢复对香港行使主权", startDate: "1997", category: "CHINA", importance: 5, era: "现代史", dynasty: null, tags: ["一国两制", "回归"], location: "香港" },
  { title: "澳门回归", description: "1999年12月20日，中国恢复对澳门行使主权", startDate: "1999", category: "CHINA", importance: 4, era: "现代史", dynasty: null, tags: ["一国两制", "回归"], location: "澳门" },
  { title: "中国加入WTO", description: "2001年12月，中国正式加入世界贸易组织", startDate: "2001", category: "CHINA", importance: 5, era: "现代史", dynasty: null, tags: ["经济全球化"], location: "全国" },
  { title: "北京奥运会", description: "2008年8月，北京成功举办第29届夏季奥运会", startDate: "2008", category: "CHINA", importance: 4, era: "现代史", dynasty: null, tags: ["体育", "国际"], location: "北京" },
  { title: "一带一路倡议提出", description: "2013年，习近平提出一带一路倡议", startDate: "2013", category: "CHINA", importance: 5, era: "现代史", dynasty: null, tags: ["外交", "经济"], location: "全国" },
  { title: "中国共产党成立100周年", description: "2021年7月1日，庆祝中国共产党成立100周年", startDate: "2021", category: "CHINA", importance: 4, era: "现代史", dynasty: null, tags: ["建党"], location: "北京" },

  // ═══════════════════════════════════════════════
  // 世界史
  // ═══════════════════════════════════════════════

  // 古代文明
  { title: "汉谟拉比法典颁布", description: "约公元前1776年，古巴比伦颁布《汉谟拉比法典》，迄今已知世界上第一部较为完整的成文法典", startDate: "-1776", category: "WORLD", importance: 5, era: "古代文明", dynasty: null, tags: ["法律", "古巴比伦"], location: "两河流域" },
  { title: "古埃及金字塔建造", description: "约公元前2600年，古埃及建造金字塔", startDate: "-2600", category: "WORLD", importance: 4, era: "古代文明", dynasty: null, tags: ["建筑", "古埃及"], location: "埃及" },
  { title: "雅典民主政治确立", description: "公元前594年，梭伦改革奠定雅典民主政治基础", startDate: "-594", category: "WORLD", importance: 5, era: "古代文明", dynasty: null, tags: ["民主", "古希腊"], location: "雅典" },
  { title: "雅典民主顶峰（伯里克利）", description: "公元前5世纪，伯里克利时代雅典民主达到顶峰", startDate: "-443", category: "WORLD", importance: 5, era: "古代文明", dynasty: null, tags: ["民主", "古希腊"], location: "雅典" },
  { title: "亚历山大东征", description: "公元前334年起，亚历山大帝国横跨欧亚非", startDate: "-334", category: "WORLD", importance: 4, era: "古代文明", dynasty: null, tags: ["战争", "帝国"], location: "欧亚非" },
  { title: "罗马共和国建立", description: "公元前509年，罗马共和国建立", startDate: "-509", category: "WORLD", importance: 4, era: "古代文明", dynasty: null, tags: ["政治", "古罗马"], location: "罗马" },
  { title: "罗马帝国建立", description: "公元前27年，屋大维建立罗马帝国", startDate: "-27", category: "WORLD", importance: 5, era: "古代文明", dynasty: null, tags: ["帝国", "古罗马"], location: "罗马" },
  { title: "基督教创立", description: "公元1世纪，基督教在巴勒斯坦地区创立", startDate: "30", category: "WORLD", importance: 5, era: "古代文明", dynasty: null, tags: ["宗教"], location: "巴勒斯坦" },

  // 中世纪
  { title: "西罗马帝国灭亡", description: "公元476年，西罗马帝国灭亡，欧洲进入中世纪", startDate: "476", category: "WORLD", importance: 5, era: "中世纪", dynasty: null, tags: ["帝国灭亡"], location: "欧洲" },
  { title: "伊斯兰教创立", description: "公元622年，穆罕默德创立伊斯兰教", startDate: "622", category: "WORLD", importance: 4, era: "中世纪", dynasty: null, tags: ["宗教"], location: "阿拉伯半岛" },
  { title: "查理曼帝国", description: "公元800年，查理曼加冕为罗马人的皇帝", startDate: "800", category: "WORLD", importance: 3, era: "中世纪", dynasty: null, tags: ["帝国"], location: "欧洲" },
  { title: "十字军东征", description: "1096—1291年，十字军八次东征", startDate: "1096", category: "WORLD", importance: 4, era: "中世纪", dynasty: null, tags: ["宗教战争"], location: "中东" },
  { title: "黑死病流行", description: "1347—1351年，黑死病席卷欧洲，人口锐减", startDate: "1347", category: "WORLD", importance: 4, era: "中世纪", dynasty: null, tags: ["瘟疫"], location: "欧洲" },
  { title: "英法百年战争", description: "1337—1453年，英法百年战争", startDate: "1337", category: "WORLD", importance: 3, era: "中世纪", dynasty: null, tags: ["战争"], location: "英法" },

  // 文艺复兴与新航路
  { title: "文艺复兴兴起", description: "14世纪起，意大利兴起文艺复兴运动，提倡人文主义", startDate: "1350", category: "WORLD", importance: 5, era: "文艺复兴", dynasty: null, tags: ["思想解放", "文化"], location: "意大利" },
  { title: "哥伦布到达美洲", description: "1492年，哥伦布横渡大西洋到达美洲", startDate: "1492", category: "WORLD", importance: 5, era: "新航路开辟", dynasty: null, tags: ["航海", "地理大发现"], location: "美洲" },
  { title: "达伽马到达印度", description: "1498年，达伽马开辟从欧洲绕过非洲到达印度的新航路", startDate: "1498", category: "WORLD", importance: 4, era: "新航路开辟", dynasty: null, tags: ["航海"], location: "印度" },
  { title: "麦哲伦环球航行", description: "1519—1522年，麦哲伦船队完成人类首次环球航行", startDate: "1519", category: "WORLD", importance: 5, era: "新航路开辟", dynasty: null, tags: ["航海"], location: "全球" },
  { title: "宗教改革", description: "1517年，马丁·路德发表《九十五条论纲》，宗教改革开始", startDate: "1517", category: "WORLD", importance: 5, era: "文艺复兴", dynasty: null, tags: ["宗教改革"], location: "德国" },

  // 资本主义兴起
  { title: "英国资产阶级革命", description: "1640—1688年，英国资产阶级革命，确立君主立宪制", startDate: "1640", category: "WORLD", importance: 5, era: "资本主义兴起", dynasty: null, tags: ["革命", "君主立宪"], location: "英国" },
  { title: "光荣革命", description: "1688年，英国光荣革命，奠定君主立宪制基础", startDate: "1688", category: "WORLD", importance: 5, era: "资本主义兴起", dynasty: null, tags: ["革命"], location: "英国" },
  { title: "《权利法案》颁布", description: "1689年，英国颁布《权利法案》，确立议会主权", startDate: "1689", category: "WORLD", importance: 5, era: "资本主义兴起", dynasty: null, tags: ["法律", "宪政"], location: "英国" },
  { title: "美国独立战争", description: "1775—1783年，美国独立战争，赢得国家独立", startDate: "1775", category: "WORLD", importance: 5, era: "资本主义兴起", dynasty: null, tags: ["革命", "独立"], location: "北美" },
  { title: "《独立宣言》发表", description: "1776年7月4日，美国发表《独立宣言》", startDate: "1776", category: "WORLD", importance: 5, era: "资本主义兴起", dynasty: null, tags: ["独立", "人权"], location: "美国" },
  { title: "法国大革命", description: "1789年7月14日，法国大革命爆发，攻占巴士底狱", startDate: "1789", category: "WORLD", importance: 5, era: "资本主义兴起", dynasty: null, tags: ["革命", "人权"], location: "法国" },
  { title: "《人权宣言》发表", description: "1789年8月，法国颁布《人权宣言》", startDate: "1789", category: "WORLD", importance: 5, era: "资本主义兴起", dynasty: null, tags: ["人权", "法律"], location: "法国" },
  { title: "拿破仑帝国", description: "1804年，拿破仑称帝，建立法兰西第一帝国", startDate: "1804", category: "WORLD", importance: 4, era: "资本主义兴起", dynasty: null, tags: ["帝国"], location: "法国" },
  { title: "维也纳体系建立", description: "1815年，维也纳会议建立维也纳体系", startDate: "1815", category: "WORLD", importance: 3, era: "资本主义兴起", dynasty: null, tags: ["国际关系"], location: "维也纳" },

  // 工业革命
  { title: "第一次工业革命", description: "18世纪60年代—19世纪40年代，英国率先完成工业革命", startDate: "1765", category: "WORLD", importance: 5, era: "工业革命", dynasty: null, tags: ["工业革命", "科技"], location: "英国" },
  { title: "《共产党宣言》发表", description: "1848年2月，马克思、恩格斯发表《共产党宣言》", startDate: "1848", category: "WORLD", importance: 5, era: "工业革命", dynasty: null, tags: ["马克思主义"], location: "伦敦" },
  { title: "美国南北战争", description: "1861—1865年，美国南北战争，废除奴隶制", startDate: "1861", category: "WORLD", importance: 5, era: "工业革命", dynasty: null, tags: ["内战", "废奴"], location: "美国" },
  { title: "日本明治维新", description: "1868年，日本明治维新，走上资本主义道路", startDate: "1868", category: "WORLD", importance: 5, era: "工业革命", dynasty: null, tags: ["改革", "近代化"], location: "日本" },
  { title: "德意志统一", description: "1871年，普鲁士统一德国，建立德意志帝国", startDate: "1871", category: "WORLD", importance: 4, era: "工业革命", dynasty: null, tags: ["统一"], location: "德国" },
  { title: "第二次工业革命", description: "19世纪70年代—20世纪初，电力广泛应用，内燃机发明", startDate: "1870", category: "WORLD", importance: 5, era: "工业革命", dynasty: null, tags: ["工业革命", "科技"], location: "欧美" },
  { title: "三国同盟与三国协约", description: "19世纪末20世纪初，欧洲形成两大军事集团对峙", startDate: "1882", category: "WORLD", importance: 4, era: "工业革命", dynasty: null, tags: ["军事集团"], location: "欧洲" },

  // 两次世界大战
  { title: "第一次世界大战", description: "1914—1918年，第一次世界大战", startDate: "1914", category: "WORLD", importance: 5, era: "世界大战", dynasty: null, tags: ["世界大战"], location: "全球" },
  { title: "俄国十月革命", description: "1917年11月，俄国十月革命，建立世界上第一个社会主义国家", startDate: "1917", category: "WORLD", importance: 5, era: "世界大战", dynasty: null, tags: ["革命", "社会主义"], location: "俄国" },
  { title: "凡尔赛—华盛顿体系", description: "1919—1922年，一战后建立凡尔赛—华盛顿体系", startDate: "1919", category: "WORLD", importance: 4, era: "世界大战", dynasty: null, tags: ["国际关系"], location: "全球" },
  { title: "1929年经济大危机", description: "1929—1933年，资本主义世界经济大危机", startDate: "1929", category: "WORLD", importance: 5, era: "世界大战", dynasty: null, tags: ["经济危机"], location: "全球" },
  { title: "罗斯福新政", description: "1933年，罗斯福实行新政，加强国家对经济的干预", startDate: "1933", category: "WORLD", importance: 5, era: "世界大战", dynasty: null, tags: ["改革", "经济"], location: "美国" },
  { title: "德国法西斯上台", description: "1933年，希特勒出任德国总理，法西斯专政建立", startDate: "1933", category: "WORLD", importance: 5, era: "世界大战", dynasty: null, tags: ["法西斯"], location: "德国" },
  { title: "第二次世界大战爆发", description: "1939年9月1日，德国入侵波兰，二战全面爆发", startDate: "1939", category: "WORLD", importance: 5, era: "世界大战", dynasty: null, tags: ["世界大战"], location: "全球" },
  { title: "珍珠港事件", description: "1941年12月7日，日本偷袭珍珠港，美国参战", startDate: "1941", category: "WORLD", importance: 5, era: "世界大战", dynasty: null, tags: ["世界大战"], location: "夏威夷" },
  { title: "诺曼底登陆", description: "1944年6月6日，盟军在诺曼底登陆，开辟欧洲第二战场", startDate: "1944", category: "WORLD", importance: 5, era: "世界大战", dynasty: null, tags: ["世界大战"], location: "法国" },
  { title: "联合国成立", description: "1945年10月24日，联合国正式成立", startDate: "1945", category: "WORLD", importance: 5, era: "世界大战", dynasty: null, tags: ["国际组织"], location: "纽约" },
  { title: "日本投降", description: "1945年8月15日，日本宣布无条件投降，二战结束", startDate: "1945", category: "WORLD", importance: 5, era: "世界大战", dynasty: null, tags: ["世界大战结束"], location: "日本" },

  // 冷战与当代
  { title: "雅尔塔体系建立", description: "1945年，雅尔塔会议确立战后世界格局", startDate: "1945", category: "WORLD", importance: 4, era: "冷战", dynasty: null, tags: ["国际关系"], location: "雅尔塔" },
  { title: "杜鲁门主义出台", description: "1947年，杜鲁门主义出台，冷战开始", startDate: "1947", category: "WORLD", importance: 5, era: "冷战", dynasty: null, tags: ["冷战"], location: "美国" },
  { title: "马歇尔计划", description: "1948年，美国实施马歇尔计划，援助西欧经济恢复", startDate: "1948", category: "WORLD", importance: 4, era: "冷战", dynasty: null, tags: ["冷战", "经济"], location: "欧洲" },
  { title: "北约成立", description: "1949年，北大西洋公约组织成立", startDate: "1949", category: "WORLD", importance: 4, era: "冷战", dynasty: null, tags: ["军事集团"], location: "欧洲" },
  { title: "朝鲜战争", description: "1950—1953年，朝鲜战争", startDate: "1950", category: "WORLD", importance: 4, era: "冷战", dynasty: null, tags: ["战争"], location: "朝鲜半岛" },
  { title: "华约成立", description: "1955年，华沙条约组织成立，两极格局正式形成", startDate: "1955", category: "WORLD", importance: 4, era: "冷战", dynasty: null, tags: ["军事集团"], location: "东欧" },
  { title: "古巴导弹危机", description: "1962年，古巴导弹危机，冷战最紧张时刻", startDate: "1962", category: "WORLD", importance: 4, era: "冷战", dynasty: null, tags: ["冷战"], location: "古巴" },
  { title: "阿波罗11号登月", description: "1969年7月20日，美国宇航员首次登月", startDate: "1969", category: "WORLD", importance: 4, era: "冷战", dynasty: null, tags: ["科技", "航天"], location: "月球" },
  { title: "布雷顿森林体系瓦解", description: "1971年，美元与黄金脱钩，布雷顿森林体系瓦解", startDate: "1971", category: "WORLD", importance: 3, era: "冷战", dynasty: null, tags: ["经济"], location: "全球" },
  { title: "欧盟成立", description: "1993年，欧洲联盟正式成立", startDate: "1993", category: "WORLD", importance: 5, era: "冷战", dynasty: null, tags: ["一体化"], location: "欧洲" },
  { title: "苏联解体，冷战结束", description: "1991年12月25日，苏联解体，冷战结束", startDate: "1991", category: "WORLD", importance: 5, era: "冷战", dynasty: null, tags: ["冷战结束"], location: "苏联" },
  { title: "9·11事件", description: "2001年9月11日，美国遭受恐怖袭击", startDate: "2001", category: "WORLD", importance: 4, era: "当代", dynasty: null, tags: ["恐怖主义"], location: "美国" },
  { title: "2008年全球金融危机", description: "2008年，由美国次贷危机引发全球金融危机", startDate: "2008", category: "WORLD", importance: 4, era: "当代", dynasty: null, tags: ["经济危机"], location: "全球" },
];

async function main() {
  console.log(`Importing ${events.length} timeline events...`);

  await db.timelineEvent.deleteMany();

  const result = await db.timelineEvent.createMany({
    data: events.map(e => ({
      ...e,
      relatedEventIds: [],
      tags: e.tags || [],
    })),
  });

  const count = await db.timelineEvent.count();
  const chinaCount = await db.timelineEvent.count({ where: { category: "CHINA" } });
  const worldCount = await db.timelineEvent.count({ where: { category: "WORLD" } });

  console.log(`Done! Created ${result.count} events`);
  console.log(`  China: ${chinaCount}, World: ${worldCount}`);
  console.log(`  Total in DB: ${count}`);

  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
