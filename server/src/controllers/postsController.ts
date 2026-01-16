import { Request, Response } from 'express';
import postsService from '@/services/postsService';

const getPosts = async (_req: Request, res: Response) => {
  try {
    const posts = await postsService.getPosts();
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

export default {
  getPosts,
  createPost,
};
