import React, {useEffect, useMemo, useState} from 'react'
import ReactPlayer from 'react-player'
import useVideo from '../../hooks/useVideo';
import { PlayIcon } from '../../shared/Icon';
import { Link, useSearchParams } from "react-router-dom";
import { useStore } from '../../store';
import { VideoClip } from '../../models/todo';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import KeyTakeaway, { ClipKeyTakeaway } from '../../models/keyTakeaways';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getClipKeyTakeaways } from '../../api/keytakeaways';
import { putRating } from '../../api/shorts';
import ChevronIcon from '../../shared/Icon/ChevronIcon';
import { logEventWithTimestamp } from "../../lib/analytics";
import RefreshIcon from "../../shared/Icon/RefreshIcon";
import PauseIcon from "../../shared/Icon/PauseIcon.tsx";
import SkipForwardIcon from "../../shared/Icon/SkipForwardIcon.tsx";
import RewindIcon from "../../shared/Icon/RewindIcon.tsx";
import {clipTypeDescriptionMap, clipTypeMap} from "../../shared/constants.tsx";


interface ClipProps {
  clip: VideoClip
}

interface RatingOption {
  value: number
  text: string
}


const Clip: React.FC<ClipProps> = ({ clip }) => {
  const { clips } = useStore();
  const queryClient = useQueryClient();
  const axiosPrivate = useAxiosPrivate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentIdx] = useState<number>(parseInt(searchParams.get("idx")) || 0);
  const [filteredClips] = useState(
    clips.filter((lClip: VideoClip) => lClip.id !== clip.id)
  );
  const [copyStatus, setCopyStatus] = useState(false);

  const keyTakeawayQuery = useQuery<KeyTakeaway[]>({
    queryKey: ["clip_key_takeaway", clip.id],
    queryFn: () => getClipKeyTakeaways(axiosPrivate, clip.id)
  });


  const rateMutation = useMutation({
    mutationFn: (rating: number) => putRating(axiosPrivate, clip.id, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clip', clip.id] });
    }
  })


  const ratingOptions: RatingOption[] = [
    { "value": 0, "text": "Not at all" },
    { "value": 1, "text": "Kind of" },
    { "value": 2, "text": "Very" }
  ];

  const [nextVideo] = useState(currentIdx >= filteredClips.length ? null : filteredClips[currentIdx]);


  const keyTakeaway = useMemo(() => {
    if (keyTakeawayQuery.data) {
      let grouping = Object.groupBy(keyTakeawayQuery.data, (takeaway: ClipKeyTakeaway) => takeaway.clipId)

      // there is only one grouping so don't show the time segment
      if (Object.keys(grouping).length === 1) {
        return keyTakeawayQuery.data.map((takeaway: ClipKeyTakeaway, idx: number) => {
          return (
            <ul key={idx} className="list-disc list-inside text-xl">
              <li dangerouslySetInnerHTML={{ __html: takeaway.text }}></li>
            </ul >
          )
        })
      }

      return (
        <div className="flex flex-col gap-4 pb-12">
          {
            Object.keys(grouping).map((groupKey: string, idx: number) => {
              let takeaways = grouping[groupKey];
              let takeaway = takeaways[0];
              return (
                <div key={idx}>
                  <Link
                    className="text-primary hover:text-primary_alt font-bold text-left hover:underline text-xl"
                    to={`/videos/${takeaway.clipId}`}>{takeaway.clipName}</Link>
                  <ul className="list-disc list-inside text-xl">
                    {takeaways.map((takeaway: ClipKeyTakeaway, idx: number) => {
                      return <li key={idx} dangerouslySetInnerHTML={{ __html: takeaway.text }} ></li>

                    })}
                  </ul>
                </div>

              )
            })
          }
        </div>
      )

    }
  }, [keyTakeawayQuery.data])


  const {
    playerRef,
    videoOptions,
    setVideoOptions,
    getVideoImage,
    getVideoTime,
    progressHandler,
    onReplay,
    onPause,
    onEnd,
    onReady,
    onPlay,
    playedPercentage,
    remainingTime,
    handleMouseMove,
    handleMouseUp,
    handleMouseDown,
    progressRef,
    isDragging,
    onJumpForward,
    onJumpBack
  } = useVideo(clip)

  useEffect(() => {
    const mouseMoveHandler = (event: MouseEvent) => handleMouseMove(event, clip);
    const mouseUpHandler = () => handleMouseUp()

    // Add global event listeners for drag handling
    window.addEventListener("mousemove", mouseMoveHandler);
    window.addEventListener("mouseup", mouseUpHandler);

    return () => {
      window.removeEventListener("mousemove", mouseMoveHandler);
      window.removeEventListener("mouseup", mouseUpHandler);
    };
  }, [clip, isDragging]);

  const handleCopy = () => {
    navigator.clipboard.writeText(clipUrlWithTimes).then(() => {
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 3000);
    });
  };

  const clipUrlWithTimes = `${clip.videoUrl}&start=${clip.startTime}&end=${clip.endTime}`;

  const CopyUrlButton =  () => {
    return (
      <div className="absolute w-full z-10">
      <button
          onClick={handleCopy}
          className="text-white-1 hover:text-primary p-3 bg-primary_alt bg-opacity-90 hover:bg-gray-200 w-full"
          aria-label="Copy video URL"
      >
        {copyStatus ? (
            <>
              Copied! <span className="font-bold">{clipUrlWithTimes}</span>
            </>
        ) : (
            "Copy URL"
        )}
      </button>
      </div>
    );
  }

  return (
    <div>
      <div id="player-wrapper" className="relative pb-[56.25%] border-[16px] border-white-50 box-border group">
        <img
          className={`w-full h-full absolute top-0 ${videoOptions.playing ? "hidden" : ""}`}
          src={getVideoImage(clip)}
          alt={`${clip.name}`}
        />
        <div className={`${videoOptions.played || !videoOptions.playing ? "hidden" : ""}`}>
          <ReactPlayer
            ref={playerRef}
            className="absolute top-0"
            width="100%"
            height="100%"
            url={`https://www.youtube.com/watch?v=${clip?.video}`}
            pip={videoOptions.pip}
            playing={videoOptions.playing}
            controls={videoOptions.controls}
            light={videoOptions.light}
            onPlay={() => onPlay(clip)}
            onProgress={(state: any) => progressHandler(state, clip)}
            onPause={onPause}
            onEnded={onEnd}
            onReady={() => onReady(clip)}
          />
        </div>

        {/*Played overlay*/}
        <div className={`${!videoOptions.played ? "hidden" : ""}`}>
          <div className="absolute inset-0 bg-primary_alt opacity-90"></div>
          <CopyUrlButton />
          <div className="flex flex-col gap-4 absolute text-white-1 inset-0 text-center md:p-10 p-4">
            {clip?.type === "SHORT" && (
              <div className="mt-2 text-xl font-semibold">
                If you like this content and want to watch more, check out the <span className="font-bold text-2xl">Highlight</span> and <span className="font-bold text-2xl">Full-Length</span> tabs!
              </div>
            )}

            <div className="m-auto">
              <button
                onClick={() => onReplay(clip)}
                className="w-full flex flex-col items-center justify-center text-white-1 md:text-5xl gap-4 "
              >
                <div className="mid:w-28 w-28">
                  <RefreshIcon />
                </div>
                <div className="capitalize" >Replay</div>
              </button>
            </div>

            {nextVideo && (
              <div className="">
                <Link
                  id="ClipOverlayWatchNextButton"
                  className="text-xl flex justify-center"
                  to={`/videos/${nextVideo.id}?idx=${currentIdx + 1}`}
                  onClick={() => {
                    logEventWithTimestamp('video_next', {
                      "video_id": clip.id,
                    })
                  }}
                >
                  <span className="link-primary !text-white-1 pr-1">next video: </span>{nextVideo.name}
                  <div className="w-[0.5em] rotate-180 ml-2 link-primary !text-white-1"><ChevronIcon /></div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/*Unplayed/paused overlay*/}
        <div className={`group ${videoOptions.played || videoOptions.playing ? "hidden" : ""}`}>
          <div className="absolute h-full w-full bg-primary group-hover:bg-primary_alt opacity-90"></div>
          <CopyUrlButton />
          <button
            onClick={() => { setVideoOptions({ ...videoOptions, playing: true }) }}
            aria-label='play video'
            id="video-play-button"
            className="w-full flex flex-col items-center justify-center absolute text-white-1 inset-0 md:text-5xl gap-4 "
          >
            <div className="mid:w-28 w-28">
              <PlayIcon />
            </div>
            <div className="capitalize" >{`Play ${clipTypeMap[clip.type as keyof typeof clipTypeMap]}`}</div>
            <p className="text-xl px-14" >{clipTypeDescriptionMap[clip.type as keyof typeof clipTypeDescriptionMap]}</p>
          </button>
        </div>

        {/*Hover overlay*/}
        {videoOptions.playing && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between">
            <CopyUrlButton />
            <div className="w-full py-4 bg-primary_alt bg-opacity-90 text-white-1 text-center text-lg font-semibold mt-auto flex justify-between">
              <button id="skip-back-button" className="flex gap-2 items-center justify-center pl-3 hover:text-primary"
                onClick={() => onJumpBack(clip)}>
                <div className="mid:w-10 w-10">
                  <RewindIcon />
                </div>
                <div className="capitalize text-2xl">{`skip backward`}</div>
              </button>
              <button id="pause-button" className="flex gap-2 items-center justify-center hover:text-primary" onClick={() => setVideoOptions({ ...videoOptions, playing: false })}>
                <div className="capitalize text-2xl">{`pause ${clipTypeMap[clip.type as keyof typeof clipTypeMap]}`}</div>
                <div className="mid:w-10 w-10">
                  <PauseIcon />
                </div>
              </button>
              <button id="skip-forward-button" className="flex gap-2 items-center justify-center pr-3 hover:text-primary"
                onClick={() => onJumpForward(clip)}>
                <div className="capitalize text-2xl">{`skip forward`}</div>
                <div className="mid:w-10 w-10">
                  <SkipForwardIcon />
                </div>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Progress bar and controls */}
      <div id="progress-bar" className="flex flex-col bg-white-50">
        <div className="relative mx-4 max-w-100 cursor-pointer">
            <div className="relative w-full h-2 bg-gray-300 rounded-full" ref={progressRef}
                 onMouseDown={(e) => handleMouseDown(e, clip)}>
              {/* Played Section */}
              <div
                className="bg-header h-full rounded-full"
                style={{
                  width: `${Math.min(playedPercentage * 100, 100)}%`, // Percentage width for played section
                }}
              />

              {/* Seek Handle */}
              <div
                className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-header rounded-full cursor-pointer"
                style={{
                  left: `calc(${Math.min(playedPercentage * 100, 100)}% - 8px)`, // Center the handle, -8px if handle width is 16px
                }}
              />
            </div>
            <div className="float-right">
              <p>{Math.ceil(remainingTime)}s</p>
            </div>
        </div>
      </div>

      <div className="flex flex-col bg-white-50 px-8 rounded-b-lg">
        <div className="flex-row flex">
          <div id="key-takeaways" className={`bg-opacity-50 font-bold text-left`}>
            <h3 className="text-primary_alt text-4xl pb-6 pt-2">
              Key Takeaways
            </h3>
            {keyTakeawayQuery.data && keyTakeaway}
          </div>
          {clip?.type === "SHORT" &&
            <>
            </>
          }
        </div>
        {clip?.type === "SHORT" &&
        <div className="flex flex-col items-end gap-2 pt-10 pb-5">
          <div className="flex flex-col gap-2 justify-end items-center w-full md:flex-row">
            <div id="rating" className="text-md">How helpful was this video?</div>
              <div id="rating-buttons" className="flex flex-col gap-2 w-full md:flex-row md:w-[400px]">
              {/* rating options */}
              {ratingOptions.map(
                (ratingOption: RatingOption, idx: number) => {
                  return <button
                    key={idx}
                    onClick={() => rateMutation.mutate(ratingOption.value)}
                    className={`
              flex-1 text-sm rounded-md border-gray-300 border-2 px-3 py-1
                      ${clip.rating === ratingOption.value ? "bg-gray-300 text-white-1" : "bg-white-1 text-gray-500"}
                    `}
                  >
                    {ratingOption.text}
                  </button>

                })
              }
            </div>
          </div>
          <div className="w-full text-right text-sm">
            This helps us select the best content for you.
          </div>
        </div>
        }
      </div>
    </div >
  )
}

export default Clip
