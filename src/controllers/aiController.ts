import { Request, Response } from 'express';
import aiService from '../services/aiService';

const smartSearch = async (req: Request, res: Response) => {
  try {
    const { query, type, animal } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await aiService.smartSearchListings(query, type, animal);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const suggestDescription = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const suggestion = await aiService.suggestImageDescription(req.file.path);
    res.json(suggestion);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export default { smartSearch, suggestDescription };
