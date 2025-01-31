"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faPlus,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { ToDo } from "@/app/_types/ToDo";
import Link from "next/link";

// ToDoをフェッチしたときのレスポンスのデータ型
type ToDoApiResponse = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

const Page: React.FC = () => {
  const [todos, setTodos] = useState<ToDo[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const fetchToDos = async () => {
    try {
      const requestUrl = "/api/todos";
      const response = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("ToDoの取得に失敗しました");
      }
      const todoResponse: ToDoApiResponse[] = await response.json();
      setTodos(
        todoResponse.map((todo) => ({
          id: todo.id,
          title: todo.title,
          description: todo.description,
          dueDate: todo.dueDate,
          priority: todo.priority as "low" | "medium" | "high",
          completed: todo.completed,
          createdAt: todo.createdAt,
          updatedAt: todo.updatedAt,
        }))
      );
    } catch (e) {
      setFetchError(
        e instanceof Error ? e.message : "予期せぬエラーが発生しました"
      );
    }
  };

  useEffect(() => {
    fetchToDos();
  }, []);

  const handleDeleteToDo = async (id: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("ToDoの削除に失敗しました");
      }
      fetchToDos();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (fetchError) {
    return <div>{fetchError}</div>;
  }

  if (!todos) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <main>
      <div className="text-2xl font-bold">ToDoリスト</div>
      <Link href="/admin/todos/new">
        <button
          type="button"
          className={twMerge(
            "rounded-md px-5 py-1 font-bold",
            "bg-indigo-500 text-white hover:bg-indigo-600",
            "disabled:cursor-not-allowed"
          )}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          新規作成
        </button>
      </Link>
      <div className="space-y-3">
        {todos.map((todo) => (
          <div key={todo.id} className="w-full rounded-md border-2 px-2 py-1">
            <div>
              <div className="font-bold">{todo.title}</div>
              <div>{todo.description}</div>
              <div>期限: {todo.dueDate}</div>
              <div>優先度: {todo.priority}</div>
              <div>完了: {todo.completed ? "はい" : "いいえ"}</div>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => router.push(`/admin/todos/${todo.id}/edit`)}
                className="w-full rounded-md border-2 px-2 py-1"
              >
                <FontAwesomeIcon icon={faEdit} className="mr-1" />
                編集
              </button>
              <button
                type="button"
                onClick={() => handleDeleteToDo(todo.id)}
                className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
              >
                <FontAwesomeIcon icon={faTrash} className="mr-1" />
                削除
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Page;
