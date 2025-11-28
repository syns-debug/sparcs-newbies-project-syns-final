'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isLoggedIn, removeToken, api } from '@/lib/api';

export default function Header() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (isLoggedIn()) {
        setLoggedIn(true);
        try {
          const res = await api('/api/auth/me');
          setUser(res.data);
        } catch (e) {
          removeToken();
          setLoggedIn(false);
        }
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    removeToken();
    setLoggedIn(false);
    setUser(null);
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-red-500">
          SPARCS Community
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link href="/boards" className="text-gray-600 hover:text-red-500">
            게시판
          </Link>
          {loggedIn ? (
            <>
              <Link href="/gganbu" className="text-gray-600 hover:text-red-500">
                깐부
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-red-500">
                {user?.nickname || '프로필'}
              </Link>
              <button onClick={handleLogout} className="btn-secondary text-sm">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-red-500">
                로그인
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
