import React, {useEffect, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import VideoCard from "../../components/VideoCard";
import { SearchInput } from '../../shared/Form';
import {PlayIcon, Arrow} from "../../shared/Icon";
import { Video } from "../../models";
import { getShorts } from "../../api/shorts";
import { Link, useSearchParams } from "react-router-dom";
import VideoFilters from "../../components/VideoFilters/VideoFilters";
// import {Pagination} from "../components/Pagination";

const VideosListPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [allVideos, setAllVideos] = useState<Video[]>([]);
    const [searchResultsInput, setSearchResultsInput] = useState<string>('');

    // Page data
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 10;

    const shortsQuery = useQuery<Video[], Error>({
      queryKey: ["shorts"],
      queryFn: getShorts
    });

    const SearchResultsString: React.FC<{ searchInput: string }> = ({ searchInput }) => {
        if (searchInput !== "") {
            return (
                <p className="bolded-p">
                    Displaying search results for '{searchInput}'
                </p>
            );
        } else return null;
    }

    /*
    const PageItems = () => {
        let items = [];
        for (let i = 1; i <= totalNumOfPages; i++) {
            items.push(
                <Pagination.Item key={i} active={i === currentPage}>
                    {i}
                </Pagination.Item>)
        }
        return items;
    }
    */

    let showVideos = () => {
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

    const playFirstVideo = () => {
        if (shortsQuery.isLoading){
            return <h2>Is Loading</h2>
        } else if (shortsQuery.error){
            console.error("Failed to fetch shorts.")
            console.error("Error occurred while fetching shorts from /api/shorts: ", shortsQuery.error);
            return <h2>Error</h2>
        } else {
            return (
                <div className="flex items-center my-4">
                    <div className="flex-col">
                        <p className="font-bold text-lg rounded-font">Click here to start watching videos now</p>
                        <p className="">We've customized what to watch based on your To Do items</p>
                    </div>
                    <Link to={`/shorts/${shortsQuery.data[0].id}`} className="text-teal-500 mx-4 w-16">
                        <PlayIcon />
                    </Link>
                    <div className='flex-grow'></div>
                    <p className="font-bold">Go to my To Do List</p>
                    <button className="text-teal-500 w-12 pl-4" id="GoToToDoListRightArrowButton">
                        <Arrow right/>
                    </button>
                </div>
            )
        }
    }

    const clearAllFilters = () => {
        searchParams.delete("filters");
        searchParams.delete("query");
        setSearchParams(searchParams);
    }

    return (
        <div className="container mx-auto p-4">
            <div className="">
                <h1 className="text-7xl text-blue-450">
                    Learn
                </h1>
                <div className="flex">
                    <p className="font-bold basis-1/2 py-3">
                        Let us suggest your videos based on your To Do items, or browse and search for videos yourself!
                    </p>
                    <div className="basis-1/2"></div>
                </div>
                {playFirstVideo()}
                <VideoFilters/>
                <div className="flex">
                    <div className="rounded-md border-2">
                        <SearchInput/>
                    </div>
                    <div className="flex-grow"></div>
                    <div>Pagination goes here</div>
                </div>

                <button id="ClearFiltersButton" className="regular-font" onClick={() => clearAllFilters()}><p>Clear all</p></button>
                <SearchResultsString searchInput={searchResultsInput}/>
                <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {showVideos()}
               </div>
           </div>
        </div>
    )
}

export default VideosListPage;
