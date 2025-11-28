'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { api, isLoggedIn } from '@/lib/api';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { boardId, postId } = params;
  
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  // 조회수 중복 증가 방지
  const hasFetched = useRef(false);

  useEffect(() => {
    // StrictMode 중복 실행 방지
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        // 현재 사용자 정보 가져오기
        if (isLoggedIn()) {
          try {
            const userRes = await api('/api/auth/me');
            setCurrentUserId(userRes.data.user_id);
          } catch (e) {}
        }

        const [postRes, commentsRes] = await Promise.all([
          api(`/api/posts/${postId}`),
          api(`/api/posts/${postId}/comments`),
        ]);
        setPost(postRes.data);
        setComments(commentsRes.data);
        
        // 좋아요/북마크 상태 가져오기
        if (isLoggedIn()) {
          try {
            const statusRes = await api(`/api/posts/${postId}/status`);
            setLiked(statusRes.data.liked);
            setBookmarked(statusRes.data.bookmarked);
          } catch (e) {}
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [postId]);

  const handleLike = async () => {
    if (!isLoggedIn()) return alert('로그인이 필요합니다');
    try {
      const res = await api(`/api/posts/${postId}/like`, { method: 'POST' });
      setLiked(res.liked);
      setPost({ ...post, like_count: post.like_count + (res.liked ? 1 : -1) });
    } catch (e) {
      console.error(e);
    }
  };

  const handleBookmark = async () => {
    if (!isLoggedIn()) return alert('로그인이 필요합니다');
    try {
      const res = await api(`/api/posts/${postId}/bookmark`, { method: 'POST' });
      setBookmarked(res.bookmarked);
      alert(res.bookmarked ? '저장되었습니다' : '저장이 취소되었습니다');
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn()) return alert('로그인이 필요합니다');
    if (!newComment.trim()) return;

    try {
      await api(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment }),
      });
      setNewComment('');
      const commentsRes = await api(`/api/posts/${postId}/comments`);
      setComments(commentsRes.data);
      setPost({ ...post, comment_count: (post.comment_count || 0) + 1 });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await api(`/api/comments/${commentId}`, { method: 'DELETE' });
      const commentsRes = await api(`/api/posts/${postId}/comments`);
      setComments(commentsRes.data);
      setPost({ ...post, comment_count: Math.max((post.comment_count || 1) - 1, 0) });
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await api(`/api/posts/${postId}`, { method: 'DELETE' });
      router.push(`/boards/${boardId}`);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ko-KR');
  };

  const isMyPost = currentUserId && post && post.user_id === currentUserId;

  if (loading) return <><Header /><div className="p-4">로딩 중...</div></>;
  if (!post) return <><Header /><div className="p-4">게시글을 찾을 수 없습니다.</div></>;

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Link href={`/boards/${boardId}`} className="text-sm text-gray-500 hover:text-red-500">
          ← 목록으로
        </Link>

        <article className="card mt-4">
          <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b">
            <span>{post.author_nickname}</span>
            <span>{formatDate(post.created_at)}</span>
            <span>조회 {post.view_count}</span>
          </div>
          
          <div className="prose max-w-none mb-6 whitespace-pre-wrap">
            {post.content}
          </div>

          <div className="flex items-center gap-4 border-t pt-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-3 py-1 rounded transition ${liked ? 'bg-red-100 text-red-500' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              ❤️ {post.like_count || 0}
            </button>
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1 px-3 py-1 rounded transition ${bookmarked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              🔖 {bookmarked ? '저장됨' : '저장'}
            </button>
            {isMyPost && (
              <button onClick={handleDeletePost} className="ml-auto text-red-500 text-sm hover:underline">
                삭제
              </button>
            )}
          </div>
        </article>

        {/* Comments */}
        <section className="card mt-6">
          <h2 className="font-bold mb-4">💬 댓글 {comments.length}개</h2>
          
          {isLoggedIn() ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                className="input-field mb-2"
                rows={3}
                placeholder="댓글을 입력하세요"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" className="btn-primary">댓글 작성</button>
            </form>
          ) : (
            <p className="text-gray-500 mb-6">댓글을 작성하려면 <Link href="/login" className="text-red-500 hover:underline">로그인</Link>하세요.</p>
          )}

          {comments.length === 0 ? (
            <p className="text-gray-400 text-center py-4">첫 댓글을 작성해보세요!</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((comment) => (
                <li key={comment.comment_id} className="border-b pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{comment.author_nickname}</span>
                      <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                    </div>
                    {currentUserId === comment.user_id && (
                      <button
                        onClick={() => handleDeleteComment(comment.comment_id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}