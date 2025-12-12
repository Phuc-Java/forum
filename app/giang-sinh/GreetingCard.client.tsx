"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";

export default function GreetingCard() {
  const pool = [
    // 1. Dùng kiến thức Vật lý/Logic
    "Theo định luật bảo toàn tình cảm: Nỗi nhớ cậu không tự sinh ra và mất đi, nó chỉ chuyển từ ngày thường sang đêm Noel lạnh hơn gấp bội thôi.",

    // 2. Chơi chữ (Wordplay) - English/Vietnamese
    "Người ta chúc nhau 'Merry Christmas', còn tớ chỉ ước chúng mình có một 'Happy No-End' (không kết thúc).",

    // 3. Tư duy Kinh tế (Đầu tư)
    "Noel này tớ không xin quà, tớ chỉ xin cậu cho phép tớ 'đầu tư' thời gian vào cậu để sinh lời là một cuộc hẹn.",

    // 4. Hài hước & "Tỉnh bơ"
    "Tớ vừa check danh sách bé ngoan của ông già Noel. Lạ thật, không có tên cậu, nhưng tên cậu lại nằm chễm chệ trong 'wishlist' của tớ.",

    // 5. Thả thính kiểu IT/Dân kỹ thuật
    "Trái tim tớ có tường lửa (Firewall) rất xịn, nhưng chẳng hiểu sao vẫn để hacker như cậu xâm nhập và chiếm quyền admin đêm nay.",

    // 6. So sánh lầy lội
    "Cây thông chịu lạnh giỏi thật đấy, nhưng vẫn thua tớ về khoản 'chịu thương chịu khó' ngồi nhớ cậu cả buổi tối Giáng Sinh.",

    // 7. Địa lý & Định vị
    "Google Maps chỉ đường đến nhà thờ, nhưng lại không chỉ đường vào tim cậu, làm tớ lạc ở trạm 'tương tư' suốt mùa Noel này.",

    // 8. Chơi chữ táo bạo (Bold)
    "Giáng Sinh này tớ không muốn làm 'người tuyết' (snowman), tớ muốn làm 'your man' cơ.",

    // 9. Logic thực tế (Vừa đấm vừa xoa)
    "Nghiên cứu chỉ ra rằng đi chơi Noel một mình giảm 50% niềm vui. Vì lợi ích khoa học, tớ đề nghị chúng ta nên hợp tác đi chung.",

    // 10. Chốt hạ nhẹ nhàng
    "Đừng tìm quà dưới gốc cây nữa, vì món quà biết nhắn tin, biết quan tâm và đang nhớ cậu điên đảo chính là tớ đây.",
  ];
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const safeIndex =
    pool.length > 0 ? ((index % pool.length) + pool.length) % pool.length : 0;

  const changeTo = useCallback(
    (next: number) => {
      setIsFading(true);
      window.setTimeout(() => {
        setIndex(((next % pool.length) + pool.length) % pool.length);
        setIsFading(false);
        setOpen(true);
      }, 200);
    },
    [pool.length]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") changeTo(index + 1);
      if (e.key === "ArrowLeft") changeTo(index - 1);
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, changeTo]);

  return (
    <div className={styles.greetingWrap} aria-hidden={open ? "false" : "true"}>
      <div>
        <button
          id="greetingToggle"
          className={styles.greetingButton}
          onClick={() => setOpen((s) => !s)}
          aria-expanded={open}
          aria-controls="greetingCard"
          aria-label={open ? "Đóng lời chúc" : "Mở lời chúc"}
        >
          🎁
        </button>
      </div>

      <div
        id="greetingCard"
        className={`${styles.greetingCard} ${open ? styles.open : ""}`}
        role="dialog"
        aria-modal="false"
        aria-labelledby="greetingToggle"
      >
        <header className={styles.greetingHeader}>Lời chúc Giáng Sinh</header>
        <div className={styles.greetingBody}>
          <div
            className={`transition-all duration-300 ease-[cubic-bezier(.2,.9,.2,1)] transform ${
              isFading
                ? "opacity-0 -translate-y-2"
                : "opacity-100 translate-y-0"
            }`}
          >
            {pool[safeIndex]}
          </div>
        </div>
        <div className={styles.greetingActions}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              aria-label="Previous greeting"
              onClick={() => changeTo(index - 1)}
              className={styles.greetingNav}
            >
              ‹
            </button>
            <button
              aria-label="Next greeting"
              onClick={() => changeTo(index + 1)}
              className={styles.greetingNav}
            >
              ›
            </button>
          </div>
          <div style={{ marginLeft: 12 }} />
          <div className={styles.greetingCounter} aria-hidden>
            {safeIndex + 1}/{pool.length}
          </div>
          <div style={{ width: 12 }} />
          <button
            className={styles.greetingClose}
            onClick={() => setOpen(false)}
            aria-label="Đóng hộp lời chúc"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
