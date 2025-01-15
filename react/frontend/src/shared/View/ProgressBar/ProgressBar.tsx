import React, { useState, useEffect } from 'react';

interface ProgressBarProps {
  value: number; // Value between 0 and range
  range: number; // how high it can go
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, range }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Ensure the progress value is within the valid range (0 to range)
    let percentage = value / range * 100
    if (value <= 0) {
      percentage = 0;
    } else if (value >= range) {
      percentage = 100;
    }
    setProgress(percentage);
  }, [value]);


  return (
    <div className="relative pt-1">
      <div className="flex">
        <div className="flex items-center w-full ">
          <div className="flex basis-1/2 relative rounded-md shadow-sm shadow-gray-400">
            <div
              className={`${progress === 0 ? "opacity-0" : ""} z-50 top-0 h-5 bg-primary rounded-lg border-r-2 border-[#425563]`}
              style={{ width: `${progress}%` }}
            ></div>
            <div
              className={`absolute z-10 w-full h-5 bg-gray-300 rounded-md`}
            ></div>
          </div>
          <p className="font-semibold text-sm pl-4">{progress}% Complete</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
