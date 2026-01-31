import { Comment } from '@/types/comment';
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema<Comment>(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    commentText: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Comment', commentSchema);
