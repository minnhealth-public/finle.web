import React from 'react';
import useVideo from '../../hooks/useVideo';
import { VideoClip } from '../../models/todo';

interface VideoCardSlimProp extends React.ComponentProps<"div"> {
  video: VideoClip
}

const VideoCardSlim: React.FC<VideoCardSlimProp> = ({ video, ...props }) => {

  const {
    getVideoImage,
    getVideoLengthInSeconds,
  } = useVideo(null)

  return (
    <div className={props.className} {...props}>
      <a
        className="bg-white group cursor-pointer flex flex-row gap-4"
        tabIndex={0}
        role="link"
        target="_blank"
        href={`/videos/${video.id}`}
      >
        <div className="flex flex-col group-hover:underline group-focus:underline ">
          <h2 className="font-semibold mb-2 line-clamp-2">{video.name}</h2>
          <div className="flex items-center gap-2 justify-between">
            <p className="font-semibold">
              {`${getVideoLengthInSeconds(video.startTime, video.endTime)} seconds `}
            </p>
          </div>
        </div>
        <div className="flex ">
          <img src={getVideoImage(video)} alt={`${video.name}`} />
        </div>
      </a>
    </div>
  );
};

export default VideoCardSlim;
