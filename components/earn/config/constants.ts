export const GAME_CONFIG = {
  WHEEL: {
    id: "WHEEL",
    name: "Thiên Vận Bàn",
    desc: "Vòng quay định mệnh, nghịch thiên cải mệnh.",
    cost: 500,
    icon: "☸️",
  },
  MINING: {
    id: "MINING",
    name: "Linh Mạch Cổ",
    desc: "Khai thác linh thạch từ lõi trái đất.",
    cost: 0,
    icon: "⛏️",
  },
  MEMORY: {
    id: "MEMORY",
    name: "Phù Chú Trận",
    desc: "Phá giải phong ấn trí nhớ.",
    cost: 2000,
    icon: "📜",
  },
  DICE: {
    id: "DICE",
    name: "Bát Quái Đổ",
    desc: "Cược lớn thắng lớn, nhất chín nhì bù.",
    cost: 1000,
    icon: "🎲",
  },
  BEASTS: {
    id: "BEASTS",
    name: "Ngự Thú Sư",
    desc: "Triệu hồi thần thú thượng cổ.",
    cost: 1500,
    icon: "🐉",
  },
  ALCHEMY: {
    id: "ALCHEMY",
    name: "Luyện Đan Sư",
    desc: "Canh hỏa hầu, luyện thần đan. Kỹ năng quyết định tất cả.",
    cost: 800,
    icon: "🔥",
  },
  PLINKO: {
    id: "PLINKO",
    name: "Thiên Thạch Trận",
    desc: "Thả vẫn thạch, cầu may mắn. Rơi trúng đâu, ăn chỗ đó.",
    cost: 2000,
    icon: "☄️",
  },
  CARD: {
    id: "CARD",
    name: "Huyết Nguyệt Bài",
    desc: "Cao hay Thấp? Đấu trí với định mệnh.",
    cost: 1200,
    icon: "🃏",
  },
};

export type GameMode = keyof typeof GAME_CONFIG | "LOBBY";
