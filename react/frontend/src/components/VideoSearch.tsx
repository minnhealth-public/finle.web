import React, {useState, SyntheticEvent} from "react";
import {SearchIcon} from "../shared/Icon";
import { Video } from "../models";
import { useSearchParams } from "react-router-dom";

interface VideoCardProps {
    allVideos: Video[]
}

export const VideoSearch: React.FC<VideoCardProps> = ({allVideos}) => {
    let [searchParams, setSearchParams] = useSearchParams();
    const onSubmitSearch = (e: SyntheticEvent): void => {
        e.preventDefault();
        const target = e.target as HTMLFormElement;
        const value: string = target.query.value;

        //TODO use url to set the search for over views to grab to make this easier no need to pass around state if it's in the url
        const videoSearchResults: Video[] = allVideos.filter((video: Video) => video.name.toLowerCase().includes(value.toLowerCase())
        );

        searchParams.set("query", value);
        setSearchParams(searchParams);
    }

    return (
        <div className="">
            <form className="rounded-md relative focus-visible:border-grey-450" onSubmit={onSubmitSearch}>
                <input
                  type="text"
                  placeholder="Search"
                  name="query"
                  className="uppercase rounded-md border-2 border-grey-450 w-64 pl-4 py-2"

                />
                <button type="submit" className="absolute top-3 right-4 text-grey-450">
                    <SearchIcon />
                </button>
            </form>
        </div>
    );
}
