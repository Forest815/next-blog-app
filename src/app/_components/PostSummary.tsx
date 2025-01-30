"use client";
import type { ToDo } from "@/app/_types/ToDo";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import DOMPurify from "isomorphic-dompurify";
import Link from "next/link";

type Props = {
  todo: ToDo;
};

const ToDoSummary: React.FC<Props> = (props) => {
  const { todo } = props;
  const dtFmt = "YYYY-MM-DD";

  return (
    <div className="flex items-center justify-between border-b pb-2">
      <div>
        <div className="font-bold">{todo.title}</div>
        <div>{DOMPurify.sanitize(todo.description)}</div>
        <div>期限: {dayjs(todo.dueDate).format(dtFmt)}</div>
        <div>優先度: {todo.priority}</div>
        <div>完了: {todo.completed ? "はい" : "いいえ"}</div>
      </div>
      <div className="flex space-x-2">
        <Link href={`/todos/edit/${todo.id}`}>
          <button
            type="button"
            className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
          >
            編集
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ToDoSummary;
