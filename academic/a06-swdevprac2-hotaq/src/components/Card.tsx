"use client";

import { useState } from "react";
import Rating from "@mui/material/Rating";
import Image from "next/image";

interface CardProps {
  venueName: string;
  imgSrc: string;
  onRatingChange?: (venueName: string, rating: number | null) => void;
}

const Card = ({ venueName, imgSrc, onRatingChange }: CardProps) => {
  const [rating, setRating] = useState<number | null>(null);
  const ratingLabel = `${venueName} Rating`;

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
        <div className="mt-4 flex flex-col gap-3">
          <Rating
            id={ratingLabel}
            name={ratingLabel}
            data-testid={ratingLabel}
            value={rating}
            onChange={(_, newValue) => {
              setRating(newValue);
              if (onRatingChange) {
                onRatingChange(venueName, newValue);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Card;
