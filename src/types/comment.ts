import { ObjectId } from 'mongoose';

export interface Comment {
  _id?: ObjectId | string;
  listingId: ObjectId | string;
  commentText: string;
  author: ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}
