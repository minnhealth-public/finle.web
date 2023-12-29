import React, {useContext, useRef, useState} from 'react'
import { ShortContext } from "../contexts/ShortContext";
import { Video } from '../models';
import ReactPlayer from 'react-player'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightToBracket, faPlay, faChevronRight, faCirclePlay} from '@fortawesome/free-solid-svg-icons';
import NotesSection from './NotesSection';

const Short: React.FC = () => {
  const short: Video = useContext(ShortContext)
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

  const playerRef = useRef(null);

  // TODO when we want to know how much is played to send of a completion watch this
  const progressHandler = (state: any) => {};

  const onEnd = () => {
    setVideoOpts({...videoOpts, played: 1, playing: false, start: 0});
  }

  const replay = () => {
    playerRef.current.seekTo(0);
    setVideoOpts({...videoOpts, played: 0, playing: true});
  }

  const saveVideo = () => {
    // send queryMutate to update/create a saved video for the current user.
  }

  return (
    <div id="short" className="p-3">

      <div id="player-wrapper" className="relative pt-[45%]">
        <img
          className={`w-full h-full absolute top-0 ${videoOpts.playing?"hidden": ""}`}
          src={`http://img.youtube.com/vi/${ short.video }/mqdefault.jpg`}
          alt={`${ short.name }`}
        />
        <div className={`${videoOpts.played === 1 || !videoOpts.playing?"hidden": ""}`}>
          <ReactPlayer
            ref={playerRef}
            className="absolute top-0"
            width="100%"
            height="100%"
            url={`https://www.youtube.com/watch?v=${short?.video}`}
            pip={videoOpts.pip}
            playing={videoOpts.playing}
            controls={videoOpts.controls}
            light={videoOpts.light}
            onProgress={progressHandler}
            onPause={() => setVideoOpts({...videoOpts, playing:false})}
            onEnded={onEnd}
          />
        </div>

        <div className={`${videoOpts.played !==  1?"hidden": ""}`}>
          <div className="absolute inset-0 bg-teal-500 opacity-70"></div>
          <div className="flex flex-col gap-2 absolute text-white-1 inset-0 text-left p-10">
              <h3 className="text-2xl">Need more information still?</h3>
              <div>
                <button className="text-lg items-center flex flex-row" onClick={replay} >
                  Replay <FontAwesomeIcon icon={faChevronRight} className="pl-2 w-1.5"/>
                </button>
              </div>
              {short?.entire_clip &&
                <div>
                    <button className="text-lg items-center flex flex-row">Watch full length video <FontAwesomeIcon icon={faChevronRight} className="pl-2 w-1.5"/></button>
                </div>
              }
                <div>
                    <button className="text-lg items-center flex flex-row">Watch next video <FontAwesomeIcon icon={faChevronRight} className="pl-2 w-1.5"/></button>
                </div>
          </div>
        </div>
        <div className={`${videoOpts.played !== 0 || videoOpts.playing?"hidden":""}`}>
          <div className="absolute inset-0 bg-teal-500 hover:bg-teal-400 opacity-70"></div>
          <button onClick={() => {setVideoOpts({...videoOpts, playing: true})}}className="flex items-center justify-center absolute text-white-1 inset-0 text-5xl">
              <FontAwesomeIcon icon={faCirclePlay} className=""/>
          </button>
       </div>
      </div>
      <NotesSection></NotesSection>
      <div className="py-3">
        <h2 className="text-left">{ short?.description }</h2>
      </div>
      <div>
        <div id="clip-rating">
        </div>
      </div>
      <div className="flex-row flex">
        <div className="md:w-3/4 bg-white-50 bg-opacity-50 font-bold text-left p-4 pb-8">
            <p className="text-teal-400">Key Takeaways</p>
            <ol className="list-decimal pl-8">
                <li>Key takeaway number 1</li>
                <li>Key takeaway number 2</li>
                <li>Key takeaway number 3</li>
            </ol>
        </div>
        <div className="md:w-1/4 flex flex-col items-end gap-1">
            <div>
                <button
                    className="text-sm bg-teal-500 hover:bg-teal-400 active:bg-teal-400 uppercase rounded-md text-white-1 px-4 py-1"
                    onClick={() => saveVideo()}
                >
                    save
                </button>
            </div>
            <div>
                <button
                    className="hover:text-teal-400 text-sm"
                    onClick={() => {}}>
                    Share with Care Team
                    <FontAwesomeIcon icon={faArrowRightToBracket} className='pl-2 w-4 text-teal-500' />
                </button>
            </div>
            {short?.longer_clip != null &&
                <a className="text-sm flex flex-row items-center hover:text-teal-400" href={`/shorts/${ short?.longer_clip }/`}>
                  Watch longer clip
                  <FontAwesomeIcon icon={faPlay} className='pl-2 w-4 text-teal-500' />
                </a>
            }
            {short?.entire_clip &&
                <a className="text-sm flex flex-row items-center hover:text-teal-400" href={`/shorts/${ short?.entire_clip }/`}>
                  Watch entire clip
                  <FontAwesomeIcon icon={faPlay} className='pl-2 w-4 text-teal-500' />
                </a>
            }
        </div>
      </div>
      <div className="py-10 flex flex-row items-center gap-3">
          <p>How helpful did you find this video?</p>
          <button onClick={() => {}} className="text-sm rounded-md border-gray-300 border-2 px-4 py-1 text-gray-500">Not Useful</button>
          <button onClick={() => {}} className="text-sm rounded-md border-gray-300 border-2 px-4 py-1 text-gray-500">Kind of Useful</button>
          <button onClick={() => {}} className="text-sm rounded-md border-gray-300 border-2 px-4 py-1 text-gray-500">Very Useful</button>
      </div>
    </div>
  )
}

/*
<ClipRating shortId={short?.id} currentRating={short?.user_rating}/>
*/

export default Short
