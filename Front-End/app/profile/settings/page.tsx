'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { api, removeToken } from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handlePasswordCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 비밀번호 확인을 위해 로그인 API 재사용 대신 바로 탈퇴 시도
      setStep(2);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api('/api/auth/account', {
        method: 'DELETE',
        body: JSON.stringify({ password }),
      });
      removeToken();
      alert('회원 탈퇴가 완료되었습니다.');
      router.push('/');
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-4 py-6">
        <Link href="/profile" className="text-sm text-gray-500 hover:text-red-500">← 프로필</Link>
        <h1 className="text-2xl font-bold mb-6">⚠️ 회원 탈퇴</h1>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}

        {step === 1 && (
          <form onSubmit={handlePasswordCheck} className="card space-y-4">
            <p className="text-gray-600">회원 탈퇴를 위해 비밀번호를 입력해주세요.</p>
            <div>
              <label className="block text-sm font-medium mb-1">비밀번호</label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full bg-red-500 hover:bg-red-600">
              다음
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="card space-y-4">
            <div className="text-center py-4">
              <p className="text-xl font-bold text-red-500">정말로 탈퇴하시겠습니까?</p>
              <p className="text-gray-600 mt-2">탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary flex-1"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                className="btn-primary flex-1 bg-red-500 hover:bg-red-600"
              >
                탈퇴하기
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
