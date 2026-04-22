import Comment from '@/models/commentModel';
import listingModel from '@/models/listingModel';
import { Comment as CommentType } from '@/types/comment';

const getComments = async () => {
  return await Comment.find().populate('author', 'firstName lastName imageUrl');
};

const createComment = async (
  listingId: string,
  authorId: string,
  commentText: string
) => {
  const newComment = await Comment.create({
    listingId,
    commentText,
    author: authorId,
  });

  await listingModel.findByIdAndUpdate(
    listingId,
    { $push: { comments: newComment._id } },
    { new: true }
  );

  return await newComment.populate('author', 'firstName lastName imageUrl');
};

const getCommentById = async (id: string) => {
  return await Comment.findById(id).populate(
    'author',
    'firstName lastName imageUrl'
  );
};

const getCommentsByPostId = async (listingId: string) => {
  return await Comment.find({ listingId })
    .sort({ createdAt: -1 })
    .populate('author', 'firstName lastName imageUrl');
};

type UpdateCommentPayload = Pick<CommentType, 'commentText'>;

const updateComment = async (
  id: string,
  authorId: string,
  updateData: UpdateCommentPayload
) => {
  const comment = await Comment.findById(id);

  if (!comment) throw new Error('Comment not found');
  if (comment.author.toString() !== authorId) throw new Error('Unauthorized');

  return await Comment.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('author', 'firstName lastName imageUrl');
};

const deleteComment = async (id: string, authorId: string) => {
  const comment = await Comment.findById(id);

  if (!comment) throw new Error('Comment not found');
  if (comment.author.toString() !== authorId) throw new Error('Unauthorized');

  await Comment.findByIdAndDelete(id);

  await listingModel.findByIdAndUpdate(comment.listingId, {
    $pull: { comments: id },
  });

  return { success: true, deletedCommentId: id };
};

export default {
  getComments,
  createComment,
  getCommentById,
  getCommentsByPostId,
  updateComment,
  deleteComment,
};
