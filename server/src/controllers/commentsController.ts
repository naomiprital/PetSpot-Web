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
}

const getCommentsByPostId = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const comments = await commentsService.getCommentsByPostId(postId as string);
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const updateComment = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.id;
    const updatedData = req.body;
    const updatedComment = await commentsService.updateComment(commentId as string, updatedData);

    if (!updatedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.status(200).json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const deleteComment = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.id;
    const deletedComment = await commentsService.deleteComment(commentId as string
    );

    if (!deletedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    res.status(200).json(deletedComment);
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export default {
    getComments,
    createComment,
    getCommentById,
    getCommentsByPostId,
    updateComment,
    deleteComment,
};