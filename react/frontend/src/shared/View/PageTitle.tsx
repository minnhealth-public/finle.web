import React, { ReactNode } from 'react';

interface PageTitleProps {
  children: ReactNode;
}

const PageTitle: React.FC<PageTitleProps> = ({ children, ...props }) => {
  return (
    <h1 {...props} className="mt-16 text-7xl text-header">{children}</h1>
  );
};

export default PageTitle;
