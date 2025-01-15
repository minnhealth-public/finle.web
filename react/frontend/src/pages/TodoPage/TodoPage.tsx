import React, { useEffect, useState } from 'react';
import { getTodos } from '../../api/todos';
import { useQuery } from '@tanstack/react-query';
import Todo from '../../models/todo';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import TodoCard from '../../components/TodoCard/TodoCard';
import {PageSubtitle, PageTitle} from '../../shared/View';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../../store';
import ListIcon from '../../shared/Icon/ListIcon';
import GridIcon from '../../shared/Icon/GridIcon';

const TodoPage: React.FC = () => {

  const axiosPrivate = useAxiosPrivate();
  const { careTeam, setTodos } = useStore()
  const [searchParams, setSearchParams] = useSearchParams();
  const [displayType, setDisplayType] = useState(searchParams.get("display") || "list")


  const todosQuery = useQuery<Todo[]>({
    queryKey: ["todos", careTeam?.id],
    queryFn: () => getTodos(axiosPrivate, careTeam.id),
  })

  useEffect(() => { }, [careTeam])
  useEffect(() => { if (todosQuery.data) setTodos(todosQuery.data) }, [todosQuery.data])

  const displayGridTodos = () => {
    if (!todosQuery.data) {
      return <></>
    }

    const todoGroups = groupTodosByCategory(todosQuery.data)
    let groups = []
    let todoIdx = 0;
    for (const category in todoGroups) {
      groups.push(
        <div key={category} className="border-b-2 py-8 border-primary ">

          <h3 className="text-6xl text-header ">
            {category}
          </h3>
          <div className="md:grid md:grid-cols-2 pt-4">
            {todoGroups[category].sort(sortTodos).map((todo: Todo, idx: number) => {
              todoIdx += 1;
              return <TodoCard key={idx} id={`todo-${todoIdx}`} todo={todo} />
            })}
          </div>
        </div>
      )
    }
    return groups
  }

  const groupTodosByCategory = (todos: Todo[]) => {
    return todos.reduce((groupedTodos: any, todo: Todo) => {
      const category = todo.topic.name;
      if (!groupedTodos[category]) {
        groupedTodos[category] = [];
      }
      groupedTodos[category].push(todo);
      return groupedTodos;
    }, {});
  };

  const updateDisplay = (newDisplayType: string) => {
    setDisplayType(newDisplayType);
    setSearchParams({ display: newDisplayType })
  }

  const sortTodos = (todo1: Todo, todo2: Todo) => {
    if (!!todo1.status?.completedTimestamp != !!todo2.status?.completedTimestamp) {
      return (!!todo1.status?.completedTimestamp) - (!!todo2.status?.completedTimestamp);
    } else {
      let ranking1 = todo1.ranking == null ? todo2.ranking + 1 : todo1.ranking;
      let ranking2 = todo2.ranking == null ? todo1.ranking + 1 : todo2.ranking;
      return ranking1 - ranking2;
    }
  }

  const displayListTodos = () => {
    return (
      <div className="mt-4">
        {todosQuery.data && todosQuery.data.sort(sortTodos).map((todo: Todo, idx: number) => {
          return (
            <div key={idx} id={`todo-${idx}`} className="bg-white-1">
              <TodoCard todo={todo} />
              {idx !== todosQuery.data.length - 1 && <div className="border-b-2 border-primary"></div>}
            </div>
          )
        })}
      </div>
    )
  }


  return (
    <div id="todo-page" className="container mx-auto mb-14">
      <div id="todo-title" className="md:basis-2/5 mt-6 space-y-4 ">
        <PageTitle>To Do</PageTitle>
        <div className="md:flex items-center">
          <PageSubtitle>To help guide you in financial and legal planning, we've created a To Do List for you.</PageSubtitle>
        </div>
      </div>
      <div className="text-lg font-extrabold flex">
        <div className="ml-auto flex items-center gap-4 ">
          Change View
          <div
            id="listView"
            className={`
            w-10 h-10 rounded-full cursor-pointer
            ${(displayType === "list" ?
                "bg-gray-300 hover:bg-primary hover:text-white-1" :
                "hover:text-primary bg-white-1"
              )}
          `}
            onClick={() => updateDisplay("list")}
          >
            <ListIcon className="w-5 m-auto" />
          </div>
          <div
            id="categoryView"
            className={`
            w-10 h-10 rounded-full cursor-pointer
            ${(displayType === "grid" ?
                "bg-gray-300 hover:bg-primary hover:text-white-1" :
                "hover:text-primary bg-white-1"
              )}
          `}
            onClick={() => updateDisplay("grid")}
          >
            <GridIcon className="w-5 m-auto" />
          </div>
        </div>
      </div>

      {todosQuery.isLoading && "..."}
      {todosQuery.data && (
        displayType === "list" ? displayListTodos() : displayGridTodos()
      )
      }
    </div>
  );
};

export default TodoPage;
