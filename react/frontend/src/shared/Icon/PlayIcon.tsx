import React from "react";

const PlayIcon: React.FC<React.ComponentProps<"svg">> = ({ ...props }) => {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M96.5 47C96.5 72.0707 75.2931 92.5 49 92.5C22.7069 92.5 1.5 72.0707 1.5 47C1.5 21.9293 22.7069 1.5 49 1.5C75.2931 1.5 96.5 21.9293 96.5 47Z"
        stroke="currentColor" strokeWidth="4" />
      <path
        d="M68.2301 45.8333C68.8861 46.2188 68.8887 47.1664 68.2348 47.5551L36.2951 66.5425C35.6295 66.9381 34.786 66.4597 34.7839 65.6854L34.6809 27.8709C34.6788 27.0966 35.5197 26.614 36.1874 27.0063L68.2301 45.8333Z"
        fill="currentColor" />
    </svg>
  );
}

export default PlayIcon;
