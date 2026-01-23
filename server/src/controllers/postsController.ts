import { Request, Response } from 'express';
import postsService from '@/services/postsService';

const getPosts = async (req: Request, res: Response) => {
  try {
    const rawSender = req.query.sender;
    const sender = Array.isArray(rawSender) ? rawSender[0] : rawSender;
    const posts = sender
      ? await postsService.getPostsBySender(String(sender))
      : await postsService.getPosts();
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createPost = async (req: Request, res: Response) => {
  try {
    const post = await postsService.createPost(req.body);
    res.status(200).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const post = await postsService.getPostById(String(id));
    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updatePost = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const updatedPost = await postsService.updatePost(String(id), req.body);
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default {
  getPosts,
  createPost,
  getPostById,
  updatePost,
};
