import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MONGO_URI_TEST } from './utils';
dotenv.config({ path: '.env.test' });

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || MONGO_URI_TEST);
  }
});

beforeEach(() => {
  jest.resetModules();
  process.env = { ...process.env };
  jest.unmock('../services/aiService');
});

afterAll(async () => {
  await mongoose.connection.close();
  process.env = process.env;
});

describe('AI Service', () => {
  test('Generate hidden tags returns empty string when API key missing', async () => {
    delete process.env.COHERE_API_KEY;

    jest.doMock('fs', () => ({ readFileSync: () => Buffer.from('fake') }));
    const service = (await import('../services/aiService')).default;
    const response = await service.generateHiddenTags(
      '/images/nonexistent.jpg'
    );
    expect(response).toBe('');
  });

  test('Generate hidden tags returns tags when API responds', async () => {
    process.env.COHERE_API_KEY = 'test-key';

    jest.doMock('fs', () => ({ readFileSync: () => Buffer.from('fake') }));
    // @ts-ignore
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        message: { content: [{ text: 'ginger, white paws' }] },
      }),
    }));

    const service = (await import('../services/aiService')).default;
    const response = await service.generateHiddenTags(
      '/images/nonexistent.jpg'
    );
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

    jest.doMock('../models/listingModel', () => ({
      find: (arg: any) => {
        if (arg && arg._id) {
          return {
            populate: () => ({
              populate: () => Promise.resolve(populatedListings),
            }),
            sort: () => ({ limit: () => Promise.resolve(populatedListings) }),
          };
        }
        return {
          select: () => ({
            sort: () => ({ limit: () => Promise.resolve(fakeListings) }),
          }),
        };
      },
    }));

    jest.doMock('fs', () => ({ readFileSync: () => Buffer.from('fake') }));

    // @ts-ignore
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        message: { content: [{ text: JSON.stringify(['id2', 'id1']) }] },
      }),
    }));

    const service = (await import('../services/aiService')).default;
    const response = await service.smartSearchListings('query');
    expect(Array.isArray(response)).toBe(true);
    expect(response.length).toBe(2);
    expect(response[0]._id).toBe('id2');
    expect(response[1]._id).toBe('id1');
  });

  test('Suggest image description parses JSON response', async () => {
    process.env.COHERE_API_KEY = 'test-key';
    jest.doMock('fs', () => ({ readFileSync: () => Buffer.from('fake') }));
    // @ts-ignore
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        message: {
          content: [
            { text: '{"description":"small brown dog","animalType":"dog"}' },
          ],
        },
      }),
    }));

    const service = (await import('../services/aiService')).default;
    const response = await service.suggestImageDescription(
      '/images/nonexistent.jpg'
    );
    expect(response).toHaveProperty('description', 'small brown dog');
    expect(response).toHaveProperty('animalType', 'dog');
  });
});
