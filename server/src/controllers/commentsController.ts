import { Request, Response } from 'express';
import commentsService from '@/services/commentsService';
import { AuthRequest } from '@/middlewares/authMiddleware';

const getComments = async (req: Request, res: Response) => {
  try {
    const filterByPostId = req.query.postId;

    const comments = filterByPostId
      ? await commentsService.getCommentsByPostId(filterByPostId as string)
      : await commentsService.getComments();

    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const comment = await commentsService.createComment({
      ...req.body,
      sender: userId,
    });
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getCommentById = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.id;
    const comment = await commentsService.getCommentById(commentId as string);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.status(200).json(comment);
  } catch (error) {
    console.error('Error fetching comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.id as string;
    const userId = req.user?._id;

    const comment = await commentsService.getCommentById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.sender.toString() !== userId) {
      return res.status(403).json({ message: 'You cannot edit this comment' });
    }

    const updatedComment = await commentsService.updateComment(
      commentId,
      req.body
    );
    res.status(200).json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.id as string;
    const userId = req.user?._id;

    const comment = await commentsService.getCommentById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.sender.toString() !== userId) {
      return res
        .status(403)
        .json({ message: 'You cannot delete this comment' });
    }

    await commentsService.deleteComment(commentId);
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default {
  getComments,
  createComment,
  getCommentById,
  updateComment,
  deleteComment,
};
