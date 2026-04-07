import React from 'react'
import Image from 'next/image';

interface CardProps {
  venueName: string;
  imgSrc: string;
}

const Card = ({ venueName, imgSrc }: CardProps) => {
  return (
    <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-white">
      {/* Image Section */}
      <div className="relative w-full h-48">
        <Image
          src={imgSrc}
          alt={venueName}
          fill
          className="object-cover"
        />
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-800">{venueName}</h3>
      </div>
    </div>
  )
}

export default Card