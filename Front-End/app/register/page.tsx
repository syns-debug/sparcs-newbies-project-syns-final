'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, setToken } from '@/lib/api';
import Header from '@/components/Header';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    password: '',
    passwordConfirm: '',
    name: '',
    nickname: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    setLoading(true);

    try {
      const res = await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          name: form.name,
          nickname: form.nickname,
        }),
      });
      setToken(res.data.token);
      router.push('/');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-4 py-12">
        <div className="card">
          <h1 className="text-2xl font-bold text-center mb-6">회원가입</h1>
          
          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">아이디</label>
              <input
                type="text"
                className="input-field"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">비밀번호</label>
              <input
                type="password"
                className="input-field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">비밀번호 확인</label>
              <input
                type="password"
                className="input-field"
                value={form.passwordConfirm}
                onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">이름</label>
              <input
                type="text"
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">닉네임</label>
              <input
                type="text"
                className="input-field"
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-red-500 hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
