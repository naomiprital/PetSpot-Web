import { ANIMAL_TYPES, Post, POST_TYPES } from '@/types/post';
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema<Post>(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: POST_TYPES,
      required: true,
    },
    animalType: {
      type: String,
      required: true,
      enum: ANIMAL_TYPES,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: String,
    },
    dateTimeOccured: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    photos: {
      type: [String],
      default: [],
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

postSchema.index({ location: '2dsphere' });

export default mongoose.model('Post', postSchema);
