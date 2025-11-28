import { Request, Response } from 'express';
import db from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getPosts = async (req: Request, res: Response) => {
  try {
    const { boardId } = req.params;
    
    const [rows] = await db.query(`
      SELECT p.*, u.nickname as author_nickname,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comment_count,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.post_id) as like_count
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.board_id = ? AND p.is_private = FALSE
      ORDER BY p.created_at DESC
    `, [boardId]);

    res.json({ success: true, count: (rows as any[]).length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    
    await db.query('UPDATE posts SET view_count = view_count + 1 WHERE post_id = ?', [postId]);

    const [rows] = await db.query(`
      SELECT p.*, u.nickname as author_nickname,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comment_count,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.post_id) as like_count
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.post_id = ?
    `, [postId]);

    if ((rows as any[]).length === 0) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다' });
    }

    res.json({ success: true, data: (rows as any[])[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const { title, content, is_private } = req.body;
    const userId = req.user!.userId;

    if (boardId) {
      const [board] = await db.query('SELECT board_id FROM boards WHERE board_id = ?', [boardId]);
      if ((board as any[]).length === 0) {
        return res.status(404).json({ success: false, message: '게시판을 찾을 수 없습니다' });
      }
    }

    const [result] = await db.query(
      'INSERT INTO posts (user_id, board_id, title, content, is_private) VALUES (?, ?, ?, ?, ?)',
      [userId, boardId || null, title, content, is_private || false]
    );

    res.status(201).json({
      success: true,
      message: '글이 작성되었습니다',
      data: { post_id: (result as any).insertId, board_id: boardId, title, is_private: is_private || false }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const { title, content } = req.body;
    const userId = req.user!.userId;

    const [rows] = await db.query('SELECT user_id FROM posts WHERE post_id = ?', [postId]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다' });
    }
    if ((rows as any[])[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: '권한이 없습니다' });
    }

    await db.query('UPDATE posts SET title = ?, content = ? WHERE post_id = ?', [title, content, postId]);

    res.json({ success: true, message: '수정되었습니다' });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user!.userId;

    const [rows] = await db.query('SELECT user_id FROM posts WHERE post_id = ?', [postId]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다' });
    }
    if ((rows as any[])[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: '권한이 없습니다' });
    }

    await db.query('DELETE FROM posts WHERE post_id = ?', [postId]);

    res.json({ success: true, message: '삭제되었습니다' });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

export const getMyPosts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    const [rows] = await db.query(`
      SELECT p.*, b.board_name,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comment_count,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.post_id) as like_count
      FROM posts p
      LEFT JOIN boards b ON p.board_id = b.board_id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `, [userId]);

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

export const getPrivatePosts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    const [rows] = await db.query(`
      SELECT p.*,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comment_count
      FROM posts p
      WHERE p.user_id = ? AND p.is_private = TRUE
      ORDER BY p.created_at DESC
    `, [userId]);

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

export const likePost = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user!.userId;

    const [existing] = await db.query('SELECT * FROM likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
    
    if ((existing as any[]).length > 0) {
      await db.query('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
      res.json({ success: true, message: '좋아요 취소', liked: false });
    } else {
      await db.query('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [postId, userId]);
      res.json({ success: true, message: '좋아요', liked: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

export const bookmarkPost = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user!.userId;

    const [existing] = await db.query('SELECT * FROM bookmarks WHERE post_id = ? AND user_id = ?', [postId, userId]);
    
    if ((existing as any[]).length > 0) {
      await db.query('DELETE FROM bookmarks WHERE post_id = ? AND user_id = ?', [postId, userId]);
      res.json({ success: true, message: '북마크 취소', bookmarked: false });
    } else {
      await db.query('INSERT INTO bookmarks (post_id, user_id) VALUES (?, ?)', [postId, userId]);
      res.json({ success: true, message: '북마크 추가', bookmarked: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};


export const getBookmarkedPosts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    const [rows] = await db.query(`
      SELECT p.*, u.nickname as author_nickname, b.board_name
      FROM bookmarks bm
      JOIN posts p ON bm.post_id = p.post_id
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN boards b ON p.board_id = b.board_id
      WHERE bm.user_id = ?
      ORDER BY bm.created_at DESC
    `, [userId]);

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

export const getPostStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user!.userId;

    const [likeRows] = await db.query('SELECT * FROM likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
    const [bookmarkRows] = await db.query('SELECT * FROM bookmarks WHERE post_id = ? AND user_id = ?', [postId, userId]);

    res.json({
      success: true,
      data: {
        liked: (likeRows as any[]).length > 0,
        bookmarked: (bookmarkRows as any[]).length > 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

export const getPopularPosts = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.nickname as author_nickname,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.post_id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.is_private = FALSE AND p.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY like_count DESC, comment_count DESC
      LIMIT 10
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};
