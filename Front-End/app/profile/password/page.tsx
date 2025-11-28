'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { api } from '@/lib/api';

export default function PasswordChangePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword !== form.newPasswordConfirm) {
      setError('새 비밀번호가 일치하지 않습니다');
      return;
    }

    if (form.newPassword.length < 4) {
      setError('비밀번호는 4자 이상이어야 합니다');
      return;
    }

    try {
      await api('/api/auth/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      setSuccess('비밀번호가 변경되었습니다');
      setForm({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-4 py-6">
        <Link href="/profile" className="text-sm text-gray-500 hover:text-red-500">← 프로필</Link>
        <h1 className="text-2xl font-bold mb-6">🔐 비밀번호 변경</h1>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-600 p-3 rounded mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">현재 비밀번호</label>
            <input
              type="password"
              className="input-field"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">새 비밀번호</label>
            <input
              type="password"
              className="input-field"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">새 비밀번호 확인</label>
            <input
              type="password"
              className="input-field"
              value={form.newPasswordConfirm}
              onChange={(e) => setForm({ ...form, newPasswordConfirm: e.target.value })}
              required
            />
          </div>
          <div className="text-sm text-gray-500">
            <p>• 비밀번호는 4자 이상이어야 합니다</p>
            <p>• 다른 사이트와 다른 비밀번호를 사용하세요</p>
          </div>
          <button type="submit" className="btn-primary w-full">비밀번호 변경</button>
        </form>
      </main>
    </>
  );
}
