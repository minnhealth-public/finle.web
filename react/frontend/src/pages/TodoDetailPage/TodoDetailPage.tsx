import React, { SyntheticEvent, useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTodo, getTodoClips, postTaskFields } from '../../api/todos';
import Todo, { TeamTaskField, VideoClip } from '../../models/todo';
import { useStore } from '../../store';
import VideoCarousel from '../../shared/View/VideoCarousel';
import ChevronIcon from '../../shared/Icon/ChevronIcon';
import CheckIcon from '../../shared/Icon/CheckIcon';
import Resource from '../../models/resource';
import { NotesSection } from '../../components/NotesSection';
import { logEventWithTimestamp } from "../../lib/analytics";

const TodoDetailPage: React.FC = () => {

  const axiosPrivate = useAxiosPrivate();
  const params = useParams<{ id: string }>();
  const todoId: string | undefined = params.id;
  const [todo, setTodo] = useState(null);
  const queryClient = useQueryClient();
  const { careTeam, user, showTutorial, setTutorial, tutorial } = useStore();
  const formRef = useRef(null);
  const submitRef = useRef(null);

  const { status, data, isLoading } = useQuery<Todo>({
    queryKey: ["todo", careTeam?.id, todoId],
    queryFn: () => getTodo(axiosPrivate, careTeam?.id, parseInt(todoId))
  })

  const clipsQuery = useQuery<VideoClip[]>({
    queryKey: ["todo-clips", careTeam?.id, todoId],
    queryFn: () => getTodoClips(axiosPrivate, careTeam?.id, parseInt(todoId))
  })

  useEffect(() => {
    if (data) {
      setTodo(data);
      if (showTutorial) {
        setTimeout(() => {
          setTutorial({ run: true, stepIndex: tutorial.stepIndex })
        }, 200)
      }
    }

  }, [status, data])


  const createTeamTaskFieldsMutation = useMutation({
    mutationFn: (tTaskFields: TeamTaskField[]) => postTaskFields(
      axiosPrivate, tTaskFields, careTeam.id, parseInt(todoId)
    ),
    onSuccess: (data: Todo) => {
      // When we successfully update task fields we'll want to pull in the updated todo
      queryClient.invalidateQueries({ queryKey: ['todo', careTeam.id, todoId] })
      toast.success("Successfully saved task.");
    },
    onError: () => {
      toast.error("Error saving task.");
    }
  })

  const submitTodo = (evt: SyntheticEvent) => {
    evt.preventDefault();
    submitTodoForm(evt.target as HTMLFormElement);
  }


  const submitTodoForm = (formElement: HTMLFormElement): Promise<any> => {
    const taskFields: any = {}
    if (!todo)
      return

    let formData = new FormData(
      document.getElementById("todo-form"),
      document.querySelector("button[value=Submit]")
    );

    for (const key of formData.keys()) {
      let elem = formRef.current.querySelector(`[name=${key}]`);
      let value = formData.getAll(key).join(",");
      let id = elem.getAttribute("data-task-field-id");

      // For checkboxes, if 'on' remove hidden off field value
      if (value.includes("on")) {
        value = "on"
      } else if (value == 'off') {
        value = ""
      }

      if (user?.id && careTeam?.id) {
        const teamTaskField: TeamTaskField = {
          userId: user.id,
          teamId: careTeam.id,
          value: (value as string),
          taskFieldId: id
        }
        taskFields[id] = teamTaskField
      }

    }

    createTeamTaskFieldsMutation.mutate(Object.values(taskFields));
    submitRef.current.blur();
  }

  const submitAndPrint = () => {
    submitTodoForm((document.getElementById("todo-form") as HTMLFormElement));
    setTimeout(() => {
      printForm()
    }, 500);
  }

  const printForm = () => {
    logEventWithTimestamp('task_print', { 'task_id': todoId})

    // submit Todo in case of change.
    if (!todo.title) {
      return
    }

    var prtContent = formRef.current;

    var WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    const head = document.createElement("head");
    const body = document.createElement("div");
    head.insertAdjacentHTML(
      "afterbegin",
      `
        <style>
          textarea, input[type="text"] {
            text-decoration: underline;
            border: none;
            outline: none;
          }
        </style>
      `
    );
    body.insertAdjacentHTML(
      "afterbegin",
      `
      <h1>${todo.title}</h1>
      <span style="font-size:12px;">generated on ${dateString((new Date()).toString())} </span>
      ${prtContent.innerHTML}
      `
    );
    WinPrint.document.head.innerHTML = head.innerHTML
    WinPrint.document.body.appendChild(body)
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  }

  const dateString = (dateString: string): string => {
    const date: Date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
  }

  return (
    <div id="todo-details-page" className="container mx-auto p-4">
      <div className="">
        <div id="back" className="my-10">
          <Link
            className="text-primary hover:text-primary_alt uppercase font-bold text-xl relative"
            to={'/todos'}
            onClick={() => logEventWithTimestamp('tasks_back', { "task_id": todo.id })}
          >
            <div className="w-3 absolute left-0 top-1" >
              <ChevronIcon />
            </div>
            <div className="pl-5">To Dos</div>
          </Link>
        </div>
        {isLoading && "..."}
        {
          todo && (() => {
            return (
              <>
                <h4 className="text-2xl mb-8">{todo.topic.name}</h4>
                <h2 id="todo-title" className="text-header font-bold text-6xl">
                  <div className="md:flex gap-4">
                    <div className="md:w-2/3">{todo.title}</div>
                    <div>{todo?.status?.completedTimestamp &&
                      <div className="w-20 text-primary"><CheckIcon /></div>
                    }
                    </div>
                  </div>
                </h2>
                {
                  todo?.status?.completedTimestamp &&
                  <p className="font-bold">This To Do has been completed on {dateString(todo.status.completedTimestamp)}</p>
                }
                <div
                  id="todo-recommended"
                  className="relative rounded-lg bg-opacity-75 bg-white-50 py-10 my-4 "
                >
                  <div className="absolute bg-primary text-white-1 font-semibold top-0 left-0 uppercase px-3.5 py-1.5 text-xs">
                    Recommended
                  </div>
                  {clipsQuery?.data &&
                    <VideoCarousel
                      videos={clipsQuery.data}
                      perPage={4}
                    />
                  }
                </div>

                <div id="todo-container" className="md:flex md:gap-12 mt-8">
                  <div className="md:w-2/3">
                    <form
                      id="todo-form"
                      className="todo-full-description bg-white-1"
                      onSubmit={(evt: SyntheticEvent) => submitTodo(evt)}
                    >
                      <div ref={formRef} id="printable-form" dangerouslySetInnerHTML={{ __html: todo.fullDescription }}></div>
                      <div className="flex gap-8">
                        <button
                          className="btn-primary self-start"
                          type="submit"
                          ref={submitRef}
                        >
                          {createTeamTaskFieldsMutation.isPending ? "Sending" : "Submit"}
                        </button>
                        <div className="flex-grow"></div>
                      </div>
                    </form>
                  </div >
                  <div className="border-r-2 border-primary"></div>
                  <div
                    id="todo-supplemental"
                    className="md:w-1/3 md:mt-0 mt-8 flex flex-col gap-3 bg-white-1"
                  >
                    <div className="flex gap-4 items-end mb-4">
                      <button
                        className="btn-primary self-end"
                        onClick={(evt: SyntheticEvent) => {
                          submitAndPrint()
                          evt.currentTarget.blur();
                        }}>
                        print
                      </button>
                    </div>
                    {todo.relatedResources.length > 0 && <h4 className="text-2xl text-primary_alt">Related Resources</h4>}
                    {todo.relatedResources.map((resource: Resource, idx: number) => {
                      return <Link
                        key={idx}
                        className="font-bold hover:underline"
                        to={"/resources"}
                        target="_blank">
                        {resource.title}
                      </Link>
                    })}
                  </div>
                </div >
                <div className="flex flex-col bg-white-50 mt-10 px-8 py-8 rounded-lg">
                  <NotesSection todoId={todo.id} />
                </div>
              </>
            );
          })()}
      </div >
    </div >
  );
};

export default TodoDetailPage;
