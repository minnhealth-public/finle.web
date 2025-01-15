import React, { ReactNode } from 'react';

interface PageSubtitleProps {
  children: ReactNode;
}

const PageSubtitle: React.FC<PageSubtitleProps> = ({ children, ...props }) => {
  return (
    <p {...props} className="font-bold basis-1/2 py-3 text-3xl">{children}</p>
  );
};

export default PageSubtitle;
