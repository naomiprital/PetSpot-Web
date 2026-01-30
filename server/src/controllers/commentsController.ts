import { Request, Response } from 'express';
import commentsService from '@/services/commentsService';

const getComments = async (req: Request, res: Response) => {
    try {
      const comments = await commentsService.getComments();
      res.status(200).json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  const createComment = async (req: Request, res: Response) => {
    try {
      const comment = await commentsService.createComment(req.body);
      res.status(201).json(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  const getCommentById = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const comment = await commentsService.getCommentById(id as string);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      res.status(200).json(comment);
    } catch (error) {
      console.error('Error getting comment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

export default {
    getComments,
    createComment,
    getCommentById
};