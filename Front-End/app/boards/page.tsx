'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { api } from '@/lib/api';

export default function BoardsPage() {
  const [boards, setBoards] = useState<any[]>([]);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await api('/api/boards');
        setBoards(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchBoards();
  }, []);

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">📋 게시판 목록</h1>
        <div className="grid gap-4">
          {boards.map((board) => (
            <Link
              key={board.board_id}
              href={`/boards/${board.board_id}`}
              className="card hover:shadow-md transition"
            >
              <h2 className="text-lg font-bold text-red-500">{board.board_name}</h2>
              <p className="text-gray-600">{board.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
