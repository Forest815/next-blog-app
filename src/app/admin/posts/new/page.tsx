"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";

// カテゴリをフェッチしたときのレスポンスのデータ型
type CategoryApiResponse = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

// 投稿記事のカテゴリ選択用のデータ型
type SelectableCategory = {
  id: string;
  name: string;
  isSelect: boolean;
};

// ToDoリストの新規作成のページ
const Page: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newPriority, setNewPriority] = useState("low");
  const [newCompleted, setNewCompleted] = useState(false);

  const router = useRouter();

  // カテゴリ配列 (State)。取得中と取得失敗時は null、既存カテゴリが0個なら []
  const [checkableCategories, setCheckableCategories] = useState<
    SelectableCategory[] | null
  >(null);

  // コンポーネントがマウントされたとき (初回レンダリングのとき) に1回だけ実行
  useEffect(() => {
    // ウェブAPI (/api/categories) からカテゴリの一覧をフェッチする関数の定義
    const fetchCategories = async () => {
      try {
        setIsLoading(true);

        // フェッチ処理の本体
        const requestUrl = "/api/categories";
        const res = await fetch(requestUrl, {
          method: "GET",
          cache: "no-store",
        });

        // レスポンスのステータスコードが200以外の場合 (カテゴリのフェッチに失敗した場合)
        if (!res.ok) {
          setCheckableCategories(null);
          throw new Error(`${res.status}: ${res.statusText}`); // -> catch節に移動
        }

        // レスポンスのボディをJSONとして読み取りカテゴリ配列 (State) にセット
        const apiResBody = (await res.json()) as CategoryApiResponse[];
        setCheckableCategories(
          apiResBody.map((body) => ({
            id: body.id,
            name: body.name,
            isSelect: false,
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
        // 成功した場合も失敗した場合もローディング状態を解除
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // チェックボックスの状態 (State) を更新する関数
  const switchCategoryState = (categoryId: string) => {
    if (!checkableCategories) return;

    setCheckableCategories(
      checkableCategories.map((category) =>
        category.id === categoryId
          ? { ...category, isSelect: !category.isSelect }
          : category
      )
    );
  };

  const updateNewTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  const updateNewDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewDescription(e.target.value);
  };

  const updateNewDueDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewDueDate(e.target.value);
  };

  const updateNewPriority = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewPriority(e.target.value);
  };

  const updateNewCompleted = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCompleted(e.target.checked);
  };

  // フォームの送信処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // この処理をしないとページがリロードされるので注意

    setIsSubmitting(true);

    try {
      const requestBody = {
        title: newTitle,
        description: newDescription,
        dueDate: newDueDate,
        priority: newPriority,
        completed: newCompleted,
        categoryIds: checkableCategories
          ? checkableCategories.filter((c) => c.isSelect).map((c) => c.id)
          : [],
      };
      const requestUrl = "/api/todos";
      console.log(`${requestUrl} => ${JSON.stringify(requestBody, null, 2)}`);
      const res = await fetch(requestUrl, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`); // -> catch節に移動
      }

      const todoResponse = await res.json();
      setIsSubmitting(false);
      setIsSubmitted(true);
      router.push("/"); // 保存後に localhost:3000 にリダイレクト
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `ToDoのPOSTリクエストに失敗しました\n${error.message}`
          : `予期せぬエラーが発生しました\n${error}`;
      console.error(errorMsg);
      window.alert(errorMsg);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!checkableCategories) {
    return <div className="text-red-500">{fetchErrorMsg}</div>;
  }

  return (
    <>
      <main>
        <div className="mb-4 text-2xl font-bold">ToDoリストの新規作成</div>

        {isSubmitting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="flex items-center rounded-lg bg-white px-8 py-4 shadow-lg">
              <FontAwesomeIcon
                icon={faSpinner}
                className="mr-2 animate-spin text-gray-500"
              />
              <div className="flex items-center text-gray-500">処理中...</div>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={twMerge("space-y-4", isSubmitting && "opacity-50")}
        >
          <div className="space-y-1">
            <label htmlFor="title" className="block font-bold">
              タイトル
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="w-full rounded-md border-2 px-2 py-1"
              value={newTitle}
              onChange={updateNewTitle}
              placeholder="タイトルを記入してください"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className="block font-bold">
              説明
            </label>
            <textarea
              id="description"
              name="description"
              className="h-48 w-full rounded-md border-2 px-2 py-1"
              value={newDescription}
              onChange={updateNewDescription}
              placeholder="説明を記入してください"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="dueDate" className="block font-bold">
              期限
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              className="w-full rounded-md border-2 px-2 py-1"
              value={newDueDate}
              onChange={updateNewDueDate}
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="priority" className="block font-bold">
              優先度
            </label>
            <select
              id="priority"
              name="priority"
              className="w-full rounded-md border-2 px-2 py-1"
              value={newPriority}
              onChange={updateNewPriority}
              required
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="completed" className="block font-bold">
              完了
            </label>
            <input
              type="checkbox"
              id="completed"
              name="completed"
              className="rounded-md border-2 px-2 py-1"
              checked={newCompleted}
              onChange={updateNewCompleted}
            />
          </div>

          <div className="space-y-1">
            <div className="font-bold">タグ</div>
            <div className="flex flex-wrap gap-x-3.5">
              {checkableCategories.length > 0 ? (
                checkableCategories.map((c) => (
                  <label key={c.id} className="flex space-x-1">
                    <input
                      id={c.id}
                      type="checkbox"
                      checked={c.isSelect}
                      className="mt-0.5 cursor-pointer"
                      onChange={() => switchCategoryState(c.id)}
                    />
                    <span className="cursor-pointer">{c.name}</span>
                  </label>
                ))
              ) : (
                <div>選択可能なカテゴリが存在しません。</div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              className={twMerge(
                "rounded-md px-5 py-1 font-bold",
                "bg-indigo-500 text-white hover:bg-indigo-600",
                "disabled:cursor-not-allowed"
              )}
              disabled={isSubmitting}
            >
              ToDoを作成
            </button>
          </div>
        </form>
      </main>
    </>
  );
};

export default Page;
