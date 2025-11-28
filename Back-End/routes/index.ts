import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as boardController from '../controllers/board.controller';
import * as postController from '../controllers/post.controller';
import * as commentController from '../controllers/comment.controller';
import * as gganbuController from '../controllers/gganbu.controller';
import { authMiddleware, optionalAuth } from '../middleware/auth';

const router = Router();

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authMiddleware, authController.getMe);
router.put('/auth/password', authMiddleware, authController.changePassword);
router.delete('/auth/account', authMiddleware, authController.deleteAccount);

// Board routes
router.get('/boards', boardController.getBoards);
router.get('/boards/:boardId', boardController.getBoardById);

// Post routes
router.get('/boards/:boardId/posts', postController.getPosts);
router.post('/boards/:boardId/posts', authMiddleware, postController.createPost);
router.get('/posts/popular', postController.getPopularPosts);
router.get('/posts/my', authMiddleware, postController.getMyPosts);
router.get('/posts/private', authMiddleware, postController.getPrivatePosts);
router.get('/posts/bookmarked', authMiddleware, postController.getBookmarkedPosts);
router.get('/posts/:postId', optionalAuth, postController.getPostById);
router.put('/posts/:postId', authMiddleware, postController.updatePost);
router.delete('/posts/:postId', authMiddleware, postController.deletePost);
router.post('/posts/:postId/like', authMiddleware, postController.likePost);
router.post('/posts/:postId/bookmark', authMiddleware, postController.bookmarkPost);
router.get('/posts/:postId/status', authMiddleware, postController.getPostStatus);

// Comment routes
router.get('/posts/:postId/comments', commentController.getComments);
router.post('/posts/:postId/comments', authMiddleware, commentController.createComment);
router.delete('/comments/:commentId', authMiddleware, commentController.deleteComment);
router.get('/comments/my', authMiddleware, commentController.getMyComments);

// Gganbu routes
router.get('/users/search', authMiddleware, gganbuController.searchUsers);
router.post('/users/:targetUserId/follow', authMiddleware, gganbuController.followUser);
router.get('/gganbu/following', authMiddleware, gganbuController.getFollowing);
router.get('/gganbu/mutual', authMiddleware, gganbuController.getMutualGganbu);
router.get('/gganbu/:targetUserId/posts', authMiddleware, gganbuController.getGganbuPosts);

// Private post (나만의 기록)
router.post('/posts/private', authMiddleware, (req, res) => {
  req.body.is_private = true;
  req.params.boardId = '';
  postController.createPost(req as any, res);
});

export default router;
