import mongoose, { Schema } from 'mongoose';
import { ANIMAL_TYPES, Listing, LISTING_TYPES } from '@/types/listing';

const listingSchema = new Schema<Listing>(
  {
    listingType: {
      type: String,
      enum: LISTING_TYPES,
      required: true,
    },
    animalType: {
      type: String,
      enum: ANIMAL_TYPES,
      required: true,
    },
    imageUrl: { type: String },
    location: { type: String, required: true },
    lastSeen: { type: Number, required: true },
    description: { type: String, required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    boosts: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isResolved: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Listing', listingSchema);
