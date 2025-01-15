
import React, { ReactNode } from 'react'


interface ToolTipProps extends React.ComponentProps<"div"> {
  helpText: string,
  children?: ReactNode
}

const ToolTip: React.FC<ToolTipProps> = ({ children, helpText, ...props }) => {

  return (
    <>
      <div  {...props} className="group relative w-full" >
        {children}
        <span
          className="
            group-hover:animate-reveal group-hover:block
            hidden absolute z-50 bg-white-1 p-2 rounded-lg
            text-sm text-black font-semibold
            left-0 right-0 w-full
            "
        >{helpText}</span>
      </div>
    </>
  );
}

export default ToolTip
