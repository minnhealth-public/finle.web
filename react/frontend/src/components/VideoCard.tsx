import React from 'react';
import { Link } from 'react-router-dom';
import { Video } from '../models';

interface VideoCardProp {
  video: Video
}

const VideoCard: React.FC<VideoCardProp> = ({video}) => {

  function getVideoLengthInSeconds(startTime: number, endTime: number) {
    // TODO: calculate video length
    return 10;
  }

  function getVideoImage(){
    if (video.id) {
        return `http://img.youtube.com/vi/${ video.video }/mqdefault.jpg`;
    } else {
        return '/mainpage-thumbnail-placeholder.png';
    }
  }
  return (
    <div className="bg-white ">
      <div className="aspect-w-16 aspect-h-9 mb-2 ">
        <Link className="relative group" to={`/shorts/${video.id}`}>
            <img src={getVideoImage()} alt={`${ video.name }`}/>
            <div className="absolute hidden group-hover:block inset-0 bg-teal-500 opacity-50"></div>
        </Link>
      </div>
      <h2 className="text-xl font-semibold mb-2">{video.name}</h2>
      <p className="text-gray-700 mb-2">{video.description}</p>
      <p className="font-semibold">
        {getVideoLengthInSeconds(video.start_time, video.end_time)}s
      </p>
    </div>
  );
};

export default VideoCard;
