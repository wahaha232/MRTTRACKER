// ---------------------------------------------------------------------------
// METRO QUEST — 車站資料
// 座標基於「提示詞四十一：分析路線圖後以 SVG 重建」的拓撲佈局。
// viewBox 為 0 0 1080 850，座標為 stylized schematic（非真實 GPS）。
// ---------------------------------------------------------------------------
import type { Station } from '../types';

export const STATIONS: Station[] = [
  // ===== R 淡水信義線（Red） =====
  { id: 'r-tamsui', code: 'R28', nameZh: '淡水', nameEn: 'Tamsui', routeIds: ['R'], x: 540, y: 40, terminal: true },
  { id: 'r-hongshulin', code: 'R27', nameZh: '紅樹林', nameEn: 'Hongshulin', routeIds: ['R'], x: 540, y: 64 },
  { id: 'r-zhuwei', code: 'R26', nameZh: '竹圍', nameEn: 'Zhuwei', routeIds: ['R'], x: 540, y: 88 },
  { id: 'r-guandu', code: 'R25', nameZh: '關渡', nameEn: 'Guandu', routeIds: ['R'], x: 540, y: 112 },
  { id: 'r-zhongyi', code: 'R24', nameZh: '忠義', nameEn: 'Zhongyi', routeIds: ['R'], x: 540, y: 136 },
  { id: 'r-fuxinggang', code: 'R23', nameZh: '復興崗', nameEn: 'Fuxinggang', routeIds: ['R'], x: 540, y: 160 },
  { id: 'r-beitou', code: 'R22', nameZh: '北投', nameEn: 'Beitou', routeIds: ['R'], x: 540, y: 184 },
  { id: 'r-xinbeitou', code: 'R22A', nameZh: '新北投', nameEn: 'Xinbeitou', routeIds: ['R'], x: 505, y: 212, terminal: true },
  { id: 'r-qiyan', code: 'R21', nameZh: '奇岩', nameEn: 'Qiyan', routeIds: ['R'], x: 540, y: 208 },
  { id: 'r-qiliyan', code: 'R20', nameZh: '唭哩岸', nameEn: 'Qiliyan', routeIds: ['R'], x: 540, y: 232 },
  { id: 'r-shipai', code: 'R19', nameZh: '石牌', nameEn: 'Shipai', routeIds: ['R'], x: 540, y: 256 },
  { id: 'r-mingde', code: 'R18', nameZh: '明德', nameEn: 'Mingde', routeIds: ['R'], x: 540, y: 280 },
  { id: 'r-zhishan', code: 'R17', nameZh: '芝山', nameEn: 'Zhishan', routeIds: ['R'], x: 540, y: 304 },
  { id: 'r-shilin', code: 'R16', nameZh: '士林', nameEn: 'Shilin', routeIds: ['R'], x: 540, y: 328 },
  { id: 'r-jiantan', code: 'R15', nameZh: '劍潭', nameEn: 'Jiantan', routeIds: ['R'], x: 548, y: 352 },
  { id: 'r-yuanshan', code: 'R14', nameZh: '圓山', nameEn: 'Yuanshan', routeIds: ['R'], x: 560, y: 376 },
  { id: 'r-minquanw', code: 'R13', nameZh: '民權西路', nameEn: 'Minquan W. Rd.', routeIds: ['R', 'O'], x: 565, y: 398 },
  { id: 'r-shuanglian', code: 'R12', nameZh: '雙連', nameEn: 'Shuanglian', routeIds: ['R'], x: 582, y: 416 },
  { id: 'r-zhongshan', code: 'R11', nameZh: '中山', nameEn: 'Zhongshan', routeIds: ['R', 'G'], x: 600, y: 432 },
  { id: 'r-taipei-main', code: 'R10', nameZh: '台北車站', nameEn: 'Taipei Main Station', routeIds: ['R', 'BL'], x: 600, y: 470 },
  { id: 'r-taiwan-hospital', code: 'R09', nameZh: '台大醫院', nameEn: 'NTU Hospital', routeIds: ['R'], x: 612, y: 505 },
  { id: 'r-chiangkai', code: 'R08', nameZh: '中正紀念堂', nameEn: 'Chiang Kai-shek Memorial Hall', routeIds: ['R', 'G'], x: 630, y: 540 },
  { id: 'r-dongmen', code: 'R07', nameZh: '東門', nameEn: 'Dongmen', routeIds: ['R', 'O'], x: 662, y: 562 },
  { id: 'r-daan-park', code: 'R06', nameZh: '大安森林公園', nameEn: 'Daan Park', routeIds: ['R'], x: 698, y: 572 },
  { id: 'r-daan', code: 'R05', nameZh: '大安', nameEn: 'Daan', routeIds: ['R', 'BR'], x: 734, y: 578 },
  { id: 'r-xinyi-anhe', code: 'R04', nameZh: '信義安和', nameEn: 'Xinyi Anhe', routeIds: ['R'], x: 768, y: 570 },
  { id: 'r-taipei101', code: 'R03', nameZh: '台北101/世貿', nameEn: 'Taipei 101/World Trade Center', routeIds: ['R'], x: 802, y: 558 },
  { id: 'r-xiangshan', code: 'R02', nameZh: '象山', nameEn: 'Xiangshan', routeIds: ['R'], x: 836, y: 544, terminal: true },

  // ===== BL 板南線（Blue） =====
  { id: 'bl-dingpu', code: 'BL01', nameZh: '頂埔', nameEn: 'Dingpu', routeIds: ['BL'], x: 60, y: 595, terminal: true },
  { id: 'bl-yongning', code: 'BL02', nameZh: '永寧', nameEn: 'Yongning', routeIds: ['BL'], x: 105, y: 595 },
  { id: 'bl-tucheng', code: 'BL03', nameZh: '土城', nameEn: 'Tucheng', routeIds: ['BL'], x: 150, y: 595 },
  { id: 'bl-haishan', code: 'BL04', nameZh: '海山', nameEn: 'Haishan', routeIds: ['BL'], x: 195, y: 595 },
  { id: 'bl-yadong-hospital', code: 'BL05', nameZh: '亞東醫院', nameEn: 'Far Eastern Hospital', routeIds: ['BL'], x: 240, y: 595 },
  { id: 'bl-fuzhong', code: 'BL06', nameZh: '府中', nameEn: 'Fuzhong', routeIds: ['BL'], x: 285, y: 595 },
  { id: 'bl-banqiao', code: 'BL07', nameZh: '板橋', nameEn: 'Banqiao', routeIds: ['BL', 'Y'], x: 345, y: 585 },
  { id: 'bl-xinpu', code: 'BL08', nameZh: '新埔', nameEn: 'Xinpu', routeIds: ['BL'], x: 390, y: 570 },
  { id: 'bl-jiangzicui', code: 'BL09', nameZh: '江子翠', nameEn: 'Jiangzicui', routeIds: ['BL'], x: 435, y: 550 },
  { id: 'bl-longshan', code: 'BL10', nameZh: '龍山寺', nameEn: 'Longshan Temple', routeIds: ['BL'], x: 475, y: 530 },
  { id: 'bl-ximen', code: 'BL11', nameZh: '西門', nameEn: 'Ximen', routeIds: ['BL', 'G'], x: 510, y: 510 },
  { id: 'bl-taipei-main', code: 'BL12', nameZh: '台北車站', nameEn: 'Taipei Main Station', routeIds: ['R', 'BL'], x: 600, y: 470 },
  { id: 'bl-shandao', code: 'BL13', nameZh: '善導寺', nameEn: 'Shandao Temple', routeIds: ['BL'], x: 640, y: 470 },
  { id: 'bl-zhongxiao-xinsheng', code: 'BL14', nameZh: '忠孝新生', nameEn: 'Zhongxiao Xinsheng', routeIds: ['BL', 'O'], x: 680, y: 470 },
  { id: 'bl-zhongxiao-fuxing', code: 'BL15', nameZh: '忠孝復興', nameEn: 'Zhongxiao Fuxing', routeIds: ['BL', 'BR'], x: 725, y: 470 },
  { id: 'bl-zhongxiao-dunhua', code: 'BL16', nameZh: '忠孝敦化', nameEn: 'Zhongxiao Dunhua', routeIds: ['BL'], x: 770, y: 470 },
  { id: 'bl-sunyat-sen', code: 'BL17', nameZh: '國父紀念館', nameEn: 'Sun Yat-sen Memorial Hall', routeIds: ['BL'], x: 815, y: 470 },
  { id: 'bl-cityhall', code: 'BL18', nameZh: '市政府', nameEn: 'Taipei City Hall', routeIds: ['BL'], x: 860, y: 470 },
  { id: 'bl-yongchun', code: 'BL19', nameZh: '永春', nameEn: 'Yongchun', routeIds: ['BL'], x: 900, y: 470 },
  { id: 'bl-houshanpi', code: 'BL20', nameZh: '後山埤', nameEn: 'Houshanpi', routeIds: ['BL'], x: 935, y: 470 },
  { id: 'bl-kunyang', code: 'BL21', nameZh: '昆陽', nameEn: 'Kunyang', routeIds: ['BL'], x: 960, y: 470 },
  { id: 'bl-nangang', code: 'BL22', nameZh: '南港', nameEn: 'Nangang', routeIds: ['BL'], x: 975, y: 435 },
  { id: 'bl-nangang-exhibition', code: 'BL23', nameZh: '南港展覽館', nameEn: 'Taipei Nangang Exhibition Center', routeIds: ['BL', 'BR'], x: 990, y: 395, terminal: true },

  // ===== G 松山新店線（Green） =====
  { id: 'g-xindian', code: 'G01', nameZh: '新店', nameEn: 'Xindian', routeIds: ['G'], x: 250, y: 790, terminal: true },
  { id: 'g-xindian-district', code: 'G02', nameZh: '新店區公所', nameEn: 'Xindian District Office', routeIds: ['G'], x: 280, y: 750 },
  { id: 'g-qizhang', code: 'G03', nameZh: '七張', nameEn: 'Qizhang', routeIds: ['G'], x: 310, y: 710 },
  { id: 'g-xiaobitan', code: 'G03A', nameZh: '小碧潭', nameEn: 'Xiaobitan', routeIds: ['G'], x: 275, y: 732, terminal: true },
  { id: 'g-dapinglin', code: 'G04', nameZh: '大坪林', nameEn: 'Dapinglin', routeIds: ['G', 'Y'], x: 350, y: 668 },
  { id: 'g-jingmei', code: 'G05', nameZh: '景美', nameEn: 'Jingmei', routeIds: ['G'], x: 395, y: 630 },
  { id: 'g-wanlong', code: 'G06', nameZh: '萬隆', nameEn: 'Wanlong', routeIds: ['G'], x: 440, y: 592 },
  { id: 'g-gongguan', code: 'G07', nameZh: '公館', nameEn: 'Gongguan', routeIds: ['G'], x: 485, y: 555 },
  { id: 'g-taipower', code: 'G08', nameZh: '台電大樓', nameEn: 'Taipower Building', routeIds: ['G'], x: 525, y: 540 },
  { id: 'g-guting', code: 'G09', nameZh: '古亭', nameEn: 'Guting', routeIds: ['G', 'O'], x: 575, y: 575 },
  { id: 'g-chiangkai', code: 'G10', nameZh: '中正紀念堂', nameEn: 'Chiang Kai-shek Memorial Hall', routeIds: ['R', 'G'], x: 630, y: 540 },
  { id: 'g-xiaonanmen', code: 'G11', nameZh: '小南門', nameEn: 'Xiaonanmen', routeIds: ['G'], x: 585, y: 522 },
  { id: 'g-ximen', code: 'G12', nameZh: '西門', nameEn: 'Ximen', routeIds: ['BL', 'G'], x: 510, y: 510 },
  { id: 'g-beimen', code: 'G13', nameZh: '北門', nameEn: 'Beimen', routeIds: ['G'], x: 550, y: 478 },
  { id: 'g-zhongshan', code: 'G14', nameZh: '中山', nameEn: 'Zhongshan', routeIds: ['R', 'G'], x: 600, y: 432 },
  { id: 'g-songjiang-nanjing', code: 'G15', nameZh: '松江南京', nameEn: 'Songjiang Nanjing', routeIds: ['G', 'O'], x: 630, y: 430 },
  { id: 'g-nanjing-fuxing', code: 'G16', nameZh: '南京復興', nameEn: 'Nanjing Fuxing', routeIds: ['G', 'BR'], x: 690, y: 400 },
  { id: 'g-taipei-arena', code: 'G17', nameZh: '台北小巨蛋', nameEn: 'Taipei Arena', routeIds: ['G'], x: 735, y: 390 },
  { id: 'g-nanjing-sanmin', code: 'G18', nameZh: '南京三民', nameEn: 'Nanjing Sanmin', routeIds: ['G'], x: 780, y: 380 },
  { id: 'g-songshan', code: 'G19', nameZh: '松山', nameEn: 'Songshan', routeIds: ['G'], x: 825, y: 370, terminal: true },

  // ===== O 中和新蘆線（Orange） =====
  { id: 'o-nanshijiao', code: 'O01', nameZh: '南勢角', nameEn: 'Nanshijiao', routeIds: ['O'], x: 430, y: 790, terminal: true },
  { id: 'o-jingan', code: 'O02', nameZh: '景安', nameEn: 'Jingan', routeIds: ['O', 'Y'], x: 450, y: 745 },
  { id: 'o-yongan', code: 'O03', nameZh: '永安市場', nameEn: 'Yongan Market', routeIds: ['O'], x: 470, y: 700 },
  { id: 'o-dingxi', code: 'O04', nameZh: '頂溪', nameEn: 'Dingxi', routeIds: ['O'], x: 510, y: 655 },
  { id: 'o-guting', code: 'O05', nameZh: '古亭', nameEn: 'Guting', routeIds: ['G', 'O'], x: 575, y: 575 },
  { id: 'o-dongmen', code: 'O06', nameZh: '東門', nameEn: 'Dongmen', routeIds: ['R', 'O'], x: 662, y: 562 },
  { id: 'o-zhongxiao-xinsheng', code: 'O07', nameZh: '忠孝新生', nameEn: 'Zhongxiao Xinsheng', routeIds: ['BL', 'O'], x: 680, y: 470 },
  { id: 'o-songjiang-nanjing', code: 'O08', nameZh: '松江南京', nameEn: 'Songjiang Nanjing', routeIds: ['G', 'O'], x: 630, y: 430 },
  { id: 'o-xingtian', code: 'O09', nameZh: '行天宮', nameEn: 'Xingtian Temple', routeIds: ['O'], x: 595, y: 415 },
  { id: 'o-zhongshan-guoxiao', code: 'O10', nameZh: '中山國小', nameEn: 'Zhongshan Elementary School', routeIds: ['O'], x: 580, y: 405 },
  { id: 'o-minquanw', code: 'O11', nameZh: '民權西路', nameEn: 'Minquan W. Rd.', routeIds: ['R', 'O'], x: 565, y: 398 },
  { id: 'o-daqiaotou', code: 'O12', nameZh: '大橋頭', nameEn: 'Daqiaotou', routeIds: ['O'], x: 525, y: 385 },
  // 蘆洲支線
  { id: 'o-sanchong-guoxiao', code: 'O50', nameZh: '三重國小', nameEn: 'Sanchong Elementary School', routeIds: ['O'], x: 465, y: 385 },
  { id: 'o-sanhe-guozhong', code: 'O51', nameZh: '三和國中', nameEn: 'Sanhe Junior High School', routeIds: ['O'], x: 430, y: 410 },
  { id: 'o-xuhui-zhongxue', code: 'O52', nameZh: '徐匯中學', nameEn: 'St. Ignatius High School', routeIds: ['O'], x: 400, y: 440 },
  { id: 'o-sanmin-gaozhong', code: 'O53', nameZh: '三民高中', nameEn: 'Sanmin Senior High School', routeIds: ['O'], x: 370, y: 475 },
  { id: 'o-luzhou', code: 'O54', nameZh: '蘆洲', nameEn: 'Luzhou', routeIds: ['O'], x: 345, y: 510, terminal: true },
  // 新莊支線
  { id: 'o-sanchong', code: 'O60', nameZh: '三重', nameEn: 'Sanchong', routeIds: ['O'], x: 470, y: 345 },
  { id: 'o-cailiao', code: 'O61', nameZh: '菜寮', nameEn: 'Cailiao', routeIds: ['O'], x: 430, y: 325 },
  { id: 'o-taipei-qiao', code: 'O62', nameZh: '台北橋', nameEn: 'Taipei Bridge', routeIds: ['O'], x: 390, y: 345 },
  { id: 'o-xinzhuang', code: 'O63', nameZh: '新莊', nameEn: 'Xinzhuang', routeIds: ['O'], x: 355, y: 380 },
  { id: 'o-fuda', code: 'O64', nameZh: '輔大', nameEn: 'Fu Jen University', routeIds: ['O'], x: 325, y: 420 },
  { id: 'o-danfeng', code: 'O65', nameZh: '丹鳳', nameEn: 'Danfeng', routeIds: ['O'], x: 300, y: 465 },
  { id: 'o-huilong', code: 'O66', nameZh: '迴龍', nameEn: 'Huilong', routeIds: ['O'], x: 280, y: 510, terminal: true },

  // ===== BR 文湖線（Brown） =====
  { id: 'br-dongwu', code: 'BR01', nameZh: '動物園', nameEn: 'Taipei Zoo', routeIds: ['BR'], x: 720, y: 800, terminal: true },
  { id: 'br-muzha', code: 'BR02', nameZh: '木柵', nameEn: 'Muzha', routeIds: ['BR'], x: 720, y: 770 },
  { id: 'br-wanfang-community', code: 'BR03', nameZh: '萬芳社區', nameEn: 'Wanfang Community', routeIds: ['BR'], x: 720, y: 740 },
  { id: 'br-wanfang-hospital', code: 'BR04', nameZh: '萬芳醫院', nameEn: 'Wanfang Hospital', routeIds: ['BR'], x: 720, y: 710 },
  { id: 'br-xinhai', code: 'BR05', nameZh: '辛亥', nameEn: 'Xinhai', routeIds: ['BR'], x: 720, y: 680 },
  { id: 'br-linguang', code: 'BR06', nameZh: '麟光', nameEn: 'Linguang', routeIds: ['BR'], x: 720, y: 650 },
  { id: 'br-liuzhangli', code: 'BR07', nameZh: '六張犁', nameEn: 'Liuzhangli', routeIds: ['BR'], x: 720, y: 620 },
  { id: 'br-kejidalu', code: 'BR08', nameZh: '科技大樓', nameEn: 'Technology Building', routeIds: ['BR'], x: 720, y: 590 },
  { id: 'br-daan', code: 'BR09', nameZh: '大安', nameEn: 'Daan', routeIds: ['R', 'BR'], x: 734, y: 578 },
  { id: 'br-zhongxiao-fuxing', code: 'BR10', nameZh: '忠孝復興', nameEn: 'Zhongxiao Fuxing', routeIds: ['BL', 'BR'], x: 725, y: 470 },
  { id: 'br-nanjing-fuxing', code: 'BR11', nameZh: '南京復興', nameEn: 'Nanjing Fuxing', routeIds: ['G', 'BR'], x: 690, y: 400 },
  { id: 'br-zhongshan-guozhong', code: 'BR12', nameZh: '中山國中', nameEn: 'Zhongshan Junior High School', routeIds: ['BR'], x: 655, y: 380 },
  { id: 'br-songshan-airport', code: 'BR13', nameZh: '松山機場', nameEn: 'Songshan Airport', routeIds: ['BR'], x: 620, y: 362 },
  { id: 'br-dazhi', code: 'BR14', nameZh: '大直', nameEn: 'Dazhi', routeIds: ['BR'], x: 620, y: 320 },
  { id: 'br-jiannan', code: 'BR15', nameZh: '劍南路', nameEn: 'Jiannan Rd.', routeIds: ['BR'], x: 660, y: 305 },
  { id: 'br-xihu', code: 'BR16', nameZh: '西湖', nameEn: 'Xihu', routeIds: ['BR'], x: 705, y: 298 },
  { id: 'br-gangqian', code: 'BR17', nameZh: '港墘', nameEn: 'Gangqian', routeIds: ['BR'], x: 750, y: 298 },
  { id: 'br-wende', code: 'BR18', nameZh: '文德', nameEn: 'Wende', routeIds: ['BR'], x: 795, y: 298 },
  { id: 'br-neihu', code: 'BR19', nameZh: '內湖', nameEn: 'Neihu', routeIds: ['BR'], x: 840, y: 298 },
  { id: 'br-dahu-park', code: 'BR20', nameZh: '大湖公園', nameEn: 'Dahu Park', routeIds: ['BR'], x: 885, y: 298 },
  { id: 'br-huzhou', code: 'BR21', nameZh: '葫洲', nameEn: 'Huzhou', routeIds: ['BR'], x: 920, y: 320 },
  { id: 'br-donghu', code: 'BR22', nameZh: '東湖', nameEn: 'Donghu', routeIds: ['BR'], x: 930, y: 355 },
  { id: 'br-nangang-software', code: 'BR23', nameZh: '南港軟體園區', nameEn: 'Nangang Software Park', routeIds: ['BR'], x: 950, y: 375 },
  { id: 'br-nangang-exhibition', code: 'BR24', nameZh: '南港展覽館', nameEn: 'Taipei Nangang Exhibition Center', routeIds: ['BL', 'BR'], x: 990, y: 395, terminal: true },

  // ===== Y 環狀線（Yellow） =====
  { id: 'y-dapinglin', code: 'Y07', nameZh: '大坪林', nameEn: 'Dapinglin', routeIds: ['G', 'Y'], x: 350, y: 668 },
  { id: 'y-shisizhang', code: 'Y08', nameZh: '十四張', nameEn: 'Shisizhang', routeIds: ['Y'], x: 360, y: 710 },
  { id: 'y-xiulangqiao', code: 'Y09', nameZh: '秀朗橋', nameEn: 'Xiulang Bridge', routeIds: ['Y'], x: 385, y: 750 },
  { id: 'y-jingping', code: 'Y10', nameZh: '景平', nameEn: 'Jingping', routeIds: ['Y'], x: 420, y: 775 },
  { id: 'y-jingan', code: 'Y11', nameZh: '景安', nameEn: 'Jingan', routeIds: ['O', 'Y'], x: 450, y: 745 },
  { id: 'y-zhonghe', code: 'Y12', nameZh: '中和', nameEn: 'Zhonghe', routeIds: ['Y'], x: 470, y: 700 },
  { id: 'y-qiaohe', code: 'Y13', nameZh: '橋和', nameEn: 'Qiaohe', routeIds: ['Y'], x: 475, y: 655 },
  { id: 'y-zhongyuan', code: 'Y14', nameZh: '中原', nameEn: 'Zhongyuan', routeIds: ['Y'], x: 460, y: 610 },
  { id: 'y-banxin', code: 'Y15', nameZh: '板新', nameEn: 'Banxin', routeIds: ['Y'], x: 420, y: 585 },
  { id: 'y-banqiao', code: 'Y16', nameZh: '板橋', nameEn: 'Banqiao', routeIds: ['BL', 'Y'], x: 345, y: 585 },
  { id: 'y-xinpu-minsheng', code: 'Y17', nameZh: '新埔民生', nameEn: 'Xinpu Minsheng', routeIds: ['Y'], x: 300, y: 565 },
  { id: 'y-touqianzhuang', code: 'Y18', nameZh: '頭前庄', nameEn: 'Touqianzhuang', routeIds: ['Y'], x: 255, y: 545 },
  { id: 'y-xingfu', code: 'Y19', nameZh: '幸福', nameEn: 'Xingfu', routeIds: ['Y'], x: 215, y: 525 },
  { id: 'y-xinbei-industrial', code: 'Y20', nameZh: '新北產業園區', nameEn: 'New Taipei Industrial Park', routeIds: ['Y'], x: 180, y: 505, terminal: true },
];

export const STATION_MAP: Map<string, Station> = new Map(
  STATIONS.map((s) => [s.id, s]),
);

export function getStation(id: string): Station | undefined {
  return STATION_MAP.get(id);
}




