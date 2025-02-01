"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { ToDo } from "@/app/_types/ToDo";

type CategoryApiResponse = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type SelectableCategory = {
  id: string;
  name: string;
  isSelect: boolean;
};

const EditToDoPage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const [todo, setTodo] = useState<Partial<ToDo>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [categories, setCategories] = useState<SelectableCategory[] | null>(
    null
  );

  const fetchToDo = useCallback(async () => {
    try {
      const requestUrl = `/api/todos/${id}`;
      const response = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("ToDoの取得に失敗しました");
      }
      const todoResponse: ToDo = await response.json();
      setTodo(todoResponse);
    } catch (e) {
      setFetchError(
        e instanceof Error ? e.message : "予期せぬエラーが発生しました"
      );
    }
  }, [id]);

  const fetchCategories = useCallback(async () => {
    try {
      const requestUrl = "/api/categories";
      const response = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("カテゴリの取得に失敗しました");
      }
      const categoryResponse: CategoryApiResponse[] = await response.json();
      setCategories(
        categoryResponse.map((category) => ({
          id: category.id,
          name: category.name,
          isSelect:
            todo.category?.some((cat) => cat.id === category.id) || false,
        }))
      );
    } catch (e) {
      setFetchError(
        e instanceof Error ? e.message : "予期せぬエラーが発生しました"
      );
    }
  }, [todo.category]);

  useEffect(() => {
    fetchToDo();
  }, [fetchToDo]);

  useEffect(() => {
    if (todo.id) {
      fetchCategories();
    }
  }, [fetchCategories, todo.id]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...todo,
          category: categories
            ?.filter((category) => category.isSelect)
            .map((category) => ({ id: category.id, name: category.name })),
        }),
      });
      if (!response.ok) {
        throw new Error("ToDoの更新に失敗しました");
      }
      router.push("/"); // 保存後に localhost:3000 にリダイレクト
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchCategoryState = (categoryId: string) => {
    if (!categories) return;

    setCategories(
      categories.map((category) =>
        category.id === categoryId
          ? { ...category, isSelect: !category.isSelect }
          : category
      )
    );
  };

  if (fetchError) {
    return <div>{fetchError}</div>;
  }

  if (!todo.id || !categories) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <main>
      <div className="text-2xl font-bold">ToDoの編集</div>
      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="title" className="block font-bold">
            タイトル
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="w-full rounded-md border-2 px-2 py-1"
            value={todo.title || ""}
            onChange={(e) => setTodo({ ...todo, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block font-bold">
            説明
          </label>
          <input
            type="text"
            id="description"
            name="description"
            className="w-full rounded-md border-2 px-2 py-1"
            value={todo.description || ""}
            onChange={(e) => setTodo({ ...todo, description: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="dueDate" className="block font-bold">
            期限
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            className="w-full rounded-md border-2 px-2 py-1"
            value={todo.dueDate || ""}
            onChange={(e) => setTodo({ ...todo, dueDate: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="priority" className="block font-bold">
            優先度
          </label>
          <select
            id="priority"
            name="priority"
            className="w-full rounded-md border-2 px-2 py-1"
            value={todo.priority || "low"}
            onChange={(e) =>
              setTodo({
                ...todo,
                priority: e.target.value as "low" | "medium" | "high",
              })
            }
            required
          >
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
        </div>
        <div>
          <label htmlFor="completed" className="block font-bold">
            完了
          </label>
          <input
            type="checkbox"
            id="completed"
            name="completed"
            className="rounded-md border-2 px-2 py-1"
            checked={todo.completed || false}
            onChange={(e) => setTodo({ ...todo, completed: e.target.checked })}
          />
        </div>
        <div>
          <div className="font-bold">カテゴリ</div>
          <div className="flex flex-wrap gap-x-3.5">
            {categories.length > 0 ? (
              categories.map((category) => (
                <label key={category.id} className="flex space-x-1">
                  <input
                    id={category.id}
                    type="checkbox"
                    checked={category.isSelect}
                    className="mt-0.5 cursor-pointer"
                    onChange={() => switchCategoryState(category.id)}
                  />
                  <span className="cursor-pointer">{category.name}</span>
                </label>
              ))
            ) : (
              <div>選択可能なカテゴリが存在しません。</div>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleSave}
            className={twMerge(
              "rounded-md px-5 py-1 font-bold",
              "bg-indigo-500 text-white hover:bg-indigo-600",
              "disabled:cursor-not-allowed"
            )}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faSave} className="mr-1" />
            )}
            保存
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/todos")}
            className="w-full rounded-md border-2 px-2 py-1"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-1" />
            キャンセル
          </button>
        </div>
      </div>
    </main>
  );
};

export default EditToDoPage;
