import React, { } from 'react';

interface SpinnerProps { }

const Spinner: React.FC<SpinnerProps> = () => {
  return (
    <div className="relative overflow-visible backdrop:opacity-70 backdrop:bg-black bg-transparent">
      <div className="fixed flex items-center justify-center left-1/2 top-1/2 -translate-x-1/2
      ">
        <div className='loader' />
      </div>
    </div>
  )
};

export default Spinner;
