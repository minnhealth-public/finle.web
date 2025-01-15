import React, { createContext, useState} from "react";

export const ClipContext = createContext(null);

export const ClipProvider = ({children}: any) => {

  const [videoOpts, setVideoOpts] = useState({
    start:0,
    url: null,
    pip: false,
    playing: false,
    controls: true,
    light: false,
    volume: 0.8,
    muted: false,
    played: 0,
    loaded: 0,
    duration: 0,
    playbackRate: 1.0,
    loop: false
  });

  const contextData = {
    videoOptions: videoOpts,
    setVideoOptions: setVideoOpts,
  }

  return (
    <ClipContext.Provider value={contextData}>
      {children}
    </ClipContext.Provider>
  )
}
