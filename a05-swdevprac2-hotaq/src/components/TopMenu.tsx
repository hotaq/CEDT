import React from 'react';
import Image from 'next/image';
import TopMenuItem from './TopMenuItem';

const TopMenu = () => {
  return (
    <nav className="flex items-center justify-end px-8 py-3 bg-white shadow-sm border-b border-gray-100">
      <div className="flex items-center gap-6">
        <TopMenuItem title="Booking" pageRef="/booking" />
        <Image
          src="/img/logo.png"
          alt="Venue Explorer Logo"
          width={40}
          height={40}
          className="object-contain"
        />
      </div>
    </nav>
  );
};

export default TopMenu;
