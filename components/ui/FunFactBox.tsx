// Import the client-only robot component directly. Server components can
// include client components by importing them; avoid `next/dynamic` with
// `ssr:false` inside server components to prevent build errors.
import RememberallRobot from "@/components/ui/RememberallRobot.client";
import FunFactBoxClient from "@/components/ui/FunFactBox.client";

interface FunFactBoxProps {
  facts?: string[];
  /** Optional index chosen server-side to deterministically pick a fact */
  initialIndex?: number;
}

export default function FunFactBox({ facts, initialIndex }: FunFactBoxProps) {
  const defaultFacts = [
    "Người yêu cũ giống như bug, fix xong vẫn để lại di chứng đau đớn.",
    "Đừng click lung tung, Admin đang nhìn trộm webcam của bạn đấy 👀.",
    "Code chạy mượt là do tổ độ, còn bug là tính năng ẩn của vũ trụ.",
    "Bạn không xấu, bạn chỉ có vẻ đẹp tiềm ẩn... mà càng tìm nó càng ẩn.",
    "Tiền không mua được hạnh phúc, nhưng nằm khóc trên Mercedes vẫn êm hơn xe đạp.",
    "Cuộc đời là bể khổ, qua được bể khổ là... qua đời.",
    "Mật khẩu an toàn nhất là mật khẩu chính bạn cũng không nhớ nổi.",
    "Đừng cãi nhau với người ngu, họ sẽ kéo bạn xuống trình độ đó và thắng bằng kinh nghiệm.",
    "Tương lai khóc hay cười phụ thuộc vào độ lười của quá khứ (và độ lag của Wifi).",
    "Trai tốt thì nghèo, trai giàu thì đểu, còn trai IT thì... đau lưng.",
  ];

  const pool = facts && facts.length > 0 ? facts : defaultFacts;

  // Use an index provided by the server if present; otherwise default to 0.
  const idx =
    typeof initialIndex === "number"
      ? ((initialIndex % pool.length) + pool.length) % pool.length
      : 0;

  return (
    <div className="w-full md:w-96 p-4 rounded-2xl bg-surface/40 backdrop-blur-md border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold font-mono text-foreground flex items-center gap-2">
          <span className="text-2xl">🎭</span>
          Chuyện Vui
        </h3>
      </div>

      {/* Interactive client component handles the text + buttons with smooth transitions */}
      <FunFactBoxClient facts={pool} initialIndex={idx} />

      <div className="mt-6">
        {/* Client-side 3D robot placed under the fact box. Hidden on small screens to save bandwidth and layout space. */}
        <div className="w-full hidden md:block">
          <div className="h-80 w-full transform transition-transform duration-300 hover:scale-105 hover:shadow-lg rounded-lg overflow-hidden">
            <RememberallRobot />
          </div>
        </div>
      </div>
    </div>
  );
}
