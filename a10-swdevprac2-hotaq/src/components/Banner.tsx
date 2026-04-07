"use client";

import styles from './banner.module.css';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Banner() {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const { data: session, status } = useSession();

  const covers = [
    '/img/cover.jpg',
    '/img/cover2.jpg',
    '/img/cover3.jpg',
    '/img/cover4.jpg'
  ];

  const handleBannerClick = () => {
    setIndex((prevIndex) => (prevIndex + 1) % 4);
  };

  return (
    <section className={styles.banner} onClick={handleBannerClick}>
      <Image
        src={covers[index]}
        alt="Venue banner"
        fill
        className={styles.bannerImage}
      />
      {status === 'authenticated' && session?.user?.name ? (
        <p className="absolute right-5 top-5 z-20 inline-flex rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm">
          Welcome {session.user.name}
        </p>
      ) : null}
      <div className={styles.overlay}>
        <h1>where every event finds its venue</h1>
        <p>We provide exceptional venues for all your event needs, from weddings to corporate gatherings.</p>
      </div>

      <button
        className="absolute bottom-5 right-5 z-20 bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg shadow hover:bg-gray-100 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          router.push('/venue');
        }}
      >
        Select Venue
      </button>
    </section>
  );
}
