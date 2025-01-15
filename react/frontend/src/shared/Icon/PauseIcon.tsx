import React from "react";

const PauseIcon: React.FC<React.ComponentProps<"svg">> = ({ ...props }) => {
  return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M96.5 47C96.5 72.0707 75.2931 92.5 49 92.5C22.7069 92.5 1.5 72.0707 1.5 47C1.5 21.9293 22.7069 1.5 49 1.5C75.2931 1.5 96.5 21.9293 96.5 47Z"
        stroke="currentColor" strokeWidth="4" />
      <rect x="36" y="28" width="8" height="44" fill="currentColor" />
      <rect x="56" y="28" width="8" height="44" fill="currentColor" />
    </svg>
  );
}

export default PauseIcon;
