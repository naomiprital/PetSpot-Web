import { Request, Response } from 'express';
import listingService from '../services/listingsService';
import { AuthRequest } from '../middlewares/authMiddleware';

const getAllListings = async (req: Request, res: Response) => {
  try {
    const listings = await listingService.getListings();
    res.json(listings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const getListing = async (req: Request, res: Response) => {
  try {
    const listing = await listingService.getListingById(
      req.params.id as string
    );
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const getUserListings = async (req: Request, res: Response) => {
  try {
    const listings = await listingService.getListingsByAuthor(
      req.params.authorId as string
    );
    res.json(listings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const createListing = async (req: AuthRequest, res: Response) => {
  try {
    const authorId = req.user?._id;
    const listingData = { ...req.body };

    listingData.imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : '/images/default-listing-image.jpg';

    const newListing = await listingService.createListing(
      authorId as string,
      listingData
    );
    res.status(201).json(newListing);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

const updateListing = async (req: AuthRequest, res: Response) => {
  try {
    const authorId = req.user?._id;
    const updateData = { ...req.body };

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedListing = await listingService.updateListing(
      req.params.id as string,
      authorId as string,
      updateData
    );
    res.json(updatedListing);
  } catch (error: any) {
    if (error.message === 'Listing not found') {
      res.status(404).json({ error: error.message });
    } else if (error.message === 'Unauthorized') {
      res.status(403).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

const deleteListing = async (req: AuthRequest, res: Response) => {
  try {
    const authorId = req.user?._id;

    const result = await listingService.deleteListing(
      req.params.id as string,
      authorId as string
    );
    res.json(result);
  } catch (error: any) {
    if (error.message === 'Listing not found') {
      res.status(404).json({ error: error.message });
    } else if (error.message === 'Unauthorized') {
      res.status(403).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};
const toggleBoostListing = async (req: AuthRequest, res: Response) => {
  try {
    const listingId = req.params.id as string;
    const userId = req.user?._id as string;

    const updatedListing = await listingService.toggleBoost(listingId, userId);

    res.status(200).json(updatedListing);
  } catch (error: any) {
    if (error.message === 'Listing not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

export default {
  getAllListings,
  getListing,
  getUserListings,
  createListing,
  updateListing,
  deleteListing,
  toggleBoostListing,
};
