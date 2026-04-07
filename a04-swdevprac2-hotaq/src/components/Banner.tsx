import styles from './banner.module.css'
import Image from 'next/image'

export default function Banner() {
  return (
    <section className={styles.banner}>
      <Image
        src="/images/party-crowd-banner-design.jpg"
        alt="Venue banner"
        fill
        className={styles.bannerImage}
      />
      <div className={styles.overlay}>
        <h1>where every event finds its venue</h1>
        <p>We provide exceptional venues for all your event needs, from weddings to corporate gatherings.</p>
      </div>
    </section>
  )
}