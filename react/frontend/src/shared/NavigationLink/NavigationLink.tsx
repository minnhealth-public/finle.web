import React from 'react'
import { Link, useLocation } from 'react-router-dom';

type NavigationProps = {
  href: string,
  label: string,
  id: string
}

const NavigationLink: React.FC<NavigationProps> = ({ href, label, id }) => {
  const location = useLocation();
  return (
    <Link
      id={id}
      to={href}
      className={`nav-link
            block lg:inline-block
            whitespace-nowrap
            hover:text-primary focus:text-primary
            ${location.pathname === href ? '!text-primary_alt' : ''}
            `}
    >
      {label}
    </Link>
  );
}

export default NavigationLink;
