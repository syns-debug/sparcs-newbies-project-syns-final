'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { api } from '@/lib/api';

export default function PrivatePostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api('/api/posts/private');
      setPosts(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api('/api/posts/private', {
        method: 'POST',
        body: JSON.stringify({ ...form, is_private: true }),
      });
      setForm({ title: '', content: '' });
      setShowForm(false);
      fetchPosts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Link href="/profile" className="text-sm text-gray-500 hover:text-red-500">← 프로필</Link>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">🔒 나만의 기록</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? '취소' : '새 메모'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
            <input
              type="text"
              className="input-field"
              placeholder="제목"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              className="input-field"
              rows={5}
              placeholder="내용"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
            />
            <button type="submit" className="btn-primary">저장</button>
          </form>
        )}
        
        <div className="card">
          {posts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">나만의 기록이 없습니다.</p>
          ) : (
            <ul className="divide-y">
              {posts.map((post) => (
                <li key={post.post_id} className="py-4">
                  <h3 className="font-medium">{post.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(post.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
