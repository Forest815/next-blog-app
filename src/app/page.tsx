"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faPlus,
  faEdit,
  faTrash,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { ToDo } from "@/app/_types/ToDo";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";

const Page: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [todos, setTodos] = useState<ToDo[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  if (!isClient) {
    return null;
  }

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
    <>
      <main>
        <div className="text-2xl font-bold">ToDoリスト</div>
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
        <div className="space-y-3">
          {todos.map((todo) => (
            <div key={todo.id} className="w-full rounded-md border-2 px-2 py-1">
              <div>
                <div className="font-bold">{todo.title}</div>
                <div>{todo.description}</div>
                <div>期限: {new Date(todo.dueDate).toLocaleDateString()}</div>
                <div>優先度: {todo.priority}</div>
                <div>完了: {todo.completed ? "はい" : "いいえ"}</div>
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
    </>
  );
};

export default Page;
