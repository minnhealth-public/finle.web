import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";

import { DeleteFilterIcon, AddFilterIcon } from '../../shared/Icon';
import { Filter, Task, Tag } from '../../models/Filter';
import { getFilters } from '../../api/filters';
import { useStore } from '../../store';
import Topic from '../../models/topic';


interface FilterButtonProps {
  tagString: string
  tagValue: string
  queryParam: string
  onEnable: (tagString: string, queryParam: string) => void
  onDisable: (tagString: string, queryParam: string) => void
}

export const FilterButton: React.FC<FilterButtonProps> = ({ tagString, tagValue, queryParam, onDisable, onEnable }) => {
  let [searchParams, setSearchParams] = useSearchParams();

  function isFilterEnabled() {
    return searchParams.getAll(queryParam).includes(tagValue);
  }

  const filterEnabled = isFilterEnabled();
  const addOrRemoveIcon = filterEnabled ? <DeleteFilterIcon /> : <AddFilterIcon />;

  return (
    <button
      className={`
            transition-all duration-1000 border-grey-450 border-2 rounded-lg
            px-3 py-1
            ${filterEnabled ?
          "border-primary_alt text-white-1 bg-primary_alt hover:text-primary hover:bg-white-1  " :
          "text-primary_alt hover:text-primary bg-white-1"} `
      }
      onClick={
        filterEnabled ?
          () => onDisable(tagValue, queryParam) :
          () => onEnable(tagValue, queryParam)
      }>
      <div className="flex gap-2">
        <p className="font-arial text-lg">{tagString}</p>
        <div className="w-6">{addOrRemoveIcon}</div>
      </div>
    </button>
  );
}

//TODO as well here set the filters in the url.
const TopicFilters: React.FC = () => {
  let [searchParams, setSearchParams] = useSearchParams();
  const { setTopics } = useStore();

  const filtersQuery = useQuery<Filter[], Error>({
    queryKey: ["filters"],
    queryFn: getFilters
  });

  useEffect(() => {
    if (filtersQuery.data) {
      setTopics(filtersQuery.data as Topic[])
    }

  }, [filtersQuery.data])

  const enableFilter = (tagString: string, queryParam: string) => {
    searchParams.append(queryParam, tagString);
    setSearchParams(searchParams);
  }

  const disableFilter = (tagString: string, queryParam: string) => {
    const topics = filtersQuery.data || [];

    const searchTags = searchParams.getAll("tags");

    if (queryParam === "topics") {
      const topic: Filter = topics.find((filter: Filter) => filter.id.toString() === tagString)
      // remove all tasks that are under this.
      searchParams.getAll("tasks").forEach((taskId: string) => {
        topic.tasks?.forEach((task: Task) => {
          if (task.id.toString() === taskId)
            searchParams.delete("tasks", taskId);

          searchTags.forEach((tagName: string) => {
            if (task.tags.map((tag: Tag) => tag.name).indexOf(tagName) !== -1)
              searchParams.delete("tags", tagName);
          })

        })
      })
    } else if (queryParam === "tasks") {
      let task: Task;
      topics.forEach((filter: Filter) => {
        const taskTmp = filter.tasks.find((task: Task) => {
          return task.id.toString() === tagString
        })

        if (taskTmp) {
          task = taskTmp
        }
      }
      )

      searchTags.forEach((tagId: string) => {
        if (task.tags.map((tag: Tag) => tag.id).indexOf(parseInt(tagId)) !== -1)
          searchParams.delete("tags", tagId);
      })
    }
    searchParams.delete(queryParam, tagString);
    setSearchParams(searchParams);
  }

  const showTags = () => {
    if (!filtersQuery.data)
      return

    const tags: Tag[] = [];

    filtersQuery.data
      .filter((filter: Filter) => {
        return searchParams.getAll("topics").includes(filter.id.toString());
      })
      .forEach((filter: Filter) =>
        filter.tasks
          .filter((task: Task) => {
            return searchParams.getAll("tasks").includes(task.id.toString());
          })
          .forEach((task: Task) =>
            task.tags.map((tag: Tag) => tags.push(tag))
          )
      );

    // remove dups
    const tagSetArr = Array.from(new Set(tags));
    const tagFilters = tagSetArr.map((tag: Tag, idx: number) =>
      <FilterButton
        key={idx}
        tagString={tag.name}
        tagValue={tag.id.toString()}
        queryParam='tags'
        onDisable={disableFilter}
        onEnable={enableFilter}
      />
    )

    if (tagFilters.length > 0)
      return <>
        <div className="flex flex-row items-center gap-2 animate-reveal">
          <div className="border-b-2 border-primary w-10" />
          <div className="font-bold text-primary_alt">Tags</div>
          <div className="border-b-2 border-primary flex-grow" />
        </div>
        <div id="tag-filters" className="flex gap-2 flex-wrap animate-reveal">
          {tagFilters}
        </div>
      </>
  }

  const showTasks = () => {
    if (!filtersQuery.data)
      return

    const filters = filtersQuery.data
      .filter((filter: Filter) => {
        return searchParams.getAll("topics").includes(filter.id.toString());
      })
      .map((filter: Filter) => {
        return filter.tasks.map((value: Task) => {
          return (
            <FilterButton
              key={value.id}
              tagString={value.title}
              tagValue={value.id.toString()}
              queryParam='tasks'
              onDisable={disableFilter}
              onEnable={enableFilter}
            />
          )
        })
      });

    if (filters.length > 0) {
      return <>
        <div className="flex flex-row items-center gap-2 animate-reveal">
          <div className="border-b-2 border-primary w-10" />
          <div className="font-bold text-primary_alt">Tasks</div>
          <div className="border-b-2 border-primary flex-grow" />
        </div>
        <div id="task-filters" className="flex gap-2 flex-wrap animate-reveal">
          {filters}
        </div>
      </>
    }
  }

  return (
    <div id="TopicFilters" className='flex flex-col gap-4'>
      {/*two main filters - Financial, Legal*/}
      <div className="flex gap-2 flex-wrap">
        <div id="topic-filters" className="flex gap-2 flex-wrap">
          {filtersQuery.data && filtersQuery.data.map((filter: Filter, idx: number) => {
            return <FilterButton
              key={idx}
              queryParam={'topics'}
              tagString={filter.name}
              tagValue={filter.id.toString()}
              onDisable={disableFilter}
              onEnable={enableFilter}

            />
          })}
        </div>
        <span className="border-l-2 border-primary m-2"></span>
        <div id="watched-saved-filters" className="flex gap-2 flex-wrap">
          <FilterButton
            queryParam={'played'}
            tagString={"Played"}
            tagValue={"played"}
            onDisable={disableFilter}
            onEnable={enableFilter}
          />
          <FilterButton
            queryParam={'unplayed'}
            tagString={"Unplayed"}
            tagValue={"unplayed"}
            onDisable={disableFilter}
            onEnable={enableFilter}
          />
          {/*<FilterButton*/}
          {/*  queryParam={'saved'}*/}
          {/*  tagString={"Saved"}*/}
          {/*  tagValue={"saved"}*/}
          {/*  onDisable={disableFilter}*/}
          {/*  onEnable={enableFilter}*/}
          {/*/>*/}
        </div>
      </div>
      {/* Show the tasks associated with selected filter*/}
      {showTasks()}
      {/*Dynamic filters pulled from tags */}
      {/*showTags()*/}
    </div >
  );
}

export default TopicFilters;
