import Comment from '@/models/commentModel';

const getComments = async () => {
  return await Comment.find();
};

const createComment = async (commentData: Partial<typeof Comment>) => {
  const newComment = new Comment(commentData);
  return await newComment.save();
};

const getCommentById = async (id: string) => {
  return await Comment.findById(id);
};

export default {
  getComments,
  createComment,
  getCommentById,
};
