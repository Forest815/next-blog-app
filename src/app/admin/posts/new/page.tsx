"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faPlus,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { Category } from "@/app/_types/Category";
import Link from "next/link";

// カテゴリをフェッチしたときのレスポンスのデータ型
type CategoryApiResponse = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

const Page: React.FC = () => {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
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
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        }))
      );
    } catch (e) {
      setFetchError(
        e instanceof Error ? e.message : "予期せぬエラーが発生しました"
      );
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEditCategory = async (updatedCategory: Category) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/categories/${updatedCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCategory),
      });
      if (!response.ok) {
        throw new Error("カテゴリの更新に失敗しました");
      }
      fetchCategories();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("カテゴリの削除に失敗しました");
      }
      fetchCategories();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (fetchError) {
    return <div>{fetchError}</div>;
  }

  if (!categories) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <main>
      <div className="text-2xl font-bold">カテゴリリスト</div>
      <Link href="/admin/categories/new">
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
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between border-b pb-2"
          >
            <div>
              <div className="font-bold">{category.name}</div>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() =>
                  handleEditCategory({ ...category, name: "新しいカテゴリ名" })
                }
                className="h-48 w-full rounded-md border-2 px-2 py-1"
              >
                <FontAwesomeIcon icon={faEdit} className="mr-1" />
                編集
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCategory(category.id)}
                className="h-48 w-full rounded-md border-2 px-3 py-1"
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
