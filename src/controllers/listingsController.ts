import { Request, Response } from 'express';
import listingService from '../services/listingsService';

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

const createListing = async (req: Request, res: Response) => {
  try {
    const { authorId, ...listingData } = req.body;

    if (req.file) {
      listingData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const newListing = await listingService.createListing(
      authorId,
      listingData
    );
    res.status(201).json(newListing);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

const updateListing = async (req: Request, res: Response) => {
  try {
    const { authorId, ...updateData } = req.body;

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedListing = await listingService.updateListing(
      req.params.id as string,
      authorId,
      updateData
    );
    res.json(updatedListing);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

const deleteListing = async (req: Request, res: Response) => {
  try {
    const { authorId } = req.body;
    const result = await listingService.deleteListing(
      req.params.id as string,
      authorId
    );
    res.json(result);
  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
};

const boostListing = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body; // The ID of the user clicking the boost button
    if (!userId)
      return res.status(400).json({ error: 'User ID is required to boost' });

    const updatedListing = await listingService.boostListing(
      req.params.id as string,
      userId
    );
    res.json(updatedListing);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export default {
  getAllListings,
  getListing,
  getUserListings,
  createListing,
  updateListing,
  deleteListing,
  boostListing,
};
