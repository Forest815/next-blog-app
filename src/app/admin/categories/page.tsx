"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { Category } from "@/app/_types/Category";
import Link from "next/link";

// カテゴリをフェッチしたときのレスポンスのデータ型
type RawApiCategoryResponse = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

const Page: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const requestUrl = "/api/categories";
      const res = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });
      if (!res.ok) {
        setCategories(null);
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      const apiResBody = (await res.json()) as RawApiCategoryResponse[];
      setCategories(
        apiResBody.map((body) => ({
          id: body.id,
          name: body.name,
        }))
      );
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `カテゴリの一覧のフェッチに失敗しました: ${error.message}`
          : `予期せぬエラーが発生しました ${error}`;
      console.error(errorMsg);
      setFetchErrorMsg(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (categoryIds: string[]) => {
    if (!window.confirm(`選択されたカテゴリを本当に削除しますか？`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      for (const id of categoryIds) {
        const requestUrl = `/api/admin/categories/${id}`;
        const res = await fetch(requestUrl, {
          method: "DELETE",
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
      }
      await fetchCategories();
      setSelectedCategories(new Set());
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `カテゴリのDELETEリクエストに失敗しました\n${error.message}`
          : `予期せぬエラーが発生しました\n${error}`;
      console.error(errorMsg);
      window.alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedCategories((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!categories) {
    return <div className="text-red-500">{fetchErrorMsg}</div>;
  }

  return (
    <main>
      <div className="text-2xl font-bold">カテゴリの管理</div>

      <div className="mb-3 flex items-end justify-end">
        <Link href="/admin/categories/new">
          <button
            type="submit"
            className={twMerge(
              "rounded-md px-5 py-1 font-bold",
              "bg-blue-500 text-white hover:bg-blue-600",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            カテゴリの新規作成
          </button>
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="text-gray-500">
          （カテゴリは1個も作成されていません）
        </div>
      ) : (
        <div>
          <div className="mb-3">
            <button
              type="button"
              className={twMerge(
                "rounded-md px-5 py-1 font-bold",
                "bg-red-500 text-white hover:bg-red-600",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              disabled={selectedCategories.size === 0 || isSubmitting}
              onClick={() => handleDelete(Array.from(selectedCategories))}
            >
              選択したカテゴリを削除
            </button>
          </div>

          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className={twMerge(
                  "border border-slate-400 p-3",
                  "flex items-center justify-between",
                  "font-bold"
                )}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(category.id)}
                    onChange={() => toggleSelection(category.id)}
                  />
                  <Link href={`/admin/categories/${category.id}`}>
                    {category.name}
                  </Link>
                </div>
                <div className="flex space-x-2">
                  <Link href={`/admin/categories/${category.id}`}>
                    <button
                      type="button"
                      className={twMerge(
                        "rounded-md px-5 py-1 font-bold",
                        "bg-indigo-500 text-white hover:bg-indigo-600"
                      )}
                    >
                      編集
                    </button>
                  </Link>
                  <button
                    type="button"
                    className={twMerge(
                      "rounded-md px-5 py-1 font-bold",
                      "bg-red-500 text-white hover:bg-red-600"
                    )}
                    onClick={() => handleDelete([category.id])}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default Page;
