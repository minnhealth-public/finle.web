import React, { SyntheticEvent, useEffect, useState } from 'react';
import { VideoClip } from '../../models/todo';
import { VideoCard } from '../../components/VideoCard';
import { Arrow } from '../Icon';
import useMediaQueries from '../../hooks/useMediaQueries';

interface VideoCarouselProps {
  perPage: number
  videos: VideoClip[]
}

const VideoCarousel: React.FC<VideoCarouselProps> = ({ videos, perPage }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pageCount, setPageCount] = useState(perPage)

  const { sm, md, lg } = useMediaQueries()

  useEffect(() => {
    if (sm)
      setPageCount(1)
    else if (md)
      setPageCount(2)
    else
      setPageCount(4)

  }, [sm, md, lg])

  const previous = () => {
    setCurrentIndex(currentIndex - 1)
  }

  const next = () => {
    setCurrentIndex(currentIndex + 1)
  }

  const handleKeyDown = (event: any, evtType: string) => {
    if (event.key === " ") {
      event.preventDefault();
      if (evtType === "next")
        next();
      if (evtType === "prev")
        previous()
      return false;
    }
  }

  return (
    <div className="w-full flex px-4 gap-4 items-center ">

      {currentIndex > 0 ?
        <div
          onClick={previous}
          tabIndex={0}
          onKeyDown={(evt: SyntheticEvent) => handleKeyDown(evt, "prev")}
          className="
          cursor-pointer -rotate-90 text-white-1 bg-primary rounded-full w-12
          hover:bg-primary_alt focus:bg-primary_alt
          "
        >
          <Arrow />
        </div> :
        <div
          className="
          cursor-pointer -rotate-90 text-white-1 bg-primary rounded-full w-12
          hover:bg-primary_alt focus:bg-primary_alt
          "
        >
        </div>
      }
      <div className="flex flex-col  w-full gap-4">

        <div className="flex flex-row w-full gap-4">
          {Array.from({ length: pageCount }, (_, idx) => {
            return Math.abs((pageCount * currentIndex + idx) % videos.length);
          }).map(
            (videoIdx: number, idx: number) => {
              const videoJSX = <VideoCard
                key={videoIdx}
                className="flex flex-shrink-0 flex-1 animate-[reveal_2s]"
                video={videos[videoIdx]}
                isModal={true}
              ></VideoCard>
              if (videoIdx === 0 && idx != 0) {

                return <>
                  <div className="border border-primary_alt my-4"></div>
                  {videoJSX}
                </>
              } else {
                return videoJSX;
              }
            }
          )}
        </div>
      </div>
      <div
        onClick={next}
        onKeyDown={(evt: SyntheticEvent) => handleKeyDown(evt, "next")}
        tabIndex={0}
        className="
        cursor-pointer rotate-90 text-white-1 bg-primary rounded-full w-12
        hover:bg-primary_alt focus:bg-primary_alt
        "
      >
        <Arrow />
      </div>
    </div>
  );
};

export default VideoCarousel;
