import Image from "next/image";

import InteractiveCard from "./InteractiveCard";

interface CardProps {
  venueName: string;
  imgSrc: string;
}

const Card = ({ venueName, imgSrc }: CardProps) => {
  return (
    <InteractiveCard>
      <div className="relative h-48 w-full">
        <Image src={imgSrc} alt={venueName} fill className="object-cover" />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-800">{venueName}</h3>
      </div>
    </InteractiveCard>
  );
};

export default Card;
