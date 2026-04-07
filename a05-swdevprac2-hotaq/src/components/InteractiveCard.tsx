"use client";

import { ReactNode, useState } from "react";

interface InteractiveCardProps {
  children: ReactNode;
}

const InteractiveCard = ({ children }: InteractiveCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardClassName = isHovered
    ? "w-full max-w-sm rounded-lg overflow-hidden shadow-2xl bg-neutral-200 transition-all duration-300"
    : "w-full max-w-sm rounded-lg overflow-hidden shadow-lg bg-white transition-all duration-300";

  return (
    <div
      className={cardClassName}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};

export default InteractiveCard;
