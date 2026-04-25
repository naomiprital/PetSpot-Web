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
export const LISTING_TYPES = ['lost', 'found'] as const;

type AnimalType = (typeof ANIMAL_TYPES)[number];
type ListingType = (typeof LISTING_TYPES)[number];

export interface Listing {
  _id?: ObjectId | string;
  listingType: ListingType;
  animalType: AnimalType;
  imageUrl?: string;
  location: string;
  lastSeen: number;
  description: string;
  comments: ObjectId[];
  boosts: ObjectId[];
  author: ObjectId | string;
  aiVisualTags?: string;
  isResolved: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
