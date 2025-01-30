"use client";
import { useState, useEffect } from "react";
import type { ToDo } from "@/app/_types/ToDo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "next/navigation";

const ToDoDetailPage: React.FC = () => {
  const [todo, setTodo] = useState<ToDo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 動的ルートパラメータから id を取得 （URL:/todos/[id]）
  const { id } = useParams() as { id: string };

  useEffect(() => {
    const fetchToDo = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/todos/${id}`);
        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }
        const todoResponse: ToDo = await response.json();
        setTodo(todoResponse);
      } catch (e) {
        setFetchError(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchToDo();
  }, [id]);

  if (fetchError) {
    return <div>{fetchError}</div>;
  }

  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!todo) {
    return <div>ToDoが見つかりません</div>;
  }

  return (
    <main>
      <div className="text-2xl font-bold">ToDoの詳細</div>
      <div className="mt-4">
        <div className="font-bold">タイトル: {todo.title}</div>
        <div>説明: {todo.description}</div>
        <div>期限: {todo.dueDate}</div>
        <div>優先度: {todo.priority}</div>
        <div>完了: {todo.completed ? "はい" : "いいえ"}</div>
      </div>
    </main>
  );
};

export default ToDoDetailPage;
