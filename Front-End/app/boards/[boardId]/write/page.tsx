'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { api, isLoggedIn } from '@/lib/api';

export default function WritePostPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.boardId;
  
  const [form, setForm] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await api(`/api/boards/${boardId}/posts`, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      router.push(`/boards/${boardId}/posts/${res.data.post_id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">✏️ 글쓰기</h1>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">제목</label>
            <input
              type="text"
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="제목을 입력하세요"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">내용</label>
            <textarea
              className="input-field"
              rows={12}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="내용을 입력하세요"
              required
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '작성 중...' : '작성 완료'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => router.back()}
            >
              취소
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
