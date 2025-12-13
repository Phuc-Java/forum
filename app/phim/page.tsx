"use client";

import styles from "./phim.module.css";
import FilmScanner from "./FilmScannerSimple.client";
import { useState } from "react";

export default function PhimPage() {
  const [activeFilter, setActiveFilter] = useState("Tất cả");

  return (
    <div className={styles.pageContainer}>
      {/* 1. HERO SECTION */}
      <header className={styles.heroSection}>
        <div className={styles.heroBackground}>
          <img
            src="/film/unnamed (1).jpg"
            className={styles.heroBgImage}
            alt="Hero BG"
          />
        </div>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>FEATURED / 2025</span>
          <h1 className={styles.heroTitle}>
            CHRONOS
            <br />
            <span
              style={{ color: "transparent", WebkitTextStroke: "2px #fff" }}
            >
              BATTLE OF AGES
            </span>
          </h1>
          <p className={styles.heroDesc}>
            Khi thời gian sụp đổ, một chiến binh Hacker phải xâm nhập vào lõi
            máy chủ quá khứ để viết lại mã nguồn tương lai. Siêu phẩm Cyberpunk
            hành động.
          </p>

          <div className={styles.heroActions}>
            <button className={styles.btnPlay}>▶ KHỞI CHẠY</button>
          </div>
        </div>
      </header>

      {/* 2. FILTER BAR */}
      <nav className={styles.filterBar}>
        {["Tất cả", "Cyberpunk", "Hacking", "Sci-Fi", "Kinh Dị"].map((cat) => (
          <div
            key={cat}
            className={`${styles.filterItem} ${
              activeFilter === cat ? styles.filterActive : ""
            }`}
            onClick={() => setActiveFilter(cat)}
          >
            {cat}
          </div>
        ))}
      </nav>

      {/* 3. MAIN CONTENT: Grid Phim */}
      <main className={styles.mainContent}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            DATABASE <span>//</span> PHIM ĐỀ CỬ
          </h2>
        </div>

        <div className={styles.cardsContainer}>
          {/* CARD 1 */}
          <a href="#" className={styles.card}>
            <div className={styles.wrapper}>
              <img
                src="https://ggayane.github.io/css-experiments/cards/dark_rider-cover.jpg"
                className={styles.coverImage}
                alt="Dark Rider cover"
              />
            </div>
            <div className={styles.cardTitleBox}>
              <span className={styles.cardTitle}>Dark Rider</span>
            </div>
            <img
              src="https://ggayane.github.io/css-experiments/cards/dark_rider-character.webp"
              className={styles.character}
              alt="Character"
            />
          </a>

          {/* CARD 2 */}
          <a href="#" className={styles.card}>
            <div className={styles.wrapper}>
              <img
                src="https://ggayane.github.io/css-experiments/cards/force_mage-cover.jpg"
                className={styles.coverImage}
                alt="Force Mage cover"
              />
            </div>
            <div className={styles.cardTitleBox}>
              <span className={styles.cardTitle}>Force Mage</span>
            </div>
            <img
              src="https://ggayane.github.io/css-experiments/cards/force_mage-character.webp"
              className={styles.character}
              alt="Character"
            />
          </a>

          {/* CARD 3 */}
          <a href="#" className={styles.card}>
            <div className={styles.wrapper}>
              <img
                src="/film/fantasy2.jpg"
                className={styles.coverImage}
                alt="Cover"
              />
            </div>
            <div className={styles.cardTitleBox}>
              <span className={styles.cardTitle}>Chronos</span>
            </div>
            <img
              src="/film/fantasy2end.jpg"
              className={styles.character}
              alt="Character"
            />
          </a>

          {/* CARD 4 */}
          <a href="#" className={styles.card}>
            <div className={styles.wrapper}>
              <img
                src="/film/darkfantasy1.jpg"
                className={styles.coverImage}
                alt="Cover"
              />
            </div>
            <div className={styles.cardTitleBox}>
              <span className={styles.cardTitle}>Time Rift</span>
            </div>
            <img
              src="/film/darkfantasy1end.jpg"
              className={styles.character}
              alt="Character"
            />
          </a>

          {/* CARD 5 */}
          <a href="#" className={styles.card}>
            <div className={styles.wrapper}>
              <img
                src="/film/fantasy3.jpg"
                className={styles.coverImage}
                alt="Cover"
              />
            </div>
            <div className={styles.cardTitleBox}>
              <span className={styles.cardTitle}>Override</span>
            </div>
            <img
              src="/film/fantasy3end.jpg"
              className={styles.character}
              alt="Character"
            />
          </a>

          {/* CARD 6 */}
          <a href="#" className={styles.card}>
            <div className={styles.wrapper}>
              <img
                src="/film/fantasy4.jpg"
                className={styles.coverImage}
                alt="Cover"
              />
            </div>
            <div className={styles.cardTitleBox}>
              <span className={styles.cardTitle}>Protocol</span>
            </div>
            <img
              src="/film/fantasy4end.jpg"
              className={styles.character}
              alt="Character"
            />
          </a>

          {/* CARD 7 */}
          <a href="#" className={styles.card}>
            <div className={styles.wrapper}>
              <img
                src="/film/fantasy5.jpg"
                className={styles.coverImage}
                alt="Cover"
              />
            </div>
            <div className={styles.cardTitleBox}>
              <span className={styles.cardTitle}>Void</span>
            </div>
            <img
              src="/film/fantasy5end.jpg"
              className={styles.character}
              alt="Character"
            />
          </a>

          {/* CARD 8 */}
          <a href="#" className={styles.card}>
            <div className={styles.wrapper}>
              <img
                src="/film/fantasy6.jpg"
                className={styles.coverImage}
                alt="Cover"
              />
            </div>
            <div className={styles.cardTitleBox}>
              <span className={styles.cardTitle}>Shadows</span>
            </div>
            <img
              src="/film/fantasy6end.jpg"
              className={styles.character}
              alt="Character"
            />
          </a>
        </div>
      </main>

      <footer className={styles.footerScanner}>
        <FilmScanner />
      </footer>
    </div>
  );
}
