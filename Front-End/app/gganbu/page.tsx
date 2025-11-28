'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { api } from '@/lib/api';

export default function GganbuPage() {
  const [tab, setTab] = useState<'following' | 'mutual'>('following');
  const [following, setFollowing] = useState<any[]>([]);
  const [mutual, setMutual] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    fetchGganbu();
  }, []);

  const fetchGganbu = async () => {
    try {
      const [followingRes, mutualRes] = await Promise.all([
        api('/api/gganbu/following'),
        api('/api/gganbu/mutual'),
      ]);
      setFollowing(followingRes.data);
      setMutual(mutualRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await api(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFollow = async (userId: number) => {
    try {
      await api(`/api/users/${userId}/follow`, { method: 'POST' });
      fetchGganbu();
      handleSearch();
    } catch (e) {
      console.error(e);
    }
  };

  const isFollowing = (userId: number) => {
    return following.some((f) => f.user_id === userId);
  };

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">🤝 깐부</h1>

        {/* Search */}
        <div className="card mb-6">
          <h2 className="font-bold mb-3">깐부 검색</h2>
          <div className="flex gap-2">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="닉네임 또는 이름으로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="btn-primary">검색</button>
          </div>

          {searchResults.length > 0 && (
            <ul className="mt-4 divide-y">
              {searchResults.map((user) => (
                <li key={user.user_id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{user.nickname}</p>
                    <p className="text-sm text-gray-500">{user.name} (@{user.username})</p>
                  </div>
                  <button
                    onClick={() => handleFollow(user.user_id)}
                    className={isFollowing(user.user_id) ? 'btn-secondary' : 'btn-primary'}
                  >
                    {isFollowing(user.user_id) ? '내적 깐부 취소' : '내적 깐부'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('following')}
            className={`px-4 py-2 rounded ${tab === 'following' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
          >
            내적 깐부 ({following.length})
          </button>
          <button
            onClick={() => setTab('mutual')}
            className={`px-4 py-2 rounded ${tab === 'mutual' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
          >
            상호 깐부 ({mutual.length})
          </button>
        </div>

        {/* List */}
        <div className="card">
          {(tab === 'following' ? following : mutual).length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {tab === 'following' ? '내적 깐부가 없습니다.' : '상호 깐부가 없습니다.'}
            </p>
          ) : (
            <ul className="divide-y">
              {(tab === 'following' ? following : mutual).map((user) => (
                <li key={user.user_id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{user.nickname}</p>
                    <p className="text-sm text-gray-500">{user.name}</p>
                  </div>
                  <Link
                    href={`/gganbu/${user.user_id}`}
                    className="text-red-500 text-sm hover:underline"
                  >
                    글 보기 →
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
