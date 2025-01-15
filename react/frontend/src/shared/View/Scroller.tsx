import React, { useState } from 'react';
import { ArrowDownCircle } from '../Icon';

interface ScrollerProps {
  ids: string[]
}

const Scroller: React.FC<ScrollerProps> = ({ ids }) => {
  const [currentIndex, setCurrentIndex] = useState(-1);

  const scrollToNextId = () => {
    const nextIndex = (currentIndex + 1) % ids.length;
    const nextId = ids[nextIndex];
    const element = document.getElementById(nextId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setCurrentIndex(nextIndex);
    }
  };

  return (
    <div className="fixed top-[50%] right-0">
      <button
        aria-label="scroll to next section"
        className="fill-white-1 hover:bg-primary_alt bg-primary py-2 px-4 rounded w-20"
        onClick={scrollToNextId}
      >
        <ArrowDownCircle />
      </button>
    </div>
  );
};

export default Scroller;
