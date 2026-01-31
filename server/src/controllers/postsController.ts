import { Request, Response } from 'express';
import postsService from '@/services/postsService';
import { AuthRequest } from '@/middlewares/authMiddleware';

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

const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const post = await postsService.createPost({ ...req.body, sender: userId });
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
      return res.status(404).send('Post not found');
    }

    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id as string;
    const userId = req.user?._id;

    const post = await postsService.getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.sender.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You cannot edit another user's post!" });
    }

    const updatedPost = await postsService.updatePost(postId, req.body);
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
