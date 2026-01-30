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

const getCommentsByPostId = async (postId: string) => {
  return await Comment.find({ postId: postId }).sort({ createdAt: -1 });
};

const updateComment = async (id: string, updateData: Partial<any>) => {
  return await Comment.findByIdAndUpdate(
    id, 
    { $set: updateData }, 
    { new: true, runValidators: true } 
  );
};

const deleteComment = async (id: string) => {
  return await Comment.findByIdAndDelete(id);
};

export default {
  getComments,
  createComment,
  getCommentById,
  getCommentsByPostId,
  updateComment,
  deleteComment
};