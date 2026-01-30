import Post from '@/models/postModel';

const getPosts = async () => {
  return await Post.find();
};

const createPost = async (postData: Partial<typeof Post>) => {
  const newPost = new Post(postData);
  return await newPost.save();
};

const getPostById = async (id: string) => {
  return await Post.findById(id);
};

const getPostsBySender = async (sender: string) => {
  return await Post.find({ sender });
};

const updatePost = async (id: string, updateData: Partial<typeof Post>) => {
  return await Post.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
}

export default {
  getPosts,
  createPost,
  getPostById,
  getPostsBySender,
  updatePost
};
