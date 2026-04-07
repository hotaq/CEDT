"use client";

import Card from "@/components/Card";
import { useReducer } from "react";

const venues = [
  {
    venueName: "The Bloom Pavilion",
    imgSrc: "/img/bloom.jpg",
  },
  {
    venueName: "Spark Space",
    imgSrc: "/img/sparkspace.jpg",
  },
  {
    venueName: "The Grand Table",
    imgSrc: "/img/grandtable.jpg",
  },
];

export default function CardPanel() {
  const ratingReducer = (
    state: Map<string, number>,
    action: { type: "SET_RATING"; venueName: string; rating: number } | { type: "REMOVE_RATING"; venueName: string }
  ) => {
    const newState = new Map(state);
    switch (action.type) {
      case "SET_RATING":
        newState.set(action.venueName, action.rating);
        return newState;
      case "REMOVE_RATING":
        newState.delete(action.venueName);
        return newState;
      default:
        return state;
    }
  };

  const [ratingMap, dispatchRating] = useReducer(
    ratingReducer,
    new Map([
      ["The Bloom Pavilion", 0],
      ["Spark Space", 0],
      ["The Grand Table", 0],
    ])
  );

  return (
    <div>
      <div className="mt-1 flex flex-row flex-wrap justify-center gap-16 px-16 py-12">
        {venues.map((venue) => (
          <Card
            key={venue.venueName}
            venueName={venue.venueName}
            imgSrc={venue.imgSrc}
            onRatingChange={(venueName, rating) => {
              if (rating !== null) {
                dispatchRating({ type: "SET_RATING", venueName, rating });
              }
            }}
          />
        ))}
      </div>
      <div className="w-full px-16 pb-12 flex flex-col items-center">
        <h3 className="text-xl text-center font-bold mb-4">Rating List:</h3>
        <div className="flex flex-col gap-2 w-full max-w-sm">
          {Array.from(ratingMap.entries()).map(([venueName, rating]) => (
            <div
              key={venueName}
              data-testid={venueName}
              onClick={() => dispatchRating({ type: "REMOVE_RATING", venueName })}
              className="text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              {venueName} Rating : {rating}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
