"use client";
import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faSpinner,
  faThumbsUp,
  faComment,
} from "@fortawesome/free-solid-svg-icons";
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

type Reply = {
  id: string;
  content: string;
  likes: number;
};

type Comment = {
  id: string;
  content: string;
  likes: number;
  newReply?: string;
  replies?: Reply[];
};

// Removed duplicate Reply interface

const handleReplyLike = (replyId: string) => {
  // いいね機能の実装
};

const replies: Reply[] = [
  // 例としてのリプライデータ
];

const EditPostPage: React.FC = () => {
  const bucketName = "cover_image";
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImageKey, setCoverImageKey] = useState<string | undefined>();
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>();
  const [titleError, setTitleError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [coverImageKeyError, setCoverImageKeyError] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);
  const [likes, setLikes] = useState<number>(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const router = useRouter();
  const { session } = useAuth();
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/posts/${id}`);
        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }
        const data = await response.json();
        setTitle(data.title);
        setContent(data.content);
        setCoverImageKey(data.coverImageKey);
        setLikes(data.likes || 0);
        setComments(data.comments || []);

        const { data: imageData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.coverImageKey);
        setCoverImageUrl(imageData.publicUrl);
      } catch (error) {
        console.error(error);
        setFetchErrorMsg((error as any).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const validateInputs = () => {
    let isValid = true;
    if (title.trim() === "") {
      setTitleError("文字を入力してください");
      isValid = false;
    } else {
      setTitleError(null);
    }

    if (content.trim() === "") {
      setContentError("文字を入力してください");
      isValid = false;
    } else {
      setContentError(null);
    }

    if (!coverImageKey) {
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
      const response = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          coverImageKey,
        }),
      });
      if (!response.ok) {
        throw new Error("投稿記事の更新に失敗しました");
      }
      router.push("/admin/posts");
    } catch (error) {
      console.error(error);
      alert("投稿記事の更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const updateContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setCoverImageKey(undefined);
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
    setCoverImageKey(data.path);
    const publicUrlResult = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);
    setCoverImageUrl(publicUrlResult.data.publicUrl);
  };

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      if (!response.ok) {
        throw new Error("いいねの更新に失敗しました");
      }
      const data = await response.json();
      setLikes(data.likes);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentSubmit = async () => {
    if (newComment.trim() === "") return;

    try {
      const response = await fetch(`/api/posts/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });
      if (!response.ok) {
        throw new Error("コメントの追加に失敗しました");
      }
      const data = await response.json();
      setComments([...comments, data]);
      setNewComment("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      if (!response.ok) {
        throw new Error("コメントのいいねの更新に失敗しました");
      }
      const data = await response.json();
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId ? { ...comment, likes: data.likes } : comment
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleReplyChange = (
    e: ChangeEvent<HTMLInputElement>,
    commentId: string
  ) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? { ...comment, newReply: e.target.value }
          : comment
      )
    );
  };

  const handleReplySubmit = async (commentId: string) => {
    const comment = comments.find((comment) => comment.id === commentId);
    if (!comment || comment.newReply.trim() === "") return;

    try {
      const response = await fetch(`/api/comments/${commentId}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ content: comment.newReply }),
      });
      if (!response.ok) {
        throw new Error("返信の追加に失敗しました");
      }
      const data = await response.json();
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: [...(comment.replies || []), data],
                newReply: "",
              }
            : comment
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleReplyLike = async (replyId: string) => {
    try {
      const response = await fetch(`/api/replies/${replyId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      if (!response.ok) {
        throw new Error("返信のいいねの更新に失敗しました");
      }
      const data = await response.json();
      setComments((prevComments: Comment[]) =>
        prevComments.map((comment: Comment) => ({
          ...comment,
          replies: comment.replies?.map((reply: Reply) =>
            reply.id === replyId ? { ...reply, likes: data.likes } : reply
          ),
        }))
      );
    } catch (error) {
      console.error(error);
    }
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
      <div className="mb-5 text-2xl font-bold">投稿記事の編集</div>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            タイトル
          </label>
          <input
            type="text"
            value={title}
            onChange={updateTitle}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {titleError && <div className="text-red-500">{titleError}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            内容
          </label>
          <textarea
            value={content}
            onChange={updateContent}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            rows={10}
          />
          {contentError && <div className="text-red-500">{contentError}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            カバーイメージ (キー)
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
          {coverImageKeyError && (
            <div className="text-red-500">{coverImageKeyError}</div>
          )}
          <div className="break-all text-sm">
            coverImageKey : {coverImageKey}
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
        <div className="flex justify-end space-x-2">
          <button
            type="submit"
            className={twMerge(
              "rounded-md px-5 py-1 font-bold",
              "bg-indigo-500 text-white hover:bg-indigo-600",
              "disabled:cursor-not-allowed"
            )}
            disabled={isSubmitting}
          >
            保存
          </button>
        </div>
        <div className="mt-4">
          <button
            onClick={handleLike}
            className="flex items-center space-x-1 text-blue-500"
          >
            <FontAwesomeIcon icon={faThumbsUp} />
            <span>{likes}</span>
          </button>
        </div>
        <div className="mt-4">
          <h2 className="text-xl font-bold">コメント</h2>
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b pb-2">
                <div>{comment.content}</div>
                <button
                  onClick={() => handleCommentLike(comment.id)}
                  className="flex items-center space-x-1 text-blue-500"
                >
                  <FontAwesomeIcon icon={faThumbsUp} />
                  <span>{comment.likes}</span>
                </button>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="コメントを追加"
                    value={comment.newReply}
                    onChange={(e) => handleReplyChange(e, comment.id)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <button
                    onClick={() => handleReplySubmit(comment.id)}
                    className="mt-1 rounded-md bg-indigo-500 px-3 py-1 text-white"
                  >
                    返信
                  </button>
                </div>
                {comment.replies &&
                  replies.map((reply: Reply) => (
                    <div key={reply.id} className="ml-4 mt-2 border-l pl-2">
                      <div>{reply.content}</div>
                      <button
                        onClick={() => handleReplyLike(reply.id)}
                        className="flex items-center space-x-1 text-blue-500"
                      >
                        <FontAwesomeIcon icon={faThumbsUp} />
                        <span>{reply.likes}</span>
                      </button>
                    </div>
                  ))}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <input
              type="text"
              placeholder="コメントを追加"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <button
              onClick={handleCommentSubmit}
              className="mt-1 rounded-md bg-indigo-500 px-3 py-1 text-white"
            >
              コメントを追加
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EditPostPage;
