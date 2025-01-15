interface Video {
  id: number;
  name: string;
  video: string;
  type: string;
  videoUrl: string;
  endTime: number;
  startTime: number;
  longerClip?: Video;
  entireClip?: Video;
  relatedClips?: Video[];
  topicsAddressed: number[];
  keyTakeaways: any[];
  tags: number[];
  tasks: any[];
  saved: boolean;
  watched: boolean;
  watchedTimestamp: string;
  rating: number;
}

export default Video;
