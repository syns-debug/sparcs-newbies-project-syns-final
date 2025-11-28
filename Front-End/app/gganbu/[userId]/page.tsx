'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { api } from '@/lib/api';

export default function GganbuPostsPage() {
  const params = useParams();
  const userId = params.userId;
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api(`/api/gganbu/${userId}/posts`);
        setPosts(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [userId]);

  if (loading) return <><Header /><div className="p-4">로딩 중...</div></>;

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Link href="/gganbu" className="text-sm text-gray-500 hover:text-red-500">← 깐부 목록</Link>
        <h1 className="text-2xl font-bold mb-6">
          {posts[0]?.author_nickname || '깐부'}의 글
        </h1>
        
        <div className="card">
          {posts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">작성한 글이 없습니다.</p>
          ) : (
            <ul className="divide-y">
              {posts.map((post) => (
                <li key={post.post_id}>
                  <Link
                    href={`/boards/${post.board_id}/posts/${post.post_id}`}
                    className="block py-4 hover:bg-gray-50"
                  >
                    {post.board_name && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{post.board_name}</span>
                    )}
                    <h3 className="font-medium mt-1">{post.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      ❤️ {post.like_count} · 💬 {post.comment_count}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
