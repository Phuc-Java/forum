import styles from "../giang-sinh/page.module.css";
import FilmScanner from "./FilmScanner.client";

export default function PhimPage() {
  return (
    <>
      <header className={styles.sectionHeader}>
        <div className={styles.sectionHeaderLeft}>
          <div className={styles.sectionHeaderIcon}>🎬</div>
          <div>
            <div className={styles.sectionHeaderTitle}>Tiêu Đề</div>
            <div className={styles.sectionHeaderSubtitle}>
              Bộ sưu tập phim tuyển chọn
            </div>
          </div>
        </div>

        <div className={styles.sectionHeaderRight}>
          <div className={styles.sectionHeaderBadge}>12</div>
          <a href="#" className={styles.sectionHeaderCTA}>
            Xem tất cả
          </a>
        </div>
      </header>
      <main className={styles.page}>
        <div className={styles.cardsContainer}>
          {/* 1 */}
          <a href="#" target="_blank" rel="noreferrer" className={styles.card}>
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
              alt="Dark Rider character"
            />
          </a>

          {/* 2 */}
          <a href="#" target="_blank" rel="noreferrer" className={styles.card}>
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
              alt="Force Mage character"
            />
          </a>

          {/* 3 */}
          <a href="#" target="_blank" rel="noreferrer" className={styles.card}>
            <div className={styles.wrapper}>
              <img
                src="/film/fantasy2.jpg"
                className={styles.coverImage}
                alt="Cover 3"
              />
            </div>
            <div className={styles.cardTitleBox}>
              <span className={styles.cardTitle}>Chronos: Battle of Ages</span>
            </div>
            <img
              src="/film/fantasy2end.jpg"
              className={styles.character}
              alt="Character 3"
            />
          </a>

          {/* 4 */}
          <a href="#" target="_blank" rel="noreferrer" className={styles.card}>
            <div className={styles.wrapper}>
              <img
                src="/film/darkfantasy1.jpg"
                className={styles.coverImage}
                alt="Cover 4"
              />
            </div>
            <div className={styles.cardTitleBox}>
              <span className={styles.cardTitle}>The Time Rift</span>
            </div>
            <img
              src="/film/darkfantasy1end.jpg"
              className={styles.character}
              alt="Character 4"
            />
          </a>

          {/* 5 */}
          <a href="#" target="_blank" rel="noreferrer" className={styles.card}>
            <div className={styles.wrapper}>
              <img
                src="/film/fantasy3.jpg"
                className={styles.coverImage}
                alt="Cover 5"
              />
            </div>
            <div className={styles.cardTitleBox}>
              <span className={styles.cardTitle}>System Override</span>
            </div>
            <img
              src="/film/fantasy3end.jpg"
              className={styles.character}
              alt="Character 5"
            />
          </a>

          {/* 6 */}
          <a href="#" target="_blank" rel="noreferrer" className={styles.card}>
            <div className={styles.wrapper}>
              <img
                src="/film/fantasy4.jpg"
                className={styles.coverImage}
                alt="Cover 6"
              />
            </div>
            <div className={styles.cardTitleBox}>
              <span className={styles.cardTitle}>The Glitch Protocol</span>
            </div>
            <img
              src="/film/fantasy4end.jpg"
              className={styles.character}
              alt="Character 6"
            />
          </a>

          {/* 7 */}
          <a href="#" target="_blank" rel="noreferrer" className={styles.card}>
            <div className={styles.wrapper}>
              <img
                src="/film/fantasy5.jpg"
                className={styles.coverImage}
                alt="Cover 7"
              />
            </div>
            <div className={styles.cardTitleBox}>
              <span className={styles.cardTitle}>Legends of the Void</span>
            </div>
            <img
              src="/film/fantasy5end.jpg"
              className={styles.character}
              alt="Character 7"
            />
          </a>

          {/* 8 */}
          <a href="#" target="_blank" rel="noreferrer" className={styles.card}>
            <div className={styles.wrapper}>
              <img
                src="/film/fantasy6.jpg"
                className={styles.coverImage}
                alt="Cover 8"
              />
            </div>
            <div className={styles.cardTitleBox}>
              <span className={styles.cardTitle}>Shadows of War</span>
            </div>
            <img
              src="/film/fantasy6end.jpg"
              className={styles.character}
              alt="Character 8"
            />
          </a>
          {/* 8 */}
          <a href="#" target="_blank" rel="noreferrer" className={styles.card}>
            <div className={styles.wrapper}>
              <img
                src="/film/fantasy7.jpg"
                className={styles.coverImage}
                alt="Cover 8"
              />
            </div>
            <div className={styles.cardTitleBox}>
              <span className={styles.cardTitle}>Blood & Steel</span>
            </div>
            <img
              src="/film/fantasy7end.jpg"
              className={styles.character}
              alt="Character 8"
            />
          </a>
        </div>
      </main>
      <footer>
        <FilmScanner />
      </footer>
    </>
  );
}
