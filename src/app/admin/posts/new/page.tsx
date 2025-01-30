"use client";
import { useState, ChangeEvent, useRef } from "react";
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
  const [productName, setProductName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("low");
  const [newCoverImageKey, setNewCoverImageKey] = useState<
    string | undefined
  >();
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>();
  const [productNameError, setProductNameError] = useState<string | null>(null);
  const [deadlineError, setDeadlineError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const { session } = useAuth();
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  const validateInputs = () => {
    let isValid = true;
    if (productName.trim() === "") {
      setProductNameError("商品名を入力してください");
      isValid = false;
    } else {
      setProductNameError(null);
    }

    if (deadline.trim() === "") {
      setDeadlineError("期限を入力してください");
      isValid = false;
    } else {
      setDeadlineError(null);
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // 画像がアップロードされていない場合はデフォルトの avatar.png を設定
      const coverImageKeyToUse = newCoverImageKey || "path/to/avatar.png";

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName,
          deadline,
          priority,
          coverImageKey: coverImageKeyToUse,
        }),
      });
      if (!response.ok) {
        throw new Error("投稿の作成に失敗しました");
      }
      router.push("/admin/posts");
    } catch (error) {
      console.error(error);
      alert("投稿の作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateProductName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductName(e.target.value);
  };

  const updateDeadline = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeadline(e.target.value);
  };

  const updatePriority = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPriority(e.target.value);
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
      <div className="mb-5 text-2xl font-bold">新しい買い物予定の作成</div>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            商品名
          </label>
          <input
            type="text"
            value={productName}
            onChange={updateProductName}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {productNameError && (
            <div className="text-red-500">{productNameError}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            期限
          </label>
          <input
            type="date"
            value={deadline}
            onChange={updateDeadline}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {deadlineError && <div className="text-red-500">{deadlineError}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            写真 (任意)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden={true}
            ref={hiddenFileInputRef}
          />
          <button
            onClick={() => hiddenFileInputRef.current?.click()}
            type="button"
            className="rounded-md bg-indigo-500 px-3 py-1 text-white"
          >
            ファイルを選択
          </button>
          <div className="break-all text-sm">
            coverImageKey : {newCoverImageKey}
          </div>
          <div className="break-all text-sm">
            coverImageUrl : {coverImageUrl}
          </div>
          {coverImageUrl && (
            <div className="mt-2">
              <Image
                className="w-1/2 border-2 border-gray-300"
                src={coverImageUrl}
                alt="プレビュー画像"
                width={1024}
                height={1024}
                priority
              />
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            優先度
          </label>
          <div className="mt-1 flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="priority"
                value="low"
                checked={priority === "low"}
                onChange={updatePriority}
                className="mr-2"
              />
              低
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="priority"
                value="medium"
                checked={priority === "medium"}
                onChange={updatePriority}
                className="mr-2"
              />
              中
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="priority"
                value="high"
                checked={priority === "high"}
                onChange={updatePriority}
                className="mr-2"
              />
              高
            </label>
          </div>
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
