import { ObjectId } from 'mongoose';

export const ANIMAL_TYPES = [
  'dog',
  'cat',
  'bird',
  'rabbit',
  'hamster',
  'horse',
  'other',
] as const;
export const POST_TYPES = ['lost', 'found'] as const;

type AnimalType = (typeof ANIMAL_TYPES)[number];
type PostType = (typeof POST_TYPES)[number];

export interface Post {
  _id?: ObjectId | string;
  sender: ObjectId | string;
  type: PostType;
  animalType: AnimalType;
  location: {
    type: 'Point';
    coordinates: number[];
    address?: string;
  };
  dateTimeOccured: Date;
  description?: string;
  photos?: string[];
  isResolved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
