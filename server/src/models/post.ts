import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: true,
    },
    animalType: {
      type: String,
      required: true,
      enum: ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'horse', 'other'],
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
    isResolved: {
      type: Boolean,
      default: false,
    },
    // todo: images
  },
  { timestamps: true }
);

postSchema.index({ location: '2dsphere' });

export default mongoose.model('Post', postSchema);
