import styles from "./page.module.css";
import LazySnow from "@/components/LazySnow.client";
import LazyGreeting from "@/components/LazyGreeting.client";

export default function GiangSinhPage() {
  return (
    <main className={styles.page}>
      {/* Giáng sinh page keeps only the SnowCanvas effect — lazy-loaded when visible */}
      <LazySnow placeholder={null} />
      <LazyGreeting placeholder={null} />
    </main>
  );
}
