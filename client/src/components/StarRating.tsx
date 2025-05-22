import React from 'react';

interface StarRatingProps {
  count: number;
  max?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ count, max = 3 }) => {
  return (
    <div className="flex">
      {Array.from({ length: max }).map((_, i) => (
        <i 
          key={i} 
          className={`ri-star-${i < count ? 'fill' : 'line'} ${
            i < count ? 'text-secondary' : 'text-gray-300'
          }`}
        ></i>
      ))}
    </div>
  );
};

export default StarRating;