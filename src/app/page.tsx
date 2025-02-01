"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faPlus,
  faEdit,
  faTrash,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { ToDo } from "@/app/_types/ToDo";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";

const Page: React.FC = () => {
  const [todos, setTodos] = useState<ToDo[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortKey, setSortKey] = useState<"dueDate" | "priority" | "completed">(
    "dueDate"
  );

  const router = useRouter();

  useEffect(() => {
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
        const todoResponse: ToDo[] = await response.json();
        setTodos(todoResponse);
      } catch (e) {
        setFetchError(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました"
        );
      }
    };

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
      setTodos(
        (prevTodos) => prevTodos?.filter((todo) => todo.id !== id) || null
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSort = (key: "dueDate" | "priority" | "completed") => {
    setSortKey(key);
    setTodos((prevTodos) => {
      if (!prevTodos) return null;
      return [...prevTodos].sort((a, b) => {
        if (key === "dueDate") {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (key === "priority") {
          const priorityOrder = { low: 1, medium: 2, high: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        } else if (key === "completed") {
          return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
        }
        return 0;
      });
    });
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
      <div className="flex space-x-4">
        <Link href="/admin/posts/new">
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
        <Link href="/admin/categories">
          <button
            type="button"
            className={twMerge(
              "rounded-md px-5 py-1 font-bold",
              "bg-green-500 text-white hover:bg-green-600",
              "disabled:cursor-not-allowed"
            )}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-1" />
            タグの作成
          </button>
        </Link>
      </div>
      <div className="flex space-x-4 mt-4">
        <button
          type="button"
          onClick={() => handleSort("dueDate")}
          className={twMerge(
            "rounded-md px-5 py-1 font-bold",
            "bg-blue-500 text-white hover:bg-blue-600",
            "disabled:cursor-not-allowed"
          )}
        >
          <FontAwesomeIcon icon={faSort} className="mr-1" />
          期限でソート
        </button>
        <button
          type="button"
          onClick={() => handleSort("priority")}
          className={twMerge(
            "rounded-md px-5 py-1 font-bold",
            "bg-blue-500 text-white hover:bg-blue-600",
            "disabled:cursor-not-allowed"
          )}
        >
          <FontAwesomeIcon icon={faSort} className="mr-1" />
          優先度でソート
        </button>
        <button
          type="button"
          onClick={() => handleSort("completed")}
          className={twMerge(
            "rounded-md px-5 py-1 font-bold",
            "bg-blue-500 text-white hover:bg-blue-600",
            "disabled:cursor-not-allowed"
          )}
        >
          <FontAwesomeIcon icon={faSort} className="mr-1" />
          完了でソート
        </button>
      </div>
      <div className="space-y-3 mt-4">
        {todos.map((todo) => (
          <div key={todo.id} className="w-full rounded-md border-2 px-2 py-1">
            <div>
              <div className="font-bold">{todo.title}</div>
              <div>{todo.description}</div>
              <div>期限: {new Date(todo.dueDate).toLocaleDateString()}</div>
              <div>優先度: {todo.priority}</div>
              <div>完了: {todo.completed ? "はい" : "いいえ"}</div>
              <div>
                カテゴリ:{" "}
                {todo.category && todo.category.length > 0
                  ? todo.category.map((cat) => cat.name).join(", ")
                  : "なし"}
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href={`/admin/posts/${todo.id}`}>
                <button
                  type="button"
                  className="w-full rounded-md border-2 px-2 py-1"
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-1" />
                  編集
                </button>
              </Link>
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
