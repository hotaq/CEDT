import React from 'react';
import Link from 'next/link';

interface TopMenuItemProps {
  title: string;
  pageRef: string;
}

const TopMenuItem = ({ title, pageRef }: TopMenuItemProps) => {
  return (
    <Link
      href={pageRef}
      className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors duration-200"
    >
      {title}
    </Link>
  );
};

export default TopMenuItem;
