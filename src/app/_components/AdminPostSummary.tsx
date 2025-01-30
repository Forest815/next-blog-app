"use client";
import { useState } from "react";
import type { ToDo } from "@/app/_types/ToDo";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import DOMPurify from "isomorphic-dompurify";
import Link from "next/link";

type Props = {
  todo: ToDo;
  reloadAction: () => Promise<void>;
  setIsSubmitting: (isSubmitting: boolean) => void;
};

const AdminToDoSummary: React.FC<Props> = ({
  todo,
  reloadAction,
  setIsSubmitting,
}) => {
  const [isCompleted, setIsCompleted] = useState(todo.completed);

  const handleToggleComplete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...todo, completed: !isCompleted }),
      });
      if (!response.ok) {
        throw new Error("ToDoの更新に失敗しました");
      }
      setIsCompleted(!isCompleted);
      await reloadAction();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-between border-b pb-2">
      <div>
        <div className="font-bold">{todo.title}</div>
        <div>{DOMPurify.sanitize(todo.description)}</div>
        <div>期限: {dayjs(todo.dueDate).format("YYYY-MM-DD")}</div>
        <div>優先度: {todo.priority}</div>
        <div>完了: {isCompleted ? "はい" : "いいえ"}</div>
      </div>
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={handleToggleComplete}
          className={twMerge(
            "rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600",
            isCompleted && "bg-gray-500 hover:bg-gray-600"
          )}
        >
          {isCompleted ? "未完了にする" : "完了にする"}
        </button>
        <Link href={`/admin/todos/edit/${todo.id}`}>
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

export default AdminToDoSummary;
