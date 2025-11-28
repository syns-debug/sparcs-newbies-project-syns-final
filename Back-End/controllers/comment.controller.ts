import { Request, Response } from 'express';
import db from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getComments = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    
    const [rows] = await db.query(`
      SELECT c.*, u.nickname as author_nickname
      FROM comments c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [postId]);

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user!.userId;

    const [result] = await db.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, userId, content]
    );

    res.status(201).json({
      success: true,
      message: '댓글이 작성되었습니다',
      data: { comment_id: (result as any).insertId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.userId;

    const [rows] = await db.query('SELECT user_id FROM comments WHERE comment_id = ?', [commentId]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ success: false, message: '댓글을 찾을 수 없습니다' });
    }
    if ((rows as any[])[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: '권한이 없습니다' });
    }

    await db.query('DELETE FROM comments WHERE comment_id = ?', [commentId]);

    res.json({ success: true, message: '삭제되었습니다' });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

export const getMyComments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    const [rows] = await db.query(`
      SELECT c.*, p.title as post_title, p.post_id
      FROM comments c
      JOIN posts p ON c.post_id = p.post_id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `, [userId]);

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};
