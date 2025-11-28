'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { api, isLoggedIn } from '@/lib/api';

export default function BoardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.boardId;
  
  const [board, setBoard] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [boardRes, postsRes] = await Promise.all([
          api(`/api/boards/${boardId}`),
          api(`/api/boards/${boardId}/posts`),
        ]);
        setBoard(boardRes.data);
        setPosts(postsRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [boardId]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '방금 전';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
    return date.toLocaleDateString();
  };

  if (loading) return <><Header /><div className="p-4">로딩 중...</div></>;

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/boards" className="text-sm text-gray-500 hover:text-red-500">
              ← 게시판 목록
            </Link>
            <h1 className="text-2xl font-bold">{board?.board_name}</h1>
            <p className="text-gray-600">{board?.description}</p>
          </div>
          {isLoggedIn() && (
            <Link href={`/boards/${boardId}/write`} className="btn-primary">
              글쓰기
            </Link>
          )}
        </div>

        <div className="card">
          {posts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">게시글이 없습니다.</p>
          ) : (
            <ul className="divide-y">
              {posts.map((post) => (
                <li key={post.post_id}>
                  <Link
                    href={`/boards/${boardId}/posts/${post.post_id}`}
                    className="block py-4 hover:bg-gray-50 px-2 -mx-2 rounded"
                  >
                    <h3 className="font-medium">{post.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>{post.author_nickname}</span>
                      <span>{formatDate(post.created_at)}</span>
                      <span>👁 {post.view_count}</span>
                      <span>❤️ {post.like_count}</span>
                      <span>💬 {post.comment_count}</span>
                    </div>
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
