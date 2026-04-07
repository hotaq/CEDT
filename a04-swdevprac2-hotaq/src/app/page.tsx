import Image from "next/image";
import styles from "./page.module.css";
import Card from "@/components/Card";
import Banner from "@/components/Banner";


export default function Home() {
  return (
    <div className={styles.container}>

      <Banner />
      <div className="flex flex-row flex-wrap justify-center gap-16 px-16 py-12 mt-1">
        <Card venueName="The Bloom Pavilion" imgSrc="/img/bloom.jpg" />
        <Card venueName="Spark Space" imgSrc="/img/sparkspace.jpg" />
        <Card venueName="The Grand Table" imgSrc="/img/grandtable.jpg" />
      </div>
    </div>
  );
}
