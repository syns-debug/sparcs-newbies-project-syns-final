import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import db from '../config/database';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, name, nickname } = req.body;

    if (!username || !password || !name || !nickname) {
      return res.status(400).json({ success: false, message: '모든 필드를 입력해주세요' });
    }

    const [existing] = await db.query('SELECT user_id FROM users WHERE username = ?', [username]);
    if ((existing as any[]).length > 0) {
      return res.status(400).json({ success: false, message: '이미 존재하는 아이디입니다' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (username, password, name, nickname) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, name, nickname]
    );

    const userId = (result as any).insertId;
    const signOptions: SignOptions = { expiresIn: '7d' };
    const token = jwt.sign(
      { userId, username, nickname },
      process.env.JWT_SECRET || 'secret',
      signOptions
    );

    res.status(201).json({
      success: true,
      message: '회원가입 성공',
      data: { user: { user_id: userId, username, name, nickname }, token }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    const users = rows as any[];

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다' });
    }

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다' });
    }

    const signOptions: SignOptions = { expiresIn: '7d' };
    const token = jwt.sign(
      { userId: user.user_id, username: user.username, nickname: user.nickname },
      process.env.JWT_SECRET || 'secret',
      signOptions
    );

    res.json({
      success: true,
      message: '로그인 성공',
      data: { user: { user_id: user.user_id, username: user.username, name: user.name, nickname: user.nickname }, token }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const [rows] = await db.query('SELECT user_id, username, name, nickname, created_at FROM users WHERE user_id = ?', [userId]);
    const users = rows as any[];

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다' });
    }

    res.json({ success: true, data: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { currentPassword, newPassword } = req.body;

    const [rows] = await db.query('SELECT password FROM users WHERE user_id = ?', [userId]);
    const users = rows as any[];
    
    const isValid = await bcrypt.compare(currentPassword, users[0].password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: '현재 비밀번호가 일치하지 않습니다' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, userId]);

    res.json({ success: true, message: '비밀번호가 변경되었습니다' });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { password } = req.body;

    const [rows] = await db.query('SELECT password FROM users WHERE user_id = ?', [userId]);
    const users = rows as any[];
    
    const isValid = await bcrypt.compare(password, users[0].password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다' });
    }

    await db.query('DELETE FROM users WHERE user_id = ?', [userId]);

    res.json({ success: true, message: '회원 탈퇴가 완료되었습니다' });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};
