import React, { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { Story } from '../models';
import { Modal } from '../shared/View';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlay } from '@fortawesome/free-solid-svg-icons';

interface SuccessStoryProps {
  story: Story
}

const SuccessStory: React.FC<SuccessStoryProps> = ({ story }) => {
  const playerRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoOpts, setVideoOpts] = useState(
    {
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


  const extractVideoId = (url: string): string | null => {
    const regex = /(?:\?|&)v=([^&]+)/;
    const match = url.match(regex);

    return match ? match[1] : null;
  };

  const videoId = extractVideoId(story.videoUrl);

  const shortDescriptionArray = story.shortDescription.match(/\(?[^\.\?\!]+[\.!\?]\)?/g);
  let shortDescriptionHeader;
  if(shortDescriptionArray && shortDescriptionArray.length >= 2){
    shortDescriptionHeader = shortDescriptionArray[0] + shortDescriptionArray[1];
  }else{
    shortDescriptionHeader = story.shortDescription;
  }

  return (
    <>
      <div className="flex flex-row gap-4">
        <div className="basis-1/2 flex flex-col gap-2">
          <h1 className="text-3xl text-blue-450">
            {story.title}
          </h1>
          <p className="font-bold text-xl">
            {shortDescriptionHeader}
          </p>
          <p className="line-clamp-6">
            {story.fullStory}
          </p>
          <div>
            <button className="text-teal-500 hover:text-teal-400" onClick={() => {setVideoOpts({...videoOpts, playing: false}); setIsModalOpen(true)}}>
              <span className="font-bold uppercase">Read full story {'>'}</span>
            </button>
          </div>
        </div>
        <div className="basis-1/2 flex items-center">
          <div className="w-full flex items-center relative" >
            <img
              className={`w-full object-contain`}
              src={`http://img.youtube.com/vi/${ videoId }/mqdefault.jpg`}
              alt={`${ story.title }`}
            />

            <div className="absolute h-full w-full bg-teal-500 hover:bg-teal-400 opacity-70"></div>
            <button
              onClick={() => {setIsModalOpen(true); setVideoOpts({...videoOpts, playing: true})}}
              className="flex w-full items-center justify-center absolute text-white-1 text-5xl"
            >
                <FontAwesomeIcon icon={faCirclePlay} className=""/>
            </button>
          </div>
       </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => {setIsModalOpen(false)} }>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl text-blue-450">
            {story.title}
          </h1>
          <p className="font-bold">
            {story.shortDescription}
          </p>
          <p className="h-[20vh] max-h-screen overflow-y-auto">
            {story.fullStory}
          </p>
          <div  className="relative md:pt-[36.3%] pt-[50%]">
            <ReactPlayer
                data-testid="success-video"
                ref={playerRef}
                className="absolute top-0"
                width="100%"
                height="100%"
                url={story.videoUrl}
                pip={videoOpts.pip}
                playing={videoOpts.playing}
                controls={videoOpts.controls}
                light={videoOpts.light}
                onProgress={() => {}}
                onPause={() => setVideoOpts({...videoOpts, playing:false})}
                onEnded={() => setVideoOpts({...videoOpts, played: 1, playing: false, start: 0})}
              />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SuccessStory;
