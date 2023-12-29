import React, { ReactNode } from 'react';


interface QuoteProps {
    children: ReactNode,
}

const Quote: React.FC<QuoteProps> = ({children}) => {

    return (
        <div className="rounded-md bg-gray-200 px-7 py-5">
            {children}
        </div>
    )
}

export default Quote;
