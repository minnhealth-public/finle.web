import React from "react";

const GridIcon: React.FC<React.ComponentProps<"svg">> = ({...props}) => {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="22" height="18" viewBox="0 0 22 18" fill="none">
        <g>
          <path
            transform="translate(-15,-18)"
            d="M17 26H24C24.55 26 25 25.55 25 25V18C25 17.45 24.55 17 24 17H17C16.45 17 16 17.45 16 18V25C16 25.55 16.45 26 17 26ZM18 19H23V24H18V19ZM36 18C36 17.45 35.55 17 35 17H28C27.45 17 27 17.45 27 18V25C27 25.55 27.45 26 28 26H35C35.55 26 36 25.55 36 25V18ZM34 24H29V19H34V24ZM16 36C16 36.55 16.45 37 17 37H24C24.55 37 25 36.55 25 36V29C25 28.45 24.55 28 24 28H17C16.45 28 16 28.45 16 29V36ZM18 30H23V35H18V30ZM36 36V29C36 28.45 35.55 28 35 28H28C27.45 28 27 28.45 27 29V36C27 36.55 27.45 37 28 37H35C35.55 37 36 36.55 36 36ZM34 35H29V30H34V35Z"
            fill="currentColor"
          />
        </g>
      </svg>
    );
}

export default GridIcon;
