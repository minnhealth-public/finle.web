import React from 'react'
import {useSearchParams} from 'react-router-dom';
import {useQuery} from "@tanstack/react-query";

import { DeleteFilterIcon, AddFilterIcon } from '../../shared/Icon';
import { Tag } from '../../models';
import { getTags } from '../../api/tags';


interface FilterButtonProps {
    tagString: string
}

//TODO as well here set the filters in the url.

const VideoFilters: React.FC = () => {
    let [searchParams, setSearchParams] = useSearchParams();

    const tagsQuery = useQuery<Tag[], Error>({
      queryKey: ["tags"],
      queryFn: getTags
    });

    function enableFilter(tagString: string) {
        searchParams.append("filters", tagString);
        setSearchParams(searchParams);
    }

    function disableFilter(tagString: string) {
        searchParams.delete("filters", tagString);
        setSearchParams(searchParams);
    }

    function isFilterEnabled(tagString: string) {
        return searchParams.getAll("filters").includes(tagString);
    }

    const FilterButton: React.FC<FilterButtonProps> = ({tagString}) => {
        const filterEnabled = isFilterEnabled(tagString);
        const addOrRemoveIcon = filterEnabled ? <DeleteFilterIcon/> : <AddFilterIcon />;

        return (
          <button
                  className={`border-grey-450 border-2 rounded-lg px-3 py-1 ${filterEnabled ? "filter-enabled" : "filter-disabled"} `}
                  onClick={filterEnabled ? () => disableFilter(tagString) : () => enableFilter(tagString)}>
              <div className="flex gap-2">
                  <p className="rounded-font">{tagString}</p>
                  <div className="w-6">{addOrRemoveIcon}</div>
              </div>
          </button>
        );
    }

    const showTags = () => {
        if (tagsQuery.isLoading){
            return <div data-testid="loading-tags">...</div>
        } else if (tagsQuery.error){
            console.error("Failed to fetch tags.")
            console.error("Error occurred while fetching tags from /api/tags: ", tagsQuery.error);
            return <></>
        } else {
            return <> {
                    tagsQuery.data.map((tag, idx) => {
                        return <FilterButton key={idx} tagString={tag.name} />
                    })
                }
            </>
        }
    }

    return (
        <div id="VideoFilters" className='flex flex-col gap-1'>
            {/*Four main filters - Financial, Legal, Medical, Care*/}
            <div className="flex gap-2 flex-wrap">
                <FilterButton tagString={"Financial"} />
                <FilterButton tagString={"Legal"} />
                <FilterButton tagString={"Medical"} />
                <FilterButton tagString={"Care"} />
            </div>
            {/*Dynamic filters pulled from video tags */}
            <div className="flex gap-2 flex-wrap">
                {showTags()}
            </div>
            {/*Additional Filters*/}
            <div className="flex gap-2 flex-wrap">
                <FilterButton tagString={"Saved"} />
                <FilterButton tagString={"Already Watched"} />
            </div>
        </div>
    );
}

export default VideoFilters;
