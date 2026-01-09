export const GAME_CONFIG = {
  WHEEL: {
    id: "WHEEL",
    name: "Thiên Vận Bàn",
    desc: "Vòng quay định mệnh, nghịch thiên cải mệnh.",
    cost: 500,
    icon: "☸️",
  },
  DIVINE_FORGE: {
    id: "DIVINE_FORGE",
    name: "Thần Binh Luyện Đúc",
    desc: "Rèn thần binh với shader effects và fluid simulation. Đốt cháy GPU của bạn.",
    cost: 25000,
    icon: "⚒️",
    isDevelopment: true, // Lý do 3: Đang tối ưu shader
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
  DRAGON_ABYSS: {
    id: "DRAGON_ABYSS",
    name: "Long Uyên Cực Địa",
    desc: "Thâm sâu vực thẳm với particle system 10,000+ hạt. Yêu cầu GPU mạnh.",
    cost: 15000,
    icon: "🐲",
    isDevelopment: true, // Lý do 3: Đang phát triển
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
  IMMORTAL_TOWER: {
    id: "IMMORTAL_TOWER",
    name: "Vạn Tầng Tiên Tháp",
    desc: "Leo từng tầng tháp với physics engine phức tạp. Render thời gian thực trên GPU.",
    cost: 10000,
    icon: "🗼",
    needsServer: true, // Lý do 2: Cần server xử lý logic
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
  PRIMORDIAL_CHAOS: {
    id: "PRIMORDIAL_CHAOS",
    name: "Hồng Hoang Tranh Bá",
    desc: "Hồi quy thời kỳ Hồng Hoang, tranh đoạt bá quyền. MMORPG server đám mây.",
    cost: 30000,
    icon: "🌋",
    needsServer: true, // Cần server cluster xử lý đồng thời 1000 người
  },
  CARD: {
    id: "CARD",
    name: "Huyết Nguyệt Bài",
    desc: "Cao hay Thấp? Đấu trí với định mệnh.",
    cost: 1200,
    icon: "🃏",
  },
  BLOOD_MOON_TRIAL: {
    id: "BLOOD_MOON_TRIAL",
    name: "Huyết Nguyệt Ma Luyện",
    desc: "Vượt qua 81 kiếp nạn dưới ánh trăng máu. Physics & lighting engine cực đỉnh.",
    cost: 22222,
    icon: "🩸",
    isDevelopment: true, // Đang optimize blood shader
  },
  HEAVEN_DEMON_WAR: {
    id: "HEAVEN_DEMON_WAR",
    name: "Thiên Ma Đại Chiến",
    desc: "Thiên thần vs Ác ma - Trận chiến quyết định vận mệnh vũ trụ. Ray-tracing realtime.",
    cost: 18888,
    icon: "⚔️",
    isLocked: true, // Chưa đủ tu vi
  },
  ASCENSION: {
    id: "ASCENSION",
    name: "Phi Thăng Độ Kiếp",
    desc: "Hấp thụ linh khí, thăng thiên càng cao thưởng càng lớn. Dừng trước khi sét đánh!",
    cost: 1000,
    icon: "🌩️",
  },
  CHAOS_BATTLEFIELD: {
    id: "CHAOS_BATTLEFIELD",
    name: "Hỗn Độn Chiến Trường",
    desc: "PvP realtime 100 người. Server AI tính toán chiến thuật bằng neural network.",
    cost: 20000,
    icon: "💀",
    needsServer: true, // Lý do 2: Cần server AI
  },
  ELEMENTAL: {
    id: "ELEMENTAL",
    name: "Ngũ Hành Trận",
    desc: "Kim Mộc Thủy Hỏa Thổ. Dùng trí tuệ khắc chế tâm ma.",
    cost: 500,
    icon: "☯️",
  },

  // === 5 GAME GIẢ - TỐI ƯU GPU & SERVER ===
  VOID_REALM: {
    id: "VOID_REALM",
    name: "Hư Không Giới Vực",
    desc: "Xuyên qua hư không, chinh phục vạn giới. Đồ họa 3D thời gian thực với WebGL.",
    cost: 8888,
    icon: "🌌",
    isLocked: true, // Lý do 1: Chưa đủ quyền hạn
  },
  // === 3 GAME THÊM - NGẦU BÁ CHÁY ===
};

export type GameMode = keyof typeof GAME_CONFIG | "LOBBY";
