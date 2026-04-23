import Listing from '../models/listingModel';
import { Listing as ListingType } from '@/types/listing';
import aiService from './aiService';

type CreateListingPayload = Pick<
  ListingType,
  | 'listingType'
  | 'animalType'
  | 'imageUrl'
  | 'location'
  | 'lastSeen'
  | 'description'
>;
type UpdateListingPayload = Partial<CreateListingPayload> & {
  isResolved?: boolean;
};

const getListings = async () => {
  return await Listing.find({ isDeleted: false })
    .populate('author', 'firstName lastName email phoneNumber imageUrl')
    .sort({ createdAt: -1 });
};

const getListingById = async (id: string) => {
  return await Listing.findOne({ _id: id, isDeleted: false })
    .populate('author', 'firstName lastName email phoneNumber imageUrl')
    .populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'firstName lastName email phoneNumber imageUrl',
      },
    });
};

const getListingsByAuthor = async (authorId: string) => {
  return await Listing.find({ author: authorId, isDeleted: false })
    .populate('author', 'firstName lastName email phoneNumber imageUrl')
    .sort({ createdAt: -1 });
};

const createListing = async (
  authorId: string,
  listingData: CreateListingPayload
) => {
  let aiTags = '';

  if (listingData.imageUrl) {
    aiTags = await aiService.generateHiddenTags(listingData.imageUrl);
  } else {
    aiTags = 'no image provided';
  }

  const newListing = await Listing.create({
    ...listingData,
    author: authorId,
    aiVisualTags: aiTags,
  });

  return await newListing.populate(
    'author',
    'firstName lastName email phoneNumber imageUrl'
  );
};

const updateListing = async (
  id: string,
  authorId: string,
  updateData: UpdateListingPayload
) => {
  const listing = await Listing.findById(id);

  if (!listing || listing.isDeleted) throw new Error('Listing not found');
  if (listing.author.toString() !== authorId) throw new Error('Unauthorized');

  let newAiTags = listing.aiVisualTags;

  if (!updateData.imageUrl && listing.imageUrl) {
    newAiTags = 'no image provided';
  } else if (updateData.imageUrl && updateData.imageUrl !== listing.imageUrl) {
    newAiTags = await aiService.generateHiddenTags(updateData.imageUrl);
  }

  return await Listing.findByIdAndUpdate(
    id,
    {
      $set: {
        ...updateData,
        aiVisualTags: newAiTags,
      },
    },
    { new: true, runValidators: true }
  ).populate('author', 'firstName lastName email phoneNumber imageUrl');
};

const deleteListing = async (id: string, authorId: string) => {
  const listing = await Listing.findById(id);

  if (!listing || listing.isDeleted) throw new Error('Listing not found');
  if (listing.author.toString() !== authorId) throw new Error('Unauthorized');

  await Listing.findByIdAndUpdate(id, { isDeleted: true });

  return { success: true, deletedListingId: id };
};

export default {
  getListings,
  getListingById,
  getListingsByAuthor,
  createListing,
  updateListing,
  deleteListing,
};
