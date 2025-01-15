import React from 'react';
import Todo from '../../models/todo';
import { Link } from 'react-router-dom';
import CheckIcon from '../../shared/Icon/CheckIcon';
interface TodoCardProps {
  todo: Todo
}

const TodoCard: React.FC<TodoCardProps> = ({ todo }) => {
  return (
    <div className="bg-white p-8 md:basis-5/12 group hover:bg-tan-100 rounded cursor-pointer h-auto overflow-hidden flex flex-col justify-center">
      <Link className="cursor-pointer" to={`/todos/${todo.id}`}>
        <div
          className={`
            ${todo?.status?.completedTimestamp && "text-gray-350"}
          `}
        >
          <h4 className="text-5xl font-semibold mb-2 group-hover:text-primary_alt line-clamp-2 pb-1">{todo.title}</h4>
          <p
            className={`mb-4 line-clamp-3
              ${todo?.status?.completedTimestamp && "max-h-12"}`}
          >
            {todo.shortDescription}
          </p>
          <div className="flex space-x-4 text-primary justify-between items-center">
            {todo?.status?.completedTimestamp ?
              <div className="flex space-x-4 items-center">
                <div className="uppercase font-bold ">Completed</div>
                <div className="items-center rounded-full bg-primary w-8 h-8 p-1.5 text-white-1">
                  <CheckIcon />
                </div>
              </div>
              :
              <button className="btn-primary">
                {todo?.status?.modifiedTimestamp ?
                  "Finish Now" :
                  "Start"
                }
              </button>
            }
          </div>
        </div>
      </Link>
    </div>
  );
};

export default TodoCard;
