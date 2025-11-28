'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { api, isLoggedIn, removeToken } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await api('/api/auth/me');
        setUser(res.data);
      } catch (e) {
        removeToken();
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = () => {
    removeToken();
    router.push('/');
  };

  if (loading) return <><Header /><div className="p-4">로딩 중...</div></>;

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="card mb-6">
          <h1 className="text-2xl font-bold mb-4">👤 내 정보</h1>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">닉네임</span>
              <span className="font-medium">{user?.nickname}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">이름</span>
              <span className="font-medium">{user?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">아이디</span>
              <span className="font-medium">{user?.username}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">가입일</span>
              <span className="font-medium">
                {new Date(user?.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="font-bold mb-4">📂 나의 기록</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/profile/posts" className="block py-2 px-3 bg-gray-50 rounded hover:bg-gray-100">
                Sparcs와의 기록 (내가 쓴 글) →
              </Link>
            </li>
            <li>
              <Link href="/profile/comments" className="block py-2 px-3 bg-gray-50 rounded hover:bg-gray-100">
                댓글 단 기록 →
              </Link>
            </li>
            <li>
              <Link href="/profile/bookmarks" className="block py-2 px-3 bg-gray-50 rounded hover:bg-gray-100">
                저장한 기록 →
              </Link>
            </li>
            <li>
              <Link href="/profile/private" className="block py-2 px-3 bg-gray-50 rounded hover:bg-gray-100">
                나만의 기록 →
              </Link>
            </li>
          </ul>
        </div>

        <div className="card mb-6">
          <h2 className="font-bold mb-4">⚙️ 계정 설정</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/profile/password" className="block py-2 px-3 bg-gray-50 rounded hover:bg-gray-100">
                비밀번호 변경 →
              </Link>
            </li>
            <li>
              <Link href="/gganbu" className="block py-2 px-3 bg-gray-50 rounded hover:bg-gray-100">
                깐부 목록 →
              </Link>
            </li>
            <li>
              <Link href="/profile/settings" className="block py-2 px-3 bg-red-50 rounded hover:bg-red-100 text-red-600">
                회원 탈퇴 →
              </Link>
            </li>
          </ul>
        </div>

        <button onClick={handleLogout} className="btn-secondary w-full">
          로그아웃
        </button>
      </main>
    </>
  );
}
