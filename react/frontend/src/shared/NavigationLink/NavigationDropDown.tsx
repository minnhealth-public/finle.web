import React, {ReactElement} from 'react'

type NavgationDropDownProps = {
  children: ReactElement[]|ReactElement,
  label: string|ReactElement
  right?: boolean
  id: string
}

const NavigationDropDown: React.FC<NavgationDropDownProps> = ({children, label, right, id}) => {
    return (
        <div id={id} className="z-20 relative group lg:inline-block lg:mt-0">
            <span className="nav-link">{label}</span>
            <div className="
              relative left-0 hidden
              group-hover:block group-hover:animate-reveal
            ">
              <div className={`bg-tan-100 p-4 rounded absolute ${right?"right-[-0.25em]":"left-[-0.25em]"} space-y-2 text-lg group-hover:shadow-lg`}>
                {children}
              </div>
            </div>
        </div>
    );
}

export default NavigationDropDown;
