import React, { useEffect, useState } from "react";
import { ChangeFontSizeIcon } from '../Icon';
import { useStore } from "../../store";
import { logEventWithTimestamp } from "../../lib/analytics";

interface ChangeFontSizeProps { }

const ChangeFontSize: React.FC<ChangeFontSizeProps> = () => {
  const [timeId, setTimeId] = useState<any>();
  const [displaySlide, setDisplaySlide] = useState(false);
  const { zoom, setZoom } = useStore();

  // On init zoom to the proper size
  useEffect(() => {
    adjustZoomLevel(zoom);
  }, [])

  const onChange = (evt: any) => {
    const tmpZoom = parseInt(evt.currentTarget.value);
    clearTimeout(timeId);
    setTimeId(setTimeout(() => {
      setZoom(tmpZoom);
      adjustZoomLevel(tmpZoom);
      logEventWithTimestamp('font_zoom', {'font_zoom': tmpZoom})
    }, 500));
  }

  const adjustZoomLevel = (zoomVal: number) => {
    const percentage: number = (zoomVal * .6) + 100;
    document.documentElement.style.fontSize = `${percentage}%`;
  }

  return (
    <div className="relative">
      <button
        id="font-adjustor"
        aria-label="font-size"
        onClick={() => {

          setDisplaySlide(!displaySlide)
        }}
      >
        <ChangeFontSizeIcon />
      </button>
      <label className={`absolute -bottom-6 left-0 md:right-0 md:left-auto ${displaySlide ? "animate-reveal" : "hidden"}`}>
        <input onChange={onChange} type="range" min="1" max="100" defaultValue={zoom} className="" />
      </label>
    </div>
  )
}

export default ChangeFontSize;
