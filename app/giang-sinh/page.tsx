import styles from "./page.module.css";
import SnowCanvas from "./SnowCanvas.client";
import GreetingCard from "./GreetingCard.client";
export default function GiangSinhPage() {
  return (
    <main className={styles.page}>
      {/* Giáng sinh page keeps only the SnowCanvas effect */}
      <SnowCanvas />
      <GreetingCard />
    </main>
  );
}
