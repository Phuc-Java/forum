// @/data/tien-hiep-data.ts

export interface TienHiepCard {
  id: string;
  title: string;
  sect: string; // Tông môn (VD: Vân Lam Tông)
  realm: string; // Cảnh giới (VD: Đấu Tôn)
  element: "Hỏa" | "Lôi" | "Băng" | "Phong" | "Ám" | "Mộc"; // Hệ tu luyện
  coverImage: string;
  characterImage: string;
  description: string;
  powerLevel: number; // Chiến lực (1-100 vạn)
}

export const TIEN_HIEP_DATABASE: TienHiepCard[] = [
  {
    id: "pham-nhan",
    title: "Phàm Nhân Tu Tiên",
    sect: "Hoàng Phong Cốc",
    realm: "Đại Thừa Kỳ",
    element: "Mộc",
    coverImage: "/film/fantasy2.jpg",
    characterImage: "/film/fantasy2end.jpg",
    description:
      "Hàn Lập, từ một phàm nhân tư chất bình thường, dùng bình nhỏ thần bí bước lên đỉnh cao tiên giới.",
    powerLevel: 99,
  },
  {
    id: "dau-pha",
    title: "Đấu Phá Thương Khung",
    sect: "Vân Lam Tông",
    realm: "Đấu Đế",
    element: "Hỏa",
    coverImage: "/film/fantasy3.jpg",
    characterImage: "/film/fantasy3end.jpg",
    description:
      "Ba mươi năm hà đông, ba mươi năm hà tây, mạc khinh thiếu niên nghèo! Dị Hỏa Hằng Cổ.",
    powerLevel: 98,
  },
  {
    id: "tru-tien",
    title: "Tru Tiên",
    sect: "Thanh Vân Môn",
    realm: "Thái Thanh",
    element: "Lôi",
    coverImage: "/film/fantasy4.jpg",
    characterImage: "/film/fantasy4end.jpg",
    description:
      "Thiên địa bất nhân, dĩ vạn vật vi trô cẩu. Một thanh Tru Tiên Kiếm, trảm đứt tình duyên.",
    powerLevel: 95,
  },
  {
    id: "nhat-niem",
    title: "Nhất Niệm Vĩnh Hằng",
    sect: "Linh Khê Tông",
    realm: "Vĩnh Hằng",
    element: "Phong",
    coverImage: "/film/fantasy5.jpg",
    characterImage: "/film/fantasy5end.jpg",
    description:
      "Một niệm thành biển cả, một niệm hóa nương dâu. Bạch Tiểu Thuần trường sinh bất tử.",
    powerLevel: 92,
  },
  {
    id: "thien-nghich",
    title: "Tiên Nghịch",
    sect: "Hằng Nhạc Phái",
    realm: "Đạp Thiên",
    element: "Ám",
    coverImage: "/film/fantasy6.jpg",
    characterImage: "/film/fantasy6end.jpg",
    description:
      "Thuận thì là phàm, nghịch thì là tiên. Vương Lâm một đường nghịch thiên cải mệnh.",
    powerLevel: 96,
  },
  {
    id: "co-chan-nhan",
    title: "Cổ Chân Nhân",
    sect: "Cổ Nguyệt Sơn",
    realm: "Cửu Chuyển",
    element: "Băng",
    coverImage: "/film/darkfantasy1.jpg",
    characterImage: "/film/darkfantasy1end.jpg",
    description:
      "Người không vì mình, trời tru đất diệt. Phương Nguyên - Đại ma đầu vạn cổ.",
    powerLevel: 97,
  },
  {
    id: "linh-vu",
    title: "Linh Vũ Thiên Hạ",
    sect: "Phi Linh Môn",
    realm: "Hư Vô",
    element: "Lôi",
    coverImage: "/film/fantasy8.jpg",
    characterImage: "/film/fantasy8end.jpg",
    description: "Lục Thiếu Du, linh vũ song tu, bá chủ thiên hạ.",
    powerLevel: 90,
  },
  {
    id: "vu-dong",
    title: "Vũ Động Càn Khôn",
    sect: "Đạo Tông",
    realm: "Tổ Cảnh",
    element: "Hỏa",
    coverImage: "/film/fantasy7.jpg",
    characterImage: "/film/fantasy7end.jpg",
    description: "Lâm Động, nắm giữ Tổ Phù, chưởng quản thiên địa.",
    powerLevel: 93,
  },
];

// Tranh cuộn pháp bảo
export const SCROLL_PAINTINGS = [
  "/film scroll/unnamed.jpg",
  "/film scroll/unnamed (1).jpg",
  "/film scroll/unnamed (2).jpg",
  "/film scroll/unnamed (3).jpg",
  "/film scroll/unnamed (4).jpg",
  "/film scroll/unnamed (5).jpg",
  "/film scroll/unnamed (6).jpg",
  "/film scroll/unnamed (7).jpg",
  "/film scroll/unnamed (8).jpg",
  "/film scroll/unnamed (9).jpg",
  "/film scroll/unnamed (10).jpg",
  "/film scroll/unnamed (11).jpg",
  "/film scroll/unnamed (12).jpg",
  "/film scroll/unnamed (13).jpg",
];
