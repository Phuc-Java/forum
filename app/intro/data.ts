import { ReactNode } from "react";

// =============================================================================
// 1. ĐỊNH NGHĨA CẤU TRÚC (INTERFACES)
// =============================================================================

export interface ISealConfig {
  leftText: string; // Chữ chạy dọc bùa trái
  rightText: string; // Chữ chạy dọc bùa phải
  sealStamp: string; // Chữ trong con dấu đỏ
  warning: string; // Cảnh báo nguy hiểm
}

export interface IRole {
  id: string;
  name: string;
  level: number;
  color: string; // Mã màu đại diện (Hex)
  description: string; // Mô tả ngắn
  lore: string; // Cốt truyện dài (dùng cho Modal)
  privileges: string[]; // Danh sách đặc quyền
  iconPath: string; // SVG Path icon
}

export interface IZone {
  id: string;
  title: string;
  subTitle: string; // Tên tiếng Anh hoặc tên phụ
  description: string; // Mô tả hiển thị trên thẻ
  details: string; // Nội dung chi tiết khi mở khóa
  requirement: string; // Điều kiện (VD: Cần Phàm Nhân)
  isLocked: boolean; // Trạng thái khóa
  bgImage?: string; // Ảnh nền (nếu có)
  iconPath: string; // Icon đại diện
  talismanText: string; // Chữ trên lá bùa niêm phong khu vực này
}

export interface ISystemFeature {
  title: string;
  desc: string;
  techStack: string; // Công nghệ sử dụng (NextJS, Appwrite...)
}

// =============================================================================
// 2. KHO TÀNG DỮ LIỆU (DATABASE)
// =============================================================================

export const INTRO_DATA = {
  // --- THÔNG TIN CƠ BẢN ---
  meta: {
    title: "Xóm Nhà Lá",
    slogan: "Điễn Đàn Kết Tiếng Nhất Hành Tinh",
    concept: "Thượng Cổ Tông Môn",
    version: "Ver 5.0 - Hắc Ám Kỷ Nguyên",
  },

  // --- CẤU HÌNH PHONG ẤN (HERO GATE) ---
  seal: {
    leftText: "CẤM ĐỊA VÔ CỰC • SINH NHÂN CHỚ VÀO",
    rightText: "PHONG ẤN VẠN KIẾP • BẤT KHẢ XÂM PHẠM",
    sealStamp: "SẮC LỆNH",
    warning:
      "CẢNH BÁO: Khu vực này chứa linh khí cực mạnh (High Performance CSS). Kẻ yếu tim hoặc máy yếu có thể bị 'tẩu hỏa nhập ma' (Lag).",
  } as ISealConfig,

  // --- HỆ THỐNG CẤP BẬC (ROLE HIERARCHY) ---
  roles: [
    {
      id: "khach",
      name: "Khách",
      level: 0,
      color: "#a3a3a3", // Xám tro
      description: "Người trần mắt thịt, vô tình lạc bước vào tiên môn.",
      lore: "Là những kẻ lang thang bên ngoài sơn môn, chỉ có thể ngắm nhìn vẻ đẹp hào nhoáng của Tiên Phủ nhưng không thể chạm vào tinh hoa thực sự. Họ chưa khai mở linh căn, chưa thể tu luyện.",
      privileges: [
        "Xem trang chủ",
        "Ngắm cảnh",
        "Không được đụng vào hiện vật",
      ],
      iconPath:
        "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", // User icon
    },
    {
      id: "pham-nhan",
      name: "Phàm Nhân",
      level: 1,
      color: "#22c55e", // Lục bảo (Thiên nhiên)
      description: "Đệ tử ngoại môn, vừa bước chân vào con đường tu luyện.",
      lore: "Những người đã vượt qua khảo hạch nhập môn, được ban phát thẻ bài tông môn. Họ bắt đầu được tiếp cận Tàng Kinh Các để học hỏi những kiến thức sơ khai nhất.",
      privileges: [
        "Truy cập Tàng Kinh Các",
        "Nhận quà Tân Thủ",
        "Like bài viết",
      ],
      iconPath:
        "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", // Book icon
    },
    {
      id: "chi-cuong-gia",
      name: "Chí Cường Giả",
      level: 2,
      color: "#3b82f6", // Lam (Huyền bí)
      description: "Cao thủ võ lâm, nội công thâm hậu, danh trấn giang hồ.",
      lore: "Những kẻ đã tu luyện lâu năm, đạt đến cảnh giới cao thâm. Họ được phép tiến vào Trân Tàng Các để chiêm ngưỡng những bảo vật quý giá (Source Code) và đàm đạo cùng các bậc tiền bối tại Cáo Tri.",
      privileges: [
        "Vào Trân Tàng Các",
        "Đăng bài thảo luận",
        "Chat với AI Đấng Toàn Năng",
      ],
      iconPath: "M13 10V3L4 14h7v7l9-11h-7z", // Lightning icon
    },
    {
      id: "thanh-nhan",
      name: "Thánh Nhân",
      level: 3,
      color: "#a855f7", // Tím (Hoàng gia/Thần thánh)
      description: "Đại năng chuyển thế, pháp lực vô biên, hô mưa gọi gió.",
      lore: "Những bậc kỳ tài hiếm có, một lời nói ra là chân lý. Họ nắm giữ quyền năng thay đổi thực tại, quản lý tài nguyên của tông môn và được chúng sinh kính ngưỡng.",
      privileges: [
        "Đăng bài vào Bảo Khố",
        "Ghim bài viết",
        "Quản lý thành viên",
      ],
      iconPath:
        "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z", // Star icon
    },
    {
      id: "chi-ton",
      name: "Chí Tôn Nhân Tộc",
      level: 4,
      color: "#eab308", // Vàng kim (Độc tôn)
      description: "Chủ nhân tối cao của Tông Môn, nắm giữ sinh mệnh vạn vật.",
      lore: "Đấng sáng thế, người viết nên những dòng code đầu tiên tạo ra thế giới này. Mọi quy tắc, luật lệ đều do người định đoạt. Quyền lực là tuyệt đối.",
      privileges: [
        "Toàn quyền Admin",
        "Tạo nội dung đặc quyền",
        "Thay đổi luật trời",
      ],
      iconPath:
        "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", // Crown icon (customized)
    },
  ] as IRole[],

  // --- CÁC KHU VỰC CHỨC NĂNG (ZONES) ---
  zones: [
    {
      id: "van-tuong-dai",
      title: "Vạn Tượng Đài",
      subTitle: "Phim Ảnh • Movies",
      description:
        "Gương soi vạn giới. Demo giao diện web phim phong cách tu tiên.",
      details:
        "Trải nghiệm xem phim (UI Demo) với giao diện đậm chất cổ trang huyền huyễn.",
      requirement: "Tự Do",
      isLocked: false,
      talismanText: "HUYỄN ẢNH",
      iconPath:
        "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", // Icon Camera/Video
    },
    {
      id: "ho-so",
      title: "Hồ Sơ Đạo Hữu",
      subTitle: "Profile • Settings",
      description:
        "Thông tin bản mệnh, chỉnh sửa avatar và quản lý tài khoản cá nhân.",
      details:
        "Xem thông tin tu vi, thay đổi diện mạo (Avatar), cập nhật tiểu sử.",
      requirement: "Đăng Nhập",
      isLocked: false,
      talismanText: "BẢN MỆNH",
      iconPath: "M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z", // Icon User Profile
    },
    {
      id: "quan-tri",
      title: "Thiên Đình",
      subTitle: "Quản Trị • Admin",
      description:
        "Khu vực tối cao dành cho Chí Tôn và Thánh Nhân quản lý tông môn.",
      details:
        "Quản lý bài viết Bảo Khố, kiểm duyệt Cáo Tri, trừng phạt kẻ phạm quy.",
      requirement: "Admin",
      isLocked: true,
      talismanText: "QUYỀN LỰC",
      iconPath:
        "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", // Icon Bánh răng/Cài đặt
    },
    {
      id: "tien-phu",
      title: "Tiên Phủ",
      subTitle: "Trang Chủ • Homepage",
      description:
        "Cổng chính tông môn. Nơi tiếp đón, nhận quà tân thủ và chiêm ngưỡng Linh Vật trấn môn.",
      details:
        "Giao diện 3D tương tác với Robot hộ pháp. Tại đây có thể kích hoạt linh thạch (tiền tệ) và xem thông báo mới nhất từ Thiên Đình.",
      requirement: "Tự Do",
      isLocked: false,
      talismanText: "NHẬP MÔN",
      iconPath:
        "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      id: "tang-kinh-cac",
      title: "Tàng Kinh Các",
      subTitle: "Thư Viện • Library",
      description:
        "Nơi lưu giữ vạn quyển sách quý. Chỉ đệ tử đã nhập môn (Phàm Nhân) mới được bước vào.",
      details:
        "Chứa hàng ngàn bài viết về thuật toán, bí kíp code dạo, và các giáo trình tu tiên (học lập trình). Hệ thống phân loại ngũ hành tương sinh tương khắc.",
      requirement: "Yêu cầu: Phàm Nhân",
      isLocked: true,
      talismanText: "TRI THỨC",
      iconPath:
        "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    },
    {
      id: "tran-tang-cac",
      title: "Trân Tàng Các",
      subTitle: "Kho Báu • Treasure",
      description:
        "Kho tàng bí mật chứa những đoạn mã nguồn (Source Code) 3D thất truyền.",
      details:
        "Nơi chia sẻ các project mẫu, UI component cực phẩm. Chỉ những kẻ mạnh (Chí Cường Giả) mới đủ bản lĩnh chịu đựng áp lực linh khí nơi đây.",
      requirement: "Yêu cầu: Chí Cường Giả",
      isLocked: true,
      talismanText: "BẢO VẬT",
      iconPath:
        "M20 7h-9.586L8.707 5.293A1 1 0 008 5H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z",
    },
    {
      id: "dang-toan-nang",
      title: "Đấng Toàn Năng",
      subTitle: "AI Chatbot • Oracle",
      description:
        "Trò chuyện trực tiếp với đại năng AI. Hỏi gì đáp nấy, thông tuệ thiên địa.",
      details:
        "Sử dụng mô hình ngôn ngữ tiên tiến nhất, được huấn luyện bằng hàng vạn cuốn sách trong Tàng Kinh Các. Phong cách trả lời đậm chất tu tiên.",
      requirement: "Yêu cầu: Chí Cường Giả",
      isLocked: true,
      talismanText: "THẦN THÔNG",
      iconPath:
        "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    },
    {
      id: "thien-co-lau",
      title: "Thiên Cơ Lâu",
      subTitle: "Giải Trí • Mini Games",
      description:
        "Sòng bạc nhân phẩm. Nơi các con bạc khát nước tìm kiếm vận may đổi đời.",
      details:
        "Tham gia các trò chơi dân gian, quay thưởng, lật thẻ bài để kiếm Linh Thạch. Cẩn thận kẻo tán gia bại sản.",
      requirement: "Tự Do",
      isLocked: false,
      talismanText: "VẬN MỆNH",
      iconPath:
        "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      id: "dong-chi-hoi",
      title: "Đông Chí Hội",
      subTitle: "Sự Kiện • Event",
      description:
        "Lễ hội mùa đông đặc biệt. Chiêm ngưỡng cây thông Noel 3D huyền ảo.",
      details:
        "Một không gian 3D riêng biệt với hiệu ứng tuyết rơi, nhạc nền Giáng Sinh remix phong cách cổ trang. Tương tác để nhận quà giới hạn.",
      requirement: "Sự Kiện Giới Hạn",
      isLocked: false,
      talismanText: "ĐÔNG CHÍ",
      iconPath: "M12 2L2 22h20L12 2zm0 4l6.5 13H5.5L12 6z", // Simple tree shape
    },
    // --- NEW: Linh Thông Các (Hub: forum / chat / livestream / calls) ---
    {
      id: "linh-thong-cac",
      title: "Linh Thông Các",
      subTitle: "Hub • Forum · Chat · Livestream",
      description:
        "Trung tâm giao tiếp tông môn: forum, phòng chat, livestream và phòng họp video/audio — nơi kết nối đạo hữu.",
      details:
        "Linh Thông Các là hub giao tiếp: đăng bài thảo luận, tham gia phòng chat, mở livestream, hoặc tổ chức họp video/audio. Hỗ trợ quyền tạo phòng, mời người, và tương tác thời gian thực.",
      requirement: "Tự Do",
      isLocked: false,
      talismanText: "THÔNG HỘI",
      iconPath: "M4 6h16v12H4z M8 10h8 M8 14h5",
    },
    // --- NEW: Linh Âm Đài (Tu Tiên style) ---
    {
      id: "linh-am-dai",
      title: "Linh Âm Đài",
      subTitle: "Âm Vũ • Music Shrine (Tu Tiên)",
      description:
        "Sân khấu âm cổ, nơi vang vọng linh âm cổ xưa. Ghi chú: phong cách tu tiên trong từng giai điệu.",
      details:
        "Nghe thử những khúc ca linh âm, kết hợp hiệu ứng âm thanh huyền ảo giúp tăng cảm hứng tu luyện.",
      requirement: "Tự Do",
      isLocked: false,
      talismanText: "LINH ÂM",
      iconPath: "M9 19V6l12-2v13",
    },
    // --- NEW: Chill with me (Tu Tiên lounge) ---
    {
      id: "chill-with-me",
      title: "Chill with me",
      subTitle: "Thư Giãn • Chill (Kiểu Tu Tiên)",
      description:
        "Góc thư giãn của tông môn, pha trộn nhạc chill và không khí tu tiên — dành cho kẻ mỏi mệt sau khi tu luyện.",
      details:
        "Một không gian nhẹ nhàng để ngồi thiền, nghe nhạc và trò chuyện. Ghi chú: phong cách trang trí và nội dung mang hơi hướng tu tiên.",
      requirement: "Tự Do",
      isLocked: false,
      talismanText: "THƯ GIÃN",
      iconPath: "M3 10h18v4H3v-4z",
    },
    {
      id: "my-nhan-cac",
      title: "Mỹ Nhân Các",
      subTitle: "Triển Lãm • Gallery",
      description: "Nơi trưng bày các tuyệt sắc giai nhân (Card 3D Anime).",
      details:
        "Bộ sưu tập hình ảnh Waifu chất lượng cao với hiệu ứng chuyển động Live2D/3D. Rất bổ mắt, giúp tăng tốc độ hồi phục mana.",
      requirement: "Tự Do",
      isLocked: false,
      talismanText: "TUYỆT SẮC",
      iconPath:
        "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    },
    {
      id: "chung-tu",
      title: "Chúng Tu",
      subTitle: "Thành Viên • Members",
      description:
        "Danh sách đạo hữu trong tông môn. Xem cấp bậc, tu vi và xếp hạng vinh danh.",
      details:
        "Nơi vinh danh các bậc đại năng. Ai là Thánh Nhân, ai là Chí Tôn đều được ghi danh tại đây.",
      requirement: "Tự Do",
      isLocked: false,
      talismanText: "ĐỒNG ĐẠO",
      iconPath:
        "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", // Icon Group Users
    },
    {
      id: "bao-kho",
      title: "Bảo Khố",
      subTitle: "Tài Nguyên • Resources",
      description:
        "Kho tàng kiến thức đồ sộ chia làm 5 hệ. Nơi chia sẻ bài viết, bí kíp tu luyện.",
      details:
        "Chứa đựng 5 loại bài viết khác nhau. Phân quyền nghiêm ngặt, chỉ bậc Thánh Nhân mới được phép truyền thụ võ công tại đây.",
      requirement: "Tự Do (Xem)",
      isLocked: false,
      talismanText: "BÍ TỊCH",
      iconPath:
        "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", // Icon Rương/Hòm
    },
    {
      id: "cao-tri",
      title: "Cáo Tri",
      subTitle: "Góp Ý • Feedback",
      description:
        "Nơi nghị sự đường, đăng bài thảo luận và đóng góp ý kiến xây dựng tông môn.",
      details:
        "Chỉ người trong tông môn mới được phép bình luận. Chí Cường Giả mới được phép khởi xướng thảo luận.",
      requirement: "Tự Do (Xem)",
      isLocked: false,
      talismanText: "NGHỊ SỰ",
      iconPath:
        "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z", // Icon Loa thông báo
    },
    {
      id: "my-crush",
      title: "My Crush",
      subTitle: "Tâm Ma • Secret",
      description:
        "Vùng đất cấm kỵ, nơi cất giấu hình bóng người thương. Cần chìa khóa mật.",
      details: "Khu vực riêng tư tuyệt đối. Không phận sự miễn vào.",
      requirement: "Cần Khóa",
      isLocked: true, // Để True cho nó hiện ổ khóa đẹp
      talismanText: "TƯƠNG TƯ",
      iconPath:
        "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", // Icon Ổ khóa
    },
  ] as IZone[],

  // --- HỆ THỐNG CÔNG NGHỆ (TECH STACK) ---
  systems: [
    {
      title: "Hộ Pháp Đại Trận",
      desc: "Hệ thống bảo mật tuyệt đối, ngăn chặn mọi tà ma ngoại đạo (Hacker).",
      techStack: "Appwrite Auth & Security Rules",
    },
    {
      title: "Linh Thạch Lưu Thông",
      desc: "Hệ thống tiền tệ ảo, dùng để giao dịch, mua vật phẩm và chơi game.",
      techStack: "Database Transaction & Realtime Update",
    },
    {
      title: "Vạn Lý Truyền Âm",
      desc: "Hệ thống thông báo thời gian thực. Tin tức lan truyền trong tích tắc.",
      techStack: "Appwrite Realtime & WebSockets",
    },
    {
      title: "Hư Không Tàng Giới",
      desc: "Kho lưu trữ dữ liệu vô hạn, tốc độ truy xuất ánh sáng.",
      techStack: "Appwrite Storage & CDN",
    },
  ] as ISystemFeature[],

  // --- FOOTER QUOTES ---
  footer: {
    quote: "Vạn pháp giai không, duy hữu Code là chân lý.",
    copyright: "© 2026 Nguyễn Tuấn Phúc • Xóm Nhà Lá Tông Môn",
    contact: "anhdaptroai2007@gmail.com",
  },
};
