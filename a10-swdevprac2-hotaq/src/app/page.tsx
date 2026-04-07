import styles from "./page.module.css";
import Banner from "@/components/Banner";

export default function Home() {
  return (
    <div className={styles.container}>
      <Banner />
    </div>
  );
}
