'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { api } from '@/lib/api';

export default function MyCommentsPage() {
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api('/api/comments/my');
        setComments(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchComments();
  }, []);

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Link href="/profile" className="text-sm text-gray-500 hover:text-red-500">← 프로필</Link>
        <h1 className="text-2xl font-bold mb-6">💬 댓글 단 기록</h1>
        
        <div className="card">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">작성한 댓글이 없습니다.</p>
          ) : (
            <ul className="divide-y">
              {comments.map((comment) => (
                <li key={comment.comment_id} className="py-4">
                  <Link href={`/boards/1/posts/${comment.post_id}`} className="hover:text-red-500">
                    <p className="text-sm text-gray-500">원글: {comment.post_title}</p>
                    <p className="mt-1">{comment.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(comment.created_at).toLocaleString()}
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
