import { Request, Response } from 'express';
import db from '../config/database';

export const getBoards = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM boards ORDER BY board_id');
    res.json({ success: true, count: (rows as any[]).length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

export const getBoardById = async (req: Request, res: Response) => {
  try {
    const { boardId } = req.params;
    const [rows] = await db.query('SELECT * FROM boards WHERE board_id = ?', [boardId]);
    
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ success: false, message: '게시판을 찾을 수 없습니다' });
    }

    res.json({ success: true, data: (rows as any[])[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};
