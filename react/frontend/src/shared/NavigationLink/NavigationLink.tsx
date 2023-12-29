import React from 'react'
import { Link, useLocation } from 'react-router-dom';

type NavigationProps = {
    href: string,
    label: string
}

const NavigationLink: React.FC<NavigationProps> = ({href, label}) => {
    const location = useLocation();
    return (
    <Link
        to={href}
        className={`
            hover:text-teal-500
            active:text-teal-500
            block lg:inline-block
            whitespace-nowrap
            ${location.pathname === href ? 'text-teal-500' : ''}
            `}
        >
            {label}
    </Link>
    );
}

export default NavigationLink;
