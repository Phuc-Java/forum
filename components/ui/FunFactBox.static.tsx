interface Props {
  facts?: string[];
  initialIndex?: number;
}

export default function FunFactBoxStatic({ facts, initialIndex }: Props) {
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

      <div className="min-h-[120px] sm:min-h-[140px] relative">
        <div className="absolute inset-0 p-3">
          <div className="h-full p-4 rounded-lg bg-background/30 border border-border/30 text-foreground/80 font-mono text-sm">
            <div className="whitespace-pre-wrap wrap-break-word pb-12">
              {pool[idx]}
            </div>
          </div>
        </div>

        <div className="absolute left-3 right-3 bottom-3 hidden sm:flex items-center justify-between">
          <div className="flex gap-2">
            <button
              disabled
              className="px-3 py-2 bg-background/20 border border-border rounded-lg text-xs font-mono text-foreground/40"
            >
              ‹ Trước
            </button>
            <button
              disabled
              className="px-3 py-2 bg-primary/20 border border-primary/50 rounded-lg text-xs font-mono text-foreground/40"
            >
              Kế Tiếp ›
            </button>
          </div>

          <div className="text-xs text-foreground/50 font-mono">
            {idx + 1}/{pool.length}
          </div>
        </div>
      </div>

      <div className="mt-3 sm:hidden flex items-center justify-between">
        <div className="flex gap-2">
          <button
            disabled
            className="px-3 py-2 bg-background/20 border border-border rounded-lg text-xs font-mono text-foreground/40"
          >
            ‹ Trước
          </button>
          <button
            disabled
            className="px-3 py-2 bg-primary/20 border border-primary/50 rounded-lg text-xs font-mono text-foreground/40"
          >
            Kế Tiếp ›
          </button>
        </div>

        <div className="text-xs text-foreground/50 font-mono">
          {idx + 1}/{pool.length}
        </div>
      </div>
    </div>
  );
}
