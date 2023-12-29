import React, {ReactNode} from 'react';

interface CommonProps {
    children: ReactNode,
    className?: string
}

export const H1: React.FC<CommonProps> = ({ children, className }) => {

    return <h1 className={`text-7xl text-blue-450 ${className} `}>{children}</h1>
}

export const Button: React.FC<CommonProps> = ({ children, className }) => {

    return <button className={`text-7xl text-blue-450 ${className} `}>{children}</button>
}
