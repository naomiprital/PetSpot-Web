import { jest, test, expect, describe, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import Listing from '../models/listingModel';
import aiService from '../services/aiService';
import { MONGO_URI_TEST } from './utils';

dotenv.config({ path: '.env.test' });

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || MONGO_URI_TEST);
  }
});

beforeEach(() => {
  process.env = { ...process.env };
  jest.clearAllMocks();
  // @ts-ignore
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('AI Service', () => {
  test('Generate hidden tags returns empty string when API key missing', async () => {
    delete process.env.COHERE_API_KEY;

    jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('fake'));
    
    const response = await aiService.generateHiddenTags('/images/nonexistent.jpg');
    expect(response).toBe('');
  });

  test('Generate hidden tags returns tags when API responds', async () => {
    process.env.COHERE_API_KEY = 'test-key';

    jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('fake'));
    
    // @ts-ignore
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        message: { content: [{ text: 'ginger, white paws' }] },
      }),
    });

    const response = await aiService.generateHiddenTags('/images/nonexistent.jpg');
    expect(response).toBe('ginger, white paws');
  });

  test('Smart search listings returns matched listings in order', async () => {
    process.env.COHERE_API_KEY = 'test-key';

    const fakeListings = [
      { _id: 'id1', description: 'first', aiVisualTags: 'a' },
      { _id: 'id2', description: 'second', aiVisualTags: 'b' },
    ];

    const populatedListings = [
      { _id: 'id2', description: 'second', aiVisualTags: 'b', author: {} },
      { _id: 'id1', description: 'first', aiVisualTags: 'a', author: {} },
    ];

    const findSpy = jest.spyOn(Listing, 'find');
    // @ts-ignore
    findSpy.mockReturnValueOnce({
      select: () => ({
        sort: () => ({ limit: () => Promise.resolve(fakeListings) }),
      }),
    } as any);
    // @ts-ignore
    findSpy.mockReturnValueOnce({
      populate: () => ({
        populate: () => Promise.resolve(populatedListings),
      }),
    } as any);

    jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('fake'));
    // @ts-ignore
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        message: { content: [{ text: JSON.stringify(['id2', 'id1']) }] },
      }),
    });

    const response = await aiService.smartSearchListings('query');
    expect(Array.isArray(response)).toBe(true);
    expect(response.length).toBe(2);
    expect(response[0]._id).toBe('id2');
    expect(response[1]._id).toBe('id1');
    
    findSpy.mockRestore();
  });

  test('Suggest image description parses JSON response', async () => {
    process.env.COHERE_API_KEY = 'test-key';
    jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('fake'));
    // @ts-ignore
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        message: {
          content: [
            { text: '{"description":"small brown dog","animalType":"dog"}' },
          ],
        },
      }),
    });

    const response = await aiService.suggestImageDescription('/images/nonexistent.jpg');
    expect(response).toHaveProperty('description', 'small brown dog');
    expect(response).toHaveProperty('animalType', 'dog');
  });
});
