import React, { useState, ReactElement } from 'react';

interface CarouselProps {
  children: ReactElement[],
  className?: string
}

const Carousel: React.FC<CarouselProps> = ({ children, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slideStyle = {
    transform: `translateX(-${currentIndex * 100}%)`,
    transition: "transform 0.5s ease",
  };

  return (
    <div className={`w-full overflow-hidden ${className ? className : ""}`}>
      <div className="flex" style={slideStyle}>
        {children.map((child, index) => (
          <div className="w-full flex-shrink-0 overflow-hidden" key={index}>
            {child}
          </div>
        ))}
      </div>
      <div className="mt-4 relative w-full flex align-middle justify-center gap-2">
        {children.map((_, index) => {
          const active = index === currentIndex;
          return (
            <div
              className={`h-4 rounded-full ${active ? "bg-primary_alt w-4" : "bg-gray-300 cursor-pointer w-4"}`}
              onClick={() => setCurrentIndex(index)}
              key={index}
            />
          )
        })}
      </div>
    </div>
  );
};

export default Carousel;
