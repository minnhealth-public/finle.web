import React, {ReactElement} from 'react'

type NavgationDropDownProps = {
  children: ReactElement[]|ReactElement,
  label: string|ReactElement
}

const NavigationDropDown: React.FC<NavgationDropDownProps> = ({children, label}) => {
    return (
        <div className="relative group lg:inline-block lg:mt-0">
            <span className="hover:text-teal-500 active:text-teal-500">{label}</span>
            <ul className="relative left-0 hidden group-hover:block">
              <li className='absolute pt-2 space-y-2'>
                {children}
              </li>
            </ul>
        </div>
    );
}

export default NavigationDropDown;
