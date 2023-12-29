import React, { useState, ReactElement, PropsWithChildren }  from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle } from '@fortawesome/free-solid-svg-icons'

interface CarouselProps {
  children: ReactElement[],
  className?: string
}

const Carousel: React.FC<CarouselProps> = ({ children, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className={`w-full ${className?className:""}`}>
      {children.map((child, index) => {
          const active = index === currentIndex? "hidden": "flex";
          const classes = child.props.className + " " + active;
          return React.cloneElement(child, {className: classes, key: index})
      })}
      <div className="-bottom-4 relative w-full flex align-middle justify-center gap-2">
        {children.map((_, index) => {
            const active = index === currentIndex;
            return (
                <FontAwesomeIcon
                    className={`${active? "text-teal-500 w-4": "cursor-pointer w-2"}`}
                    onClick={() => setCurrentIndex(index)}
                    key={index}
                    icon={faCircle}
                />
            )
        })}
      </div>
    </div>
  );
};

export default Carousel;
