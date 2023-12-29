import React from 'react';
import {useQuery} from "@tanstack/react-query";
import VideoCard from '../components/VideoCard';
import { Video } from '../models';
import { getShorts } from '../api/shorts';

const ShortsListPage: React.FC = () => {
  const shortsQuery = useQuery<Video[], Error>({
    queryKey: ["shorts"],
    queryFn: getShorts
  });

  const showShorts = () => {
    if (shortsQuery.isLoading){
        return <h2>Is Loading</h2>
    } else if (shortsQuery.error){
        console.error("Failed to fetch shorts.")
        console.error("Error occurred while fetching shorts from /api/shorts: ", shortsQuery.error);
        return <h2>Error</h2>
    } else {
        // filter videos from the url params
        const filteredVideos: Video[] = shortsQuery.data;
        return <>
            {filteredVideos.map((video, index) => (
                <VideoCard key={index} video={video}/>
            ))}
        </>
    }
  }

  return (
    <>
      <div className="bg-teal-500">
        <div className="container mx-auto p-4">
          <h1 className="header">Video Shorts</h1>
        </div>
      </div>
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {showShorts()}
      </div>
    </>
  );
};

export default ShortsListPage;
