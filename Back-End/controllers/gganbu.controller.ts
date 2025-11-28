import { Request, Response } from 'express';
import db from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;
    const userId = req.user!.userId;

    const [rows] = await db.query(`
      SELECT user_id, username, name, nickname 
      FROM users 
      WHERE user_id != ? AND (nickname LIKE ? OR name LIKE ?)
      LIMIT 20
    `, [userId, `%${q}%`, `%${q}%`]);

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

export const followUser = async (req: AuthRequest, res: Response) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user!.userId;

    if (Number(targetUserId) === userId) {
      return res.status(400).json({ success: false, message: '자기 자신을 팔로우할 수 없습니다' });
    }

    const [existing] = await db.query(
      'SELECT * FROM follows WHERE follower_id = ? AND following_id = ?',
      [userId, targetUserId]
    );

    if ((existing as any[]).length > 0) {
      await db.query('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [userId, targetUserId]);
      res.json({ success: true, message: '내적 깐부 취소', following: false });
    } else {
      await db.query('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [userId, targetUserId]);
      res.json({ success: true, message: '내적 깐부 추가', following: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

export const getFollowing = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const [rows] = await db.query(`
      SELECT u.user_id, u.username, u.name, u.nickname
      FROM follows f
      JOIN users u ON f.following_id = u.user_id
      WHERE f.follower_id = ?
    `, [userId]);

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

export const getMutualGganbu = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const [rows] = await db.query(`
      SELECT u.user_id, u.username, u.name, u.nickname
      FROM follows f1
      JOIN follows f2 ON f1.following_id = f2.follower_id AND f1.follower_id = f2.following_id
      JOIN users u ON f1.following_id = u.user_id
      WHERE f1.follower_id = ?
    `, [userId]);

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

export const getGganbuPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { targetUserId } = req.params;

    const [rows] = await db.query(`
      SELECT p.*, u.nickname as author_nickname, b.board_name,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comment_count,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.post_id) as like_count
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN boards b ON p.board_id = b.board_id
      WHERE p.user_id = ? AND p.is_private = FALSE
      ORDER BY p.created_at DESC
    `, [targetUserId]);

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};
