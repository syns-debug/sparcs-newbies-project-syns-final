'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { api } from '@/lib/api';

export default function MyPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api('/api/posts/my');
        setPosts(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchPosts();
  }, []);

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Link href="/profile" className="text-sm text-gray-500 hover:text-red-500">← 프로필</Link>
        <h1 className="text-2xl font-bold mb-6">📝 Sparcs와의 기록</h1>
        
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
                    <div className="flex items-center gap-2">
                      {post.board_name && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{post.board_name}</span>
                      )}
                      {post.is_private && (
                        <span className="text-xs bg-yellow-100 px-2 py-1 rounded">🔒 비공개</span>
                      )}
                    </div>
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
