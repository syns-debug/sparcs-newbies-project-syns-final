'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { api, isLoggedIn } from '@/lib/api';

export default function Home() {
  const [boards, setBoards] = useState<any[]>([]);
  const [popularPosts, setPopularPosts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const boardsRes = await api('/api/boards');
        setBoards(boardsRes.data);
        
        const popularRes = await api('/api/posts/popular');
        setPopularPosts(popularRes.data);

        if (isLoggedIn()) {
          setLoggedIn(true);
          const userRes = await api('/api/auth/me');
          setUser(userRes.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Profile */}
          <div className="lg:col-span-1">
            {loggedIn && user ? (
              <div className="card mb-4">
                <h2 className="font-bold text-lg mb-2">👤 {user.nickname}</h2>
                <p className="text-gray-600 text-sm">@{user.username}</p>
                <p className="text-gray-600 text-sm">{user.name}</p>
                <Link href="/profile" className="block mt-3 text-red-500 text-sm hover:underline">
                  내 정보 →
                </Link>
              </div>
            ) : (
              <div className="card mb-4">
                <p className="text-gray-600 mb-3">로그인하여 커뮤니티에 참여하세요!</p>
                <Link href="/login" className="btn-primary block text-center">
                  로그인
                </Link>
              </div>
            )}

            {loggedIn && (
              <div className="card">
                <h3 className="font-bold mb-3">📂 나의 기록</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/profile/posts" className="text-gray-600 hover:text-red-500">
                      Sparcs와의 기록 (내가 쓴 글)
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile/comments" className="text-gray-600 hover:text-red-500">
                      댓글 단 기록
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile/bookmarks" className="text-gray-600 hover:text-red-500">
                      저장한 기록
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile/private" className="text-gray-600 hover:text-red-500">
                      나만의 기록
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Center: Boards */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="font-bold text-lg mb-4">📋 게시판</h2>
              <ul className="space-y-3">
                {boards.map((board) => (
                  <li key={board.board_id}>
                    <Link 
                      href={`/boards/${board.board_id}`}
                      className="block p-3 bg-gray-50 rounded hover:bg-gray-100 transition"
                    >
                      <span className="font-medium">{board.board_name}</span>
                      <p className="text-sm text-gray-500">{board.description}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Popular */}
          <div className="lg:col-span-1">
            <div className="card mb-4">
              <h2 className="font-bold text-lg mb-4">🔥 실시간 인기 기록</h2>
              <ul className="space-y-2">
                {popularPosts.slice(0, 5).map((post, idx) => (
                  <li key={post.post_id}>
                    <Link 
                      href={`/boards/${post.board_id}/posts/${post.post_id}`}
                      className="flex items-start gap-2 text-sm hover:text-red-500"
                    >
                      <span className="text-red-500 font-bold">{idx + 1}</span>
                      <span className="line-clamp-1">{post.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h2 className="font-bold text-lg mb-4">💎 HOT 기록</h2>
              <ul className="space-y-2">
                {popularPosts.slice(5, 10).map((post) => (
                  <li key={post.post_id}>
                    <Link 
                      href={`/boards/${post.board_id}/posts/${post.post_id}`}
                      className="text-sm hover:text-red-500 line-clamp-1"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
