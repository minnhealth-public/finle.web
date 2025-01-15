import React from "react";

const NoteArrow: React.FC<React.ComponentProps<"svg">> = () => {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M56 28C56 43.464 43.464 56 28 56C12.536 56 0 43.464 0 28C0 12.536 12.536 0 28 0C43.464 0 56 12.536 56 28Z" fill="currentColor"/>
      <path d="M17.5075 41.312C16.6294 40.3355 16.8968 38.8362 18.3005 36.8531L21.0109 33.0162C22.834 30.4353 23.0983 25.9133 21.5882 23.1461L19.3397 19.0328C18.2003 16.9476 18.0909 15.4423 19.0116 14.5619C19.9322 13.6816 21.4515 13.8378 23.5176 15.0306L41.1652 25.2133C43.28 26.4301 44.2978 28.1938 43.9211 29.8914C43.6233 31.2405 42.4778 32.4093 40.7003 33.1785L21.9862 41.3C19.8411 42.2284 18.334 42.2314 17.5045 41.312H17.5075ZM20.7587 16.3436C20.8893 16.9025 21.1051 17.4373 21.3968 17.9331L23.6422 22.0464C25.5899 25.6159 25.2769 31.0152 22.9251 34.3413L20.2148 38.1782C19.8654 38.6349 19.5919 39.1396 19.3944 39.6805C19.9687 39.5994 20.5247 39.4281 21.0473 39.1787L39.7644 31.0602C40.8218 30.6035 41.5024 29.9966 41.6361 29.3987C41.7881 28.7166 41.1652 27.8934 39.9893 27.2143L22.3417 17.0287C21.8525 16.7222 21.3178 16.4909 20.7587 16.3436Z" fill="white"/>
    </svg>
  );
}

export default NoteArrow;