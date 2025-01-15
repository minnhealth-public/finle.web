import React, { useRef } from 'react';
import ReactPlayer from 'react-player';
import { Story } from '../../models';
import { Modal } from '../../shared/View';
import useVideo from '../../hooks/useVideo';
import { PlayIcon } from '../../shared/Icon';
import { logEventWithTimestamp } from "../../lib/analytics";
import {Link} from "react-router-dom";
import ChevronIcon from "../../shared/Icon/ChevronIcon.tsx";

interface SuccessStoryProps {
  story: Story
}

const SuccessStory: React.FC<SuccessStoryProps> = ({ story }) => {
  const playerRef = useRef(null);
  const videoModalRef = useRef(null);
  const textModalRef = useRef(null);
  const { videoOptions, setVideoOptions } = useVideo(null)

  const extractVideoId = (url: string): string | null => {
    const regex = /(?:\?|&)v=([^&]+)/;
    const match = url.match(regex);

    return match ? match[1] : null;
  };

  const videoId = extractVideoId(story.videoUrl);

  const shortDescriptionArray = story.shortDescription.match(/\(?[^\.\?\!]+[\.!\?]\)?/g);
  let shortDescriptionHeader;
  if (shortDescriptionArray && shortDescriptionArray.length >= 2) {
    shortDescriptionHeader = shortDescriptionArray[0] + shortDescriptionArray[1];
  } else {
    shortDescriptionHeader = story.shortDescription;
  }

  const closeModal = () => {
    setVideoOptions({ ...videoOptions, playing: false, start: 0 })
    videoModalRef.current.close();
    textModalRef.current.close();
  }

  return (
    <>
      <div className="md:flex flex-row gap-4">
        <div className="basis-1/2 flex flex-col gap-3">
          <h1 className="text-3xl text-header">
            {story.title}
          </h1>
          <p className="font-bold text-xl">
            {shortDescriptionHeader}
          </p>
          <p className="text-lg">
            Learn more by watching the video to the right or by reading the story in the link below!
          </p>
          <div>
            <button className="text-primary_alt hover:text-primary" onClick={() => {
              logEventWithTimestamp('story_click', { "story_title": story.title });
              setVideoOptions({ ...videoOptions, playing: false });
              textModalRef.current.showModal()
            }}
            >
              <span className="link-primary text-xl flex">Read full story
                <div className="w-[0.5em] ml-2 rotate-180 text-color-400 "><ChevronIcon /></div>
              </span>
            </button>
          </div>
        </div>
        <div className="basis-1/2 flex items-center group">
          <div className="w-full flex items-center relative" >
            <img
              className={`w-full object-contain`}
              src={`http://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
              alt={`${story.title}`}
            />
            <div className="absolute h-full w-full bg-primary group-hover:bg-primary_alt opacity-90"></div>
            <button
              onClick={() => { videoModalRef.current.showModal(); setVideoOptions({ ...videoOptions, playing: true }) }}
              className="w-full flex flex-col items-center justify-center absolute text-white-1 inset-0 md:text-3xl gap-4 "
            >
              <div className="w-20">
                <PlayIcon />
              </div>
              <p className="capitalize">Play Video</p>
            </button>
          </div>
        </div>
      </div>
      <Modal
        ref={videoModalRef}
        onClose={closeModal}
      >
        <div className="flex flex-col gap-2 md:w-[60vw]">
          <h1 className="text-3xl text-header">
            {story.title}
          </h1>
          <div className="relative pb-[56.25%] h-0">
            <ReactPlayer
              data-testid="success-video"
              ref={playerRef}
              className="absolute top-0"
              width="100%"
              height="100%"
              url={story.videoUrl}
              pip={videoOptions.pip}
              playing={videoOptions.playing}
              controls={videoOptions.controls}
              light={videoOptions.light}
              onProgress={() => { }}
              onPlay={() => { }}
              onPause={() => setVideoOptions({ ...videoOptions, playing: false })}
              onEnded={() => setVideoOptions({ ...videoOptions, played: true, playing: false, start: 0 })}
            />
          </div>
        </div>
      </Modal>
      <Modal
        ref={textModalRef}
        onClose={closeModal}
      >
        <div className="flex flex-col gap-2 md:w-[60vw]">
          <h1 className="text-3xl text-header">
            {story.title}
          </h1>
          <div className="relative">
            <p className="h-[45vh] max-h-screen overflow-y-scroll scrollbar">
              {story.fullStory}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SuccessStory;
