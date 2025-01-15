import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Modal } from '../../shared/View';
import ReactPlayer from 'react-player';
import useVideo from '../../hooks/useVideo';
import { VideoClip } from '../../models/todo';
import FinancialIcon from '../../shared/Icon/FinancialIcon';
import LawIcon from '../../shared/Icon/LawIcon';
import { useStore } from '../../store';
import Topic from '../../models/topic';
import { PlayIcon } from '../../shared/Icon';
import CheckIcon from '../../shared/Icon/CheckIcon';
import RefreshIcon from "../../shared/Icon/RefreshIcon.tsx";

interface VideoCardProp extends React.ComponentProps<"div"> {
  video: VideoClip
  showTopicOverlay?: boolean
  isModal?: boolean
  disableLink?: boolean
  parentSearchParams?: URLSearchParams
}

const VideoCard: React.FC<VideoCardProp> = ({ video, isModal, showTopicOverlay, disableLink, parentSearchParams, ...props }) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTopicOverlay, setIsTopicOverlay] = useState(typeof (showTopicOverlay) !== "undefined" ? showTopicOverlay : true);
  const { topics } = useStore();
  const navigate = useNavigate();

  const {
    playerRef,
    videoOptions,
    setVideoOptions,
    getVideoImage,
    getVideoTime,
    progressHandler,
    onPause,
    onPlay,
    onEnd,
    onReady,
  } = useVideo(video)

  const displayTime = useMemo(() => {
    return getVideoTime(video);
  }, [video])

  const cardClick = () => {
    if (disableLink)
      return;

    if (isModal)
      setIsModalOpen(true)
    else
      navigate(`/videos/${video.id}`, {
        state: { parentSearchParams: parentSearchParams.toString() }
      })
  }

  const showPlaceholderImage = () => {
    let placeHolders: any = {};

    topics.forEach((topic: Topic) => {
      if (topic.name === "Legal")
        placeHolders[topic.id] = { name: topic.name, comp: <LawIcon /> }
      else if (topic.name === "Financial")
        placeHolders[topic.id] = { name: topic.name, comp: <FinancialIcon /> }
    });

    if ((video.topicsAddressed && video.topicsAddressed.length > 0) && isTopicOverlay) {
      const topicAddressed = video.topicsAddressed[0];
      const displayTopic = placeHolders[topicAddressed];
      const isLegal = displayTopic?.name === "Legal";
      return (
        <>
          {video.saved &&
            <div className="ribbon-horizontal group-hover:hidden uppercase">
              <div>Saved</div>
            </div>
          }
          <div className="group-hover:hidden">
            <div className={`
            ${isLegal && "bg-header"}
            ${!isLegal && "bg-primary"}
             w-full flex items-center justify-center absolute text-white-1 inset-0 text-5xl
          `}>
              <div className="w-1/6">{placeHolders[topicAddressed]?.comp}</div>
            </div>
          </div>

          <div className={`pb-[56.25%] absolute hidden group-hover:block inset-0 text-primary_alt`}>
            <div
              className={`
            bg-white-1
            ${(isLegal ? "text-header border-4 border-header" : " text-primary border-4 border-primary")}
              w-full flex items-center justify-center absolute inset-0 text-5xl
          `}>
              <PlayIcon className="w-1/6" />
            </div>
          </div>
        </>
      )
    } else {
      return (
        <>
          {video.saved &&
            <div className="ribbon-horizontal group-hover:hidden uppercase">
              <div>Saved</div>
            </div>
          }
          <div className="relative pb-[56.25%] ">
            <div className={``}>
              <img className="" src={getVideoImage(video)} alt={`${video.name}`} />
            </div>
          </div>
          <div className={`pb-[56.25%] group-hover:bg-primary group-hover:bg-opacity-70 absolute hidden group-hover:block inset-0 text-primary_alt`}>
            <div
              className={`w-full flex items-center justify-center absolute inset-0 text-5xl text-white-1`}>
              <PlayIcon className="w-1/6" />
            </div>
          </div>
        </>
      )
    }
  }

  return (
    <div className={props.className} {...props}>
      <div
        className="flex flex-col h-full bg-white group cursor-pointer"
        tabIndex={0}
        onKeyDown={(evt: any) => {
          if (evt.key === "Enter")
            cardClick()
        }}
        role="link"
        onClick={cardClick}
      >
        <div className="relative pb-[56.25%] h-0">
          {isModal ? <>
            <div
              className="relative "
              onClick={() => setIsModalOpen(true)}
            >
              {video.saved &&
                <div className="ribbon-horizontal group-hover:hidden uppercase">
                  <div>Saved</div>
                </div>
              }
              <div className="">
                <div className={`
                 w-full flex relative inset-0
              `}>
                  <img className="w-full " src={getVideoImage(video)} alt={`${video.name}`} />
                </div>
              </div>
              <div className={`pb-[56.25%] group-hover:bg-primary group-hover:bg-opacity-70 absolute hidden group-hover:block inset-0 text-primary_alt`}>
                <div
                  className={`flex items-center justify-center absolute inset-0 text-5xl text-white-1`}>
                  <PlayIcon className="w-1/6" />
                </div>
              </div>
            </div>
          </> :
            showPlaceholderImage()
          }
        </div>
        <div className="flex flex-col flex-1 mt-2">
          <h2 className="font-semibold flex-grow mb-2 group-hover:underline group-focus:underline line-clamp-2 text-lg">{video.name}</h2>
          <div className="flex items-center gap-2 justify-between">
            <p className="text-md">{displayTime}</p>
            {(video?.watched) &&
              <div className="text-primary font-semibold flex items-center gap-1">
                Played
                <div className="bg-primary text-white-1 rounded-full p-1 w-4 h-4">
                  <CheckIcon />
                </div>
              </div>
            }
          </div>
        </div>

      </div>
      {isModal ?
        <Modal open={isModalOpen} onClose={() => {
          setVideoOptions({ ...videoOptions, playing: false });
          setIsModalOpen(false);
        }}>
          <div className="flex flex-col gap-2 w-[65vw]">
            <h1 id="clip-title" className="flex flex-row relative text-4xl">
              <div>{video.name}</div>
            </h1>
            <div className="relative pb-[56.25%] h-0 group">
              <img
                className={`w-full h-full absolute top-0 ${videoOptions.playing ? "hidden" : ""}`}
                src={getVideoImage(video)}
                alt={`${video.name}`}
              />
              <div className={`${videoOptions.played || videoOptions.playing ? "hidden" : ""}`}>
                <div className="absolute inset-0 bg-primary_alt group-hover:bg-primary opacity-70"></div>
                <button onClick={() => { setVideoOptions({ ...videoOptions, playing: true }) }} className="w-28 m-auto absolute text-white-1 inset-0 text-5xl">
                  <PlayIcon />
                </button>
                <div className="capitalize" >{`Play Preview`}</div>
              </div>
              {videoOptions.played && <div className={`${!videoOptions.played ? "hidden" : ""}`}>
                <div className="absolute inset-0 bg-primary_alt opacity-90"></div>
                <div className="flex flex-col gap-4 absolute text-white-1 inset-0 text-center md:p-10 p-4">
                  <div className="mt-2 text-xl font-semibold">
                    If you like this content and want to watch more, click the button below to go to the video's page!
                  </div>
                  <div className="m-auto">
                    <button
                      onClick={() => { setVideoOptions({ ...videoOptions, played: false, playing: true }) }}
                      className="w-full flex flex-col items-center justify-center text-white-1 md:text-5xl gap-4 "
                    >
                      <div className="w-[10vw]">
                        <RefreshIcon />
                      </div>
                      <div className="capitalize" >Replay</div>
                    </button>
                  </div>
                </div>
              </div>
              }
              {videoOptions.playing && <ReactPlayer
                data-testid="success-video"
                ref={playerRef}
                className="absolute top-0"
                width="100%"
                height="100%"
                url={`https://www.youtube.com/watch?v=${video?.video}`}
                pip={videoOptions.pip}
                playing={videoOptions.playing}
                controls={videoOptions.controls}
                light={videoOptions.light}
                onProgress={(state: any) => progressHandler(state, video)}
                onPause={() => onPause(video)}
                onEnded={onEnd}
                onReady={() => onReady(video)}
                onPlay={() => onPlay(video)}
              />}

            </div>
            <div className="flex gap-4">
              {(video?.watched) &&
                <div className="text-primary font-semibold flex items-center gap-1">
                  Played
                  <div className="bg-primary text-white-1 rounded-full p-1 w-4 h-4">
                    <CheckIcon />
                  </div>
                </div>
              }
              <p className="font-semibold ml-auto">
                {getVideoTime(video)}
              </p>
            </div>
            <div className="m-auto">
              <Link className="btn-primary" to={`/videos/${video.id}`} target="_blank">
                Go To Video
              </Link>
            </div>
          </div>
        </Modal>

        : <></>
      }
    </div>
  );
};


export default VideoCard;
