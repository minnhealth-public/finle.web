import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Clip from '../components/Clip/Clip';
import { getClip } from '../api/clips';
import { Video } from '../models';
import { VideoCard } from '../components/VideoCard';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { getRelatedClips, putSaved, putUnsaved } from '../api/shorts';
import Todo, { VideoClip } from '../models/todo';
import ChevronIcon from '../shared/Icon/ChevronIcon';
import { useStore } from '../store';
import LongArrow from '../shared/Icon/LongArrow';
import ToolTip from '../shared/View/ToolTip';
import { NotesSection } from '../components/NotesSection';
import CheckIcon from '../shared/Icon/CheckIcon';
import { logEventWithTimestamp } from "../lib/analytics";
import {PageTitle} from "../shared/View/index.ts";
import {getTodos} from "../api/todos.ts";
import {clipTypeDescriptionMap, clipTypeMap} from "../shared/constants.tsx";
import { useLocation } from 'react-router-dom';


const ClipPage: React.FC = () => {
  const { clips, careTeam, user } = useStore();
  const params = useParams<{ id: string }>();
  const clipId: number | undefined = params.id ? parseInt(params.id) : undefined;
  const [currentTab, setCurrentTab] = useState(0)
  const axiosPrivate = useAxiosPrivate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentIdx] = useState<number>(parseInt(searchParams.get("idx")) || 0);
  // const queryClient = useQueryClient();
  const location = useLocation();
  const listPageSearchParams = location.state?.parentSearchParams ?? new URLSearchParams();

  const [filteredClips] = useState(
    clips.filter((lClip: VideoClip) => lClip.id !== clipId)
  );

  const [nextVideo] = useState(currentIdx >= filteredClips.length ? null : filteredClips[currentIdx]);
  const [prevVideo] = useState(currentIdx === 0 ? null : filteredClips[currentIdx - 1]);


  const { data, isError, isLoading, error } = useQuery<Video, Error>({
    queryKey: ["clip", clipId],
    queryFn: () => getClip(clipId)
  });

  const todosQuery = useQuery<Todo[]>({
    queryKey: ["todos", careTeam?.id],
    queryFn: () => getTodos(axiosPrivate, careTeam.id),
  })

  const relatedClipsQuery = useQuery<Video[]>({
    queryKey: ["related_clips", clipId],
    queryFn: () => getRelatedClips(
      axiosPrivate, clipId)
  });

  useEffect(() => {
    let tab = searchParams.get('tab');
    if (tab === "short" || !(!!tab)) {
      setCurrentTab(0)
    } else if (tab === "medium") {
      setCurrentTab(1)
    } else if (tab === "long") {
      setCurrentTab(2)
    }
  }, [searchParams])

  if (isError || todosQuery.isError) {
    console.error("Had issue fetching clip", error)
  }

  // const saveMutation = useMutation({
  //   mutationFn: (clipId: number) => putSaved(axiosPrivate, clipId),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['clip', data.id] });
  //   }
  // })
  //
  // const unsaveMutation = useMutation({
  //   mutationFn: (clipId: number) => putUnsaved(axiosPrivate, clipId),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['clip', data.id] });
  //   }
  // })

  // const saveVideo = () => { saveMutation.mutate(data.id); }
  // const unsaveVideo = () => { unsaveMutation.mutate(data.id); }

  const taskStatusMap = todosQuery?.data?.reduce((map, todo) => {
    if (todo && todo.id !== undefined) {
      map[todo.id] = todo.status?.completedTimestamp;
    }
    return map;
  }, {}) || {};

  const getDate = (timestamp: string) => {
    var localDate = new Date(timestamp);
    return localDate.toLocaleString('en-US')
  }

  if (isLoading || todosQuery.isLoading) return <>Loading...</>
  if (!data || !todosQuery.data) return <>...</>

  return (
    <div id="clip-page" className="container mx-auto">
      <div id="videos-list-title" className="md:basis-2/5 mt-6 space-y-4">
        <PageTitle>Videos</PageTitle>
      </div>
      <Link
        id="ClipPageBackButton"
        className="link-primary text-xl flex py-9"
        to={`/videos?${listPageSearchParams.toString()}`}
        onClick={() => logEventWithTimestamp('video_back', { "video_id": clipId })}
      >
        <div className="w-[0.5em] mr-2 text-color-400"><ChevronIcon /></div>
        all videos
      </Link>
      <h1 id="clip-title" className="flex flex-row relative text-5xl p-4">
        <div>{data.name}</div>
      </h1>
      <div className="px-4">
        <div className="flex justify-between items-center">
          <div>
            {(data?.watched) &&
              <div className="text-primary font-semibold flex items-center gap-3">
                Last played on {getDate(data?.watchedTimestamp)}
                <div className="bg-primary text-white-1 rounded-full p-1 w-6 h-6">
                  <CheckIcon />
                </div>
              </div>
            }
          </div>
          {/*<div id="save-video">*/}
          {/*  {data.saved ?*/}
          {/*    <button className="btn-primary !text-lg" onClick={() => unsaveVideo()}>Undo Save</button> :*/}
          {/*    <button className="btn-primary !text-lg" onClick={() => saveVideo()}>Save</button>*/}
          {/*  }*/}
          {/*</div>*/}
        </div>

        <div id="clip-tabs" className="md:flex justify-between md:gap-16 sm:gap-2 mt-4">
          <div
            id="short-tab"
            className={`text-header cursor-pointer py-3 w-full text-center bg-white-50 rounded-t-lg font-bold text-3xl flex items-center justify-center hover:opacity-100 focus:opacity-100 ${currentTab === 0 ? "" : "opacity-50"}`}
            onClick={() => {
              searchParams.set("tab", "short");
              setSearchParams(searchParams)
            }}>
            <ToolTip
              helpText={clipTypeDescriptionMap["SHORT"]}
            >
              {clipTypeMap["SHORT"]}
            </ToolTip>
          </div>
          <div
            id="medium-tab"
            className={`text-header cursor-pointer py-3 w-full text-center bg-white-50 rounded-t-lg font-bold text-3xl flex items-center justify-center hover:opacity-100 focus:opacity-100 ${currentTab === 1 ? "" : "opacity-50"}`}
            onClick={() => {
              searchParams.set("tab", "medium");
              setSearchParams(searchParams)
            }} >
            <ToolTip
              helpText={clipTypeDescriptionMap["MEDIUM"]}
            >
              {clipTypeMap["MEDIUM"]}
            </ToolTip>
          </div>
          <div
            id="long-tab"
            className={`text-header cursor-pointer py-3 w-full text-center bg-white-50 rounded-t-lg font-bold text-3xl flex items-center justify-center hover:opacity-100 focus:opacity-100 ${currentTab === 2 ? "" : "opacity-50"}`}
            onClick={() => {
              searchParams.set("tab", "long");
              setSearchParams(searchParams)
            }}>
            <ToolTip
              helpText={clipTypeDescriptionMap["LONG"]}
            >
              {clipTypeMap["LONG"]}
            </ToolTip>
          </div>
        </div>
        {
          currentTab !== 0 ?
            <>

              {(currentTab === 1 && !data.longerClip) || (currentTab === 2 && !data.entireClip) ?
                <div className="bg-white-50">
                  <p className="font-bold text-3xl p-8 ">
                    There isn't a {currentTab === 1 ? "highlight" : "full-length"} video associated with this preview.
                    <br></br>
                    Would you be interested in one of these topics?
                  </p>
                  <div className="pb-12 px-16 mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {relatedClipsQuery.data && relatedClipsQuery.data.map((clip: Video, idx: number) => {
                      return <VideoCard video={clip} key={idx} />
                    })}
                  </div>
                </div>
                :
                <>
                  <Clip clip={(currentTab === 1 ? data.longerClip : data.entireClip) as VideoClip} />
                </>
              }
            </> :
            <Clip clip={data} />
        }

        <div className="md:flex md:items-start">
          <div id="related-todos" className="md:basis-1/2 flex flex-col bg-white-50 py-6 rounded-lg mt-10 px-8 mr-8">
            <div className="mb-4">
              <h3 className="text-primary_alt text-4xl pb-2">
                To Do Tasks
              </h3>
              {data?.tasks.length > 0 && (
                <div className="text-sm">
                  These tasks are related to the video content.
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 flex-grow pb-4">
              {data?.tasks.length > 0 ? (
                data?.tasks.map((task: any) => (
                  <div key={task.id} className="flex items-center">
                    <Link
                      to={`/todos/${task.id}`}
                      onClick={() => logEventWithTimestamp('video_task', {
                        "video_id": clipId,
                        "task_id": task.id
                      })}
                      key={task.id}
                      className="font-bold text-left hover:underline flex"
                    >
                      <input
                        type="checkbox"
                        checked={(task && task.id !== undefined && taskStatusMap[task.id]) || false}
                        readOnly
                        style={{ outline: 'none', pointerEvents: 'none' }}
                      />
                      <p className="text-xl pl-2">{task.title}</p>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-xl text-center py-6 px-5">
                  There doesn't seem to be any tasks related to this video.
                </div>
              )}
            </div>

            <Link
              id="ClipPageGoToTasksButton"
              className="link-primary text-xl flex pt-4"
              to={'/todos'}
            >
              go to tasks
              <div className="w-[0.5em] rotate-180 ml-2 text-color-400"><ChevronIcon /></div>
            </Link>
          </div>

          <div id="notes" className="md:basis-1/2 flex flex-col bg-white-50 py-6 rounded-lg mt-10 px-8 ml-8">
            <NotesSection clipId={data.id} />
          </div>
        </div>

        <div className="md:flex justify-between my-10">
          {prevVideo ?
            <a
              id="previous-thumbnail"
              href={`/videos/${prevVideo.id}?idx=${currentIdx - 1}`}
              className="flex flex-col gap-2 flex-shrink-0 flex-1 font-bold text-primary_alt"
            >
              <div className="flex gap-4 text-2xl">
                <div className="rotate-180 w-6"><LongArrow /></div>
                Previous
              </div>
              <div className="text-black" >
                <VideoCard video={prevVideo} disableLink />
              </div>
            </a>
            : <div className="flex flex-col gap-2 flex-shrink-0 flex-1 uppercase font-bold text-primary_alt"></div>
          }
          <div className="flex-1 grow-[2]"></div>
          {nextVideo ?
            <a
              id="next-thumbnail"
              href={`/videos/${nextVideo.id}?idx=${currentIdx + 1}`}
              className="flex flex-col gap-2 flex-shrink-0 flex-1 font-bold text-primary_alt"
            >
              <div className="flex justify-end gap-4 text-2xl">
                Next
                <div className="w-6"><LongArrow /></div>
              </div>
              <div className="text-black" >
                <VideoCard video={nextVideo} disableLink />
              </div>
            </a>
            : <div className="flex flex-col gap-2 flex-shrink-0 flex-1"></div>
          }
        </div>
      </div >
    </div>
  );
};

export default ClipPage;
