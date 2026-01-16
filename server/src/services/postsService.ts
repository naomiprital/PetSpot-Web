import Post from '@/models/post';

const getPosts = async () => {
  return await Post.find();
};

const createPost = async (postData: Partial<typeof Post>) => {
  const newPost = new Post(postData);
  return await newPost.save();
};

export default {
  getPosts,
  createPost,
};
