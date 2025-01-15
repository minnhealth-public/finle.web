import React, {useEffect, useMemo, useRef, useState} from "react";
import { useQuery } from "@tanstack/react-query";
import VideoCard from "../../components/VideoCard/VideoCard";
import { SearchInput } from '../../shared/Form';
import { PlayIcon } from "../../shared/Icon";
import { ShortPagination, getShorts } from "../../api/shorts";
import { Link, useSearchParams } from "react-router-dom";
import VideoFilters from "../../components/VideoFilters/VideoFilters";
import {PageSubtitle, PageTitle} from "../../shared/View";
import { useStore } from "../../store";
import Pagination from "../../components/Pagination";
import { VideoClip } from "../../models/todo";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import PleaseCreateTeam from "../../components/PleaseCreateTeam";

const VideosListPage: React.FC = () => {
  const { careTeam, setClips } = useStore()
  const searchRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResultsInput] = useState<string>('');
  const [filteredVideos, setFilteredVideos] = useState<VideoClip[]>([]);
  const axiosPrivate = useAxiosPrivate();

  const filters = useMemo(() => {
    return searchParams.toString();
  }, [searchParams]);

  // Page data
  const [currentPage, setCurrentPage] = useState<number>((searchParams.get("page") ? parseInt(searchParams.get("page")) : 1));
  const pageSize = 12;

  const { data, isError, error, isLoading } = useQuery<ShortPagination, Error>({
    queryKey: ["shorts", filters], // page is included in filters
    queryFn: () => getShorts(axiosPrivate, careTeam?.id, filters),
    enabled: !!careTeam
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

  useEffect(() => {
    let params = new URLSearchParams();

    if (params.get("page") === searchParams.get("page")) {
      searchParams.set("page", "1");
    }
    setSearchParams(searchParams);

  }, [searchParams])

  // this use effect watches the searchParams and updates the filter set
  useEffect(() => {
    setCurrentPage(parseInt(searchParams.get('page')))
    if (!isLoading && data?.results) {
      setFilteredVideos(data.results || []);
      setClips(data.results);
    }

  }, [setFilteredVideos, searchParams, currentPage, data])

  const hasNoFilters = (): boolean => {
    const paramsKeys = Array.from(searchParams.keys());
    if (paramsKeys.length == 0) {
      return true;
    } else {
      return paramsKeys.length === 1 && paramsKeys[0] == "page"
    }
  }

  let showVideos = () => {
    if (isLoading) {
      return <h2>Is Loading</h2>
    } else if (isError) {
      console.error("Failed to fetch shorts.")
      console.error("Error occurred while fetching shorts from /api/shorts: ", error);
      return <h2>Error</h2>
    } else {
      if (currentPage === 1 && hasNoFilters()) {
        return <>
          {data.results.slice(4)
            .map((video: VideoClip, idx: number) => (
              <VideoCard key={idx} video={video} parentSearchParams={searchParams}/>
            ))}
        </>
      } else {
        return <>
          {data.results
            .map((video: VideoClip, idx: number) => (
              <VideoCard key={idx} video={video} parentSearchParams={searchParams} />
            ))}
        </>
      }
    }
  }

  const showRecommendedVideos = () => {
    if (isLoading) {
      return <h2>Is Loading</h2>
    } else if (error) {
      console.error("Failed to fetch shorts.")
      console.error("Error occurred while fetching shorts from /api/shorts: ", error);
      return <h2>Error</h2>
    } else {
      if (currentPage === 1 && hasNoFilters()) {
        return (
          <div id="recommended" className="bg-white-50 bg-opacity-75 pt-14 pb-6 px-10 rounded-lg mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 relative">
            <div className="absolute bg-primary text-white-1 font-semibold top-0 left-0 uppercase px-3.5 py-1.5 text-md">
              Recommended
            </div>

            {data?.results.slice(0, 4).map((video: VideoClip, idx: number) => {
              return <VideoCard key={idx} video={video} parentSearchParams={searchParams}/>
            })}
          </div>
        )
      }
    }
  }

  const clearAll = () => {
    setSearchParams({});
    searchRef.current.value = ''
  }

  return (
    <div id="videos-list-page" className="container mx-auto mb-14">
      <div id="videos-list-title" className="md:basis-2/5 mt-6 space-y-4 ">
        <PageTitle>Videos</PageTitle>
      </div>
      <div className="md:flex items-center">
        <PageSubtitle>Explore our video library. Use what you learn from these videos to complete the To Do tasks.</PageSubtitle>

        <div className="basis-1/2 flex">
          <div className="md:flex-grow"></div>
          <div id="start-watching" className="flex items-center my-4 bg-white-50 p-8 py-10 rounded-lg bg-opacity-75">
            {data?.results &&
              <Link to={`/videos/${data.results[0] ? data.results[0].id : ''}`} className="group flex gap-4">
                <div className="text-primary_alt w-16 group-hover:text-primary">
                  <PlayIcon />
                </div>
                <div className="flex-col font-bold text-xl font-arial group-hover:underline ">
                  <p>Click here to start<br></br> watching videos now</p>
                </div>
              </Link>
            }
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 my-4">
        <div className="flex items-baseline">
          <SearchInput ref={searchRef} />
          <div>
            <button id="reset-button"
              className="
              mx-6 font-sans text-gray-350 font-bold uppercase text-md bold
              hover:text-gray-400 active:text-gray-400 focus:text-gray-400
            "
              onClick={() => clearAll()}>reset</button>
          </div>
        </div>
        <VideoFilters />
      </div>
      {isLoading && "..."}
      {careTeam ? <>
        {
          filteredVideos.length > 0 && data ?
            <>
              <div className="flex my-4">
                <div className="flex-grow"></div>
                <Pagination perPage={pageSize} length={data?.count} onPageChange={setCurrentPage} />
              </div>

              <SearchResultsString searchInput={searchResultsInput} />
              {showRecommendedVideos()}
              <div className="mx-auto grid grid-cols-1 gap-y-20 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-14 px-10 ">
                {showVideos()}
              </div>

              <div className="flex px-10">
                <div className="flex-grow"></div>
                <Pagination perPage={pageSize} length={data?.count} onPageChange={setCurrentPage} />
              </div>
            </> :
            <h3 className="text-center my-10"> No Results found</h3>
        }
      </> : <PleaseCreateTeam />}
    </div >
  )
}

export default VideosListPage;
