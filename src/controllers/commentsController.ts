import { Request, Response } from 'express';
import commentService from '../services/commentsService';
import { AuthRequest } from '@/middlewares/authMiddleware';

const getComments = async (req: Request, res: Response) => {
  try {
    const comments = await commentService.getCommentsByListingId(
      req.params.listingId as string
    );
    res.json(comments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const authorId = req.user?._id;
    const { commentText } = req.body;
    const newComment = await commentService.createComment(
      req.params.listingId as string,
      authorId as string,
      commentText
    );
    res.status(201).json(newComment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const authorId = req.user?._id;
    const { commentText } = req.body;
    const updatedComment = await commentService.updateComment(
      req.params.id as string,
      authorId as string,
      { commentText }
    );
    res.json(updatedComment);
  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
};

const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const authorId = req.user?._id;
    const result = await commentService.deleteComment(
      req.params.id as string,
      authorId as string
    );
    res.json(result);
  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
};

export default {
  getComments,
  createComment,
  updateComment,
  deleteComment,
};
