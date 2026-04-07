"use client";

import { useState } from "react";
import Rating from "@mui/material/Rating";
import Image from "next/image";
import Link from "next/link";

interface CardProps {
  vid: string;
  venueName: string;
  imgSrc: string;
  onRatingChange?: (venueName: string, rating: number | null) => void;
}

const Card = ({ vid, venueName, imgSrc, onRatingChange }: CardProps) => {
  const [rating, setRating] = useState<number | null>(null);
  const ratingLabel = `${venueName} Rating`;
  const showRating = typeof onRatingChange === "function";

  return (
    <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-white">
      <Link href={`/venue/${vid}`} className="block w-full">
        {/* Image Section */}
        <div className="relative w-full h-48">
          <Image
            src={imgSrc}
            alt={venueName}
            fill
            className="object-cover"
          />
        </div>

        {/* Content Section Header (Title inside Link) */}
        <div className="p-5 pb-0">
          <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors mb-4">{venueName}</h3>
        </div>
      </Link>
      
      {showRating ? (
        <div className="p-5 pt-0">
          <div className="flex flex-col gap-3">
            <Rating
              id={ratingLabel}
              name={ratingLabel}
              data-testid={ratingLabel}
              value={rating}
              onChange={(_, newValue) => {
                setRating(newValue);
                onRatingChange(venueName, newValue);
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Card;
