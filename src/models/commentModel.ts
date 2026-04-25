import { Comment } from '../types/comment';
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema<Comment>(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    commentText: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Comment', commentSchema);
