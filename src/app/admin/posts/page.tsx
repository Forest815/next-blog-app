"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import type { Post } from "@/app/_types/Post";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

const AdminPostsPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts");
        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }
        const data = await response.json();
        setPosts(data);
      } catch (e) {
        setFetchError(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました"
        );
      }
    };
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("本当に削除しますか？")) return;

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("削除に失敗しました");
      }
      setPosts(posts?.filter((post) => post.id !== id) || null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "予期せぬエラーが発生しました");
    }
  };

  if (fetchError) {
    return <div>{fetchError}</div>;
  }

  if (!posts) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <main>
      <div className="mb-2 text-2xl font-bold">管理者用投稿記事一覧</div>
      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{post.title}</h2>
              <p>{post.content.slice(0, 100)}...</p>
            </div>
            <div className="flex space-x-2">
              <button
                className="text-blue-500"
                onClick={() => router.push(`/admin/posts/edit/${post.id}`)}
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button
                className="text-red-500"
                onClick={() => handleDelete(post.id)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default AdminPostsPage;
