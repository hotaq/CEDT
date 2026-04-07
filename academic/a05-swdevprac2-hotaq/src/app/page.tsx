import styles from "./page.module.css";
import Card from "@/components/Card";
import Banner from "@/components/Banner";

export default function Home() {
  return (
    <div className={styles.container}>
      <Banner />
      <section className={styles.cardSection}>
        <Card venueName="The Bloom Pavilion" imgSrc="/img/bloom.jpg" />
        <Card venueName="Spark Space" imgSrc="/img/sparkspace.jpg" />
        <Card venueName="The Grand Table" imgSrc="/img/grandtable.jpg" />
      </section>
    </div>
  );
}
