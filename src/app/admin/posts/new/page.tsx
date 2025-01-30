"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/app/_hooks/useAuth";
import { supabase } from "@/app/utils/supabase";
import CryptoJS from "crypto-js";
import Image from "next/image";

const calculateMD5Hash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const wordArray = CryptoJS.lib.WordArray.create(buffer);
  return CryptoJS.MD5(wordArray).toString();
};

const NewPostPage: React.FC = () => {
  const bucketName = "cover_image";
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCoverImageURL, setNewCoverImageURL] = useState<string>("");
  const [newCoverImageKey, setNewCoverImageKey] = useState<
    string | undefined
  >();
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>();
  const [titleError, setTitleError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [coverImageKeyError, setCoverImageKeyError] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const { session } = useAuth();
  //const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  const validateInputs = () => {
    let isValid = true;
    if (newTitle.trim() === "") {
      setTitleError("文字を入力してください");
      isValid = false;
    } else {
      setTitleError(null);
    }

    if (newContent.trim() === "") {
      setContentError("文字を入力してください");
      isValid = false;
    } else {
      setContentError(null);
    }

    if (!newCoverImageKey) {
      setCoverImageKeyError("画像をアップロードしてください");
      isValid = false;
    } else {
      setCoverImageKeyError(null);
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          coverImageKey: newCoverImageKey,
        }),
      });
      if (!response.ok) {
        throw new Error("投稿記事の作成に失敗しました");
      }
      router.push("/admin/posts");
    } catch (error) {
      console.error(error);
      alert("投稿記事の作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateNewTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  const updateNewContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewContent(e.target.value);
  };

  const updateNewCoverImageURL = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCoverImageURL(e.target.value);
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setNewCoverImageKey(undefined);
    setCoverImageUrl(undefined);

    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files?.[0];
    const fileHash = await calculateMD5Hash(file);
    const path = `private/${fileHash}`;
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, { upsert: true });

    if (error || !data) {
      window.alert(`アップロードに失敗 ${error.message}`);
      return;
    }
    setNewCoverImageKey(data.path);
    const publicUrlResult = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);
    setCoverImageUrl(publicUrlResult.data.publicUrl);
  };

  if (!session) return <div>ログインしていません。</div>;

  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  if (fetchErrorMsg) {
    return <div className="text-red-500">{fetchErrorMsg}</div>;
  }

  return (
    <main>
      <div className="mb-5 text-2xl font-bold">新しい投稿記事の作成</div>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            タイトル
          </label>
          <input
            type="text"
            value={newTitle}
            onChange={updateNewTitle}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {titleError && <div className="text-red-500">{titleError}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            内容
          </label>
          <textarea
            value={newContent}
            onChange={updateNewContent}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            rows={10}
          />
          {contentError && <div className="text-red-500">{contentError}</div>}
        </div>
        <div>
          <label
            htmlFor="coverImageURL"
            className="block text-sm font-medium text-gray-700"
          >
            カバーイメージ (URL) <span className="text-gray-500">(任意)</span>
          </label>
          <input
            type="url"
            id="coverImageURL"
            name="coverImageURL"
            className="w-full rounded-md border-2 px-2 py-1"
            value={newCoverImageURL}
            onChange={updateNewCoverImageURL}
            placeholder="カバーイメージのURLを記入してください"
          />
          {newCoverImageURL && (
            <div className="mt-4">
              <Image
                src={newCoverImageURL}
                alt="カバーイメージ"
                width={64}
                height={64}
                className="size-8"
              />
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="submit"
            className={twMerge(
              "rounded-md px-5 py-1 font-bold",
              "bg-indigo-500 text-white hover:bg-indigo-600",
              "disabled:cursor-not-allowed"
            )}
            disabled={isSubmitting}
            onClick={handleSave}
          >
            保存
          </button>
        </div>
      </div>
    </main>
  );
};

export default NewPostPage;
