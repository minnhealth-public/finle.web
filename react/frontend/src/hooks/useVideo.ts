import { useCallback, useRef, useState } from "react";
import { VideoClip } from "../models/todo";
import useAxiosPrivate from "./useAxiosPrivate";
import { putWatched } from "../api/shorts";
import { useMutation } from "@tanstack/react-query";
import { logEventWithTimestamp } from "../lib/analytics";


const useVideo = (video: VideoClip) => {

  const playerRef = useRef(null);
  const axiosPrivate = useAxiosPrivate();
  const [playedPercentage, setPlayedPercentage] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef(null);

  const watchMutation = useMutation({
    mutationFn: (clipId: number) => putWatched(axiosPrivate, [clipId])
  })

  const [videoOptions, setVideoOptions] = useState(
    {
      start: video?.startTime,
      url: null,
      pip: false,
      playing: false,
      controls: false,
      light: false,
      volume: 0.8,
      muted: false,
      played: false,
      loaded: 0,
      duration: 0,
      playbackRate: 1.0,
      loop: false
    });

  const progressHandler = (state: any, clip: VideoClip) => {
    if (isDragging) return;

    const totalDuration = getVideoLengthInSeconds(clip.startTime, clip.endTime);
    setPlayedPercentage((state.playedSeconds - clip.startTime) / totalDuration);
    setRemainingTime(Math.max(0, totalDuration - (state.playedSeconds - clip.startTime)));

    if (state.playedSeconds > clip.endTime) {
      setVideoOptions({ ...videoOptions, playing: false, played: true })
    }
    if (
      !watchMutation.isPending &&
      playedPercentage >= 0.8
    ) {
      watchMutation.mutate(clip.id);

      logEventWithTimestamp('video_watched', {
        video_id: clip.id,
        video_name: clip.name
      });
    }
  };

  const handleSeek = (clientX: number, clip: VideoClip) => {
    if (!progressRef.current) return 0;

    if (playerRef.current) {
      const progressContainer = progressRef.current.getBoundingClientRect();
      const clickPosition = Math.max(clientX - progressContainer.left, 0);
      const boundedPosition = Math.min(clickPosition, progressContainer.width);

      const newPlayedPercentage = boundedPosition / progressContainer.width;
      const totalDuration = getVideoLengthInSeconds(clip.startTime, clip.endTime);
      const seekToInSeconds = (newPlayedPercentage * totalDuration) + clip.startTime;

      // This ensures the progress bar gets updated before the video has been started and while dragging
      if (!hasStarted || isDragging){
        setPlayedPercentage(newPlayedPercentage)
        console.log(newPlayedPercentage)
        setRemainingTime(Math.max(0, totalDuration - (seekToInSeconds - clip.startTime)));
      }

      playerRef.current.seekTo(seekToInSeconds, 'seconds');
    }
  };

  const handleMouseDown = (e: any, clip: VideoClip) => {
    setIsDragging(true);
    handleSeek(e.clientX, clip);
  };

  const handleMouseMove = (e: any, clip: VideoClip) => {
    if (!isDragging) return;
    handleSeek(e.clientX, clip);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const onReplay = (clip: VideoClip) => {
    const timeToStart = clip.startTime;
    console.log("onreplay: ", playerRef.current)
    playerRef.current.seekTo(timeToStart, 'seconds');
    setVideoOptions({ ...videoOptions, played: false, playing: true });
    logEventWithTimestamp('video_replay', {
      video_id: clip.id,
      video_name: clip.name
    });
  }

  function getVideoLengthInSeconds(startTime: number, endTime: number) {
    return endTime - startTime;
  }

  const onPlay = (clip: VideoClip) => {
    setHasStarted(true)
    logEventWithTimestamp('video_play', {
      video_id: clip.id,
      video_name: clip.name
    });
  }

  const getVideoTime = (video: VideoClip): string => {
    let videoLength = getVideoLengthInSeconds(video.startTime, video.endTime)

    if (videoLength >= 60) {
      let rounded = Math.round(videoLength / 60);
      return `${rounded} ${rounded === 1 ? 'minute' : 'minutes'}`
    } else {
      return `${videoLength} seconds`
    }
  }

  function getVideoImage(clip: VideoClip) {
    if (clip.id) {
      return `http://img.youtube.com/vi/${clip.video}/mqdefault.jpg`;
    } else {
      return '/mainpage-thumbnail-placeholder.png';
    }
  }

  const onPause = () => setVideoOptions({ ...videoOptions, playing: false })
  const onReady = useCallback((clip: VideoClip) => {
    const timeToStart = clip.startTime;
    playerRef.current.seekTo(timeToStart, 'seconds');
    setRemainingTime(getVideoLengthInSeconds(clip.startTime, clip.endTime))
  }, []);

  const onEnd = () => {
    setVideoOptions({ ...videoOptions, played: true, playing: false, start: 0 });
  }

  const onJumpForward = (clip: VideoClip) => {
    const curTime = playedPercentage * getVideoLengthInSeconds(clip.startTime, clip.endTime) + clip.startTime;
    playerRef.current.seekTo(Math.min(curTime + 10, clip.endTime), 'seconds');
  }

  const onJumpBack = (clip: VideoClip) => {
    const curTime = playedPercentage * getVideoLengthInSeconds(clip.startTime, clip.endTime) + clip.startTime;
    playerRef.current.seekTo(Math.max(clip.startTime, curTime - 10), 'seconds');
  }

  return {
    playerRef,
    videoOptions,
    setVideoOptions,
    getVideoImage,
    getVideoLengthInSeconds,
    getVideoTime,
    progressHandler,
    onReady,
    onEnd,
    onPlay,
    onPause,
    onReplay,
    handleSeek,
    playedPercentage,
    remainingTime,
    handleMouseMove,
    handleMouseUp,
    handleMouseDown,
    progressRef,
    isDragging,
    onJumpForward,
    onJumpBack
  };
}

export default useVideo;
