import React from "react";

const ListIcon: React.FC<React.ComponentProps<"svg">> = ({...props}) => {
    return (
      <svg {...props} width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g >
          <path
            d="M1 8H7C7.55 8 8 7.55 8 7V1C8 0.45 7.55 0 7 0H1C0.45 0 0 0.45 0 1V7C0 7.55 0.45 8 1 8ZM2 2H6V6H2V2ZM7 18C7.55 18 8 17.55 8 17V11C8 10.45 7.55 10 7 10H1C0.45 10 0 10.45 0 11V17C0 17.55 0.45 18 1 18H7ZM2 12H6V16H2V12ZM22 4C22 4.55 21.55 5 21 5H11C10.45 5 10 4.55 10 4C10 3.45 10.45 3 11 3H21C21.55 3 22 3.45 22 4ZM22 14C22 14.55 21.55 15 21 15H11C10.45 15 10 14.55 10 14C10 13.45 10.45 13 11 13H21C21.55 13 22 13.45 22 14Z"
            fill="currentColor"
          />
        </g>
     </svg>

    );
}

export default ListIcon;
