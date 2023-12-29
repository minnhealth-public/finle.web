interface Video {
    id: string;
    name: string;
    description: string;
    video: string;
    end_time: number;
    start_time: number;
    longer_clip: string;
    entire_clip: string;
    topics_addressed: string[];
}

export default Video;
