import { Request, Response } from 'express';
import postsService from '@/services/postsService';

const getPosts = async (req: Request, res: Response) => {
  try {
    const sender = req.query.sender;
    const posts = sender
      ? await postsService.getPostsBySender(sender as string)
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
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const post = await postsService.getPostById(id as string);
    if (!post) {
      res.status(404).send('Movie not found');
    } else {
      res.status(200).json(post);
    }
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updatePost = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const updatedPost = await postsService.updatePost(id as string, req.body);
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
