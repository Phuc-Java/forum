import LockScreen from "@/components/events/LockScreen.client";

export const metadata = {
  title: "My Secret Universe",
  description: "A secret place for my crush.",
};

export default function Page() {
  return (
    <LockScreen>
      <div className="secret-content-wrapper">
        <h3 className="secret-title">Gửi người đặc biệt...</h3>
        <p className="secret-text">
          Có những điều không thể nói thành lời, chỉ có thể cất giữ trong những
          con số. Và khi em mở được nó, nghĩa là em đã bước vào thế giới của
          tôi.
        </p>
        <div className="secret-signature">- Nguyễn Tuấn Phúc -</div>

        <style>{`
          .secret-content-wrapper {
            text-align: center;
            max-width: 600px;
            margin: 0 auto;
            color: #fff;
          }
          .secret-title {
            font-family: 'Playfair Display', serif;
            font-size: 2rem;
            color: #19ffb0;
            margin-bottom: 1rem;
            text-shadow: 0 0 20px rgba(25, 255, 176, 0.4);
          }
          .secret-text {
            font-family: 'Inter', sans-serif;
            font-size: 1.1rem;
            line-height: 1.8;
            color: rgba(255, 255, 255, 0.8);
            font-style: italic;
          }
          .secret-signature {
            margin-top: 2rem;
            font-family: 'Share Tech Mono', monospace;
            opacity: 0.6;
            letter-spacing: 2px;
          }
        `}</style>
      </div>
    </LockScreen>
  );
}
