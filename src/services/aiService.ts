import Listing from '../models/listingModel';
import fs from 'fs';
import path from 'path';

const COHERE_API_URL = 'https://api.cohere.com/v2/chat';
const AI_MODEL = 'command-a-vision-07-2025';

const callCohereApi = async (content: any[]) => {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) throw new Error('AI API key is missing on the server.');

  const response = await fetch(COHERE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [{ role: 'user', content }],
      temperature: 0,
    }),
  });

  if (!response.ok) throw new Error('AI Provider failed to respond.');
  return await response.json();
};

const smartSearchListings = async (
  query: string,
  type?: string,
  animal?: string
) => {
  const dbQuery: any = {
    isDeleted: false,
    isResolved: false,
  };

  if (type && type !== 'all') dbQuery.listingType = type;
  if (animal && animal !== 'all') dbQuery.animalType = animal;

  const listings = await Listing.find(dbQuery)
    .select('_id animalType description location aiVisualTags')
    .sort({ createdAt: -1 })
    .limit(100);

  const prompt = `
    You are an AI assistant helping a user find a lost or found animal. 
    The user is looking for: "${query}"

    Below is the JSON data of available listings:
    ${JSON.stringify(listings)}

    Task:
    1. Find the listings whose descriptions or aiVisualTags match the user's query.
    2. Return ONLY a valid JSON array of the relevant listing _ids, sorted from most relevant to least.
    3. If no listings match, return [].
    
    Example output format: ["60d5ec496f41...", "50d5ec496f42..."]
    Do NOT include any explanation or markdown formatting.
  `;

  const data = await callCohereApi([{ type: 'text', text: prompt }]);
  const rawText = data?.message?.content?.[0]?.text ?? '[]';

  const cleanedText = rawText.replace(/```json?|```/g, '').trim();
  const matchedIds: string[] = JSON.parse(cleanedText);

  const populatedListings = await Listing.find({
    _id: { $in: matchedIds },
  }).populate('author', 'firstName lastName email phoneNumber imageUrl');

  return populatedListings.sort(
    (a, b) =>
      matchedIds.indexOf(a._id.toString()) -
      matchedIds.indexOf(b._id.toString())
  );
};

const suggestImageDescription = async (filePath: string) => {
  const fullPath = path.join(process.cwd(), filePath);
  const fileData = fs.readFileSync(fullPath);
  const extention = path.extname(filePath).replace('.', '').toLowerCase();
  const base64Image = `data:image/${extention === 'jpg' ? 'jpeg' : extention};base64,${fileData.toString('base64')}`;

  const content = [
    {
      type: 'text',
      text: `You are an expert at identifying pets for lost and found reports.
      Look at the image and return a JSON object with exactly two fields:
      1. "description": A concise 1-2 sentence description of the pet.
      2. "animalType": One of "dog", "cat", "bird", "rabbit", "other", or null.
      Return ONLY valid JSON. No markdown, no explanation.`,
    },
    {
      type: 'image_url',
      image_url: { url: base64Image },
    },
  ];

  const data = await callCohereApi(content);
  const rawText = data?.message?.content?.[0]?.text ?? '{}';

  const cleanedText = rawText.replace(/```json?|```/g, '').trim();
  return JSON.parse(cleanedText);
};

const generateHiddenTags = async (filePath: string) => {
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath);

    const fileData = fs.readFileSync(fullPath);
    const extention = path.extname(filePath).replace('.', '').toLowerCase();
    const base64Image = `data:image/${extention === 'jpg' ? 'jpeg' : extention};base64,${fileData.toString('base64')}`;

    const content = [
      {
        type: 'text',
        text: `You are a visual tagging system for a pet search engine. 
        Look at this image and list all identifying physical features (colors, patterns, breed, size, eye color, etc.). 
        Output ONLY a comma-separated list of keywords. Example: "ginger, orange tabby, white paws, yellow eyes, fluffy"`,
      },
      { type: 'image_url', image_url: { url: base64Image } },
    ];

    const data = await callCohereApi(content);
    return data?.message?.content?.[0]?.text ?? '';
  } catch (error) {
    console.error(
      `Failed to generate AI tags. Tried looking at path: ${path.join(
        process.cwd(),
        'public',
        filePath
      )}, error:  + ${error}`
    );
    return '';
  }
};

export default {
  smartSearchListings,
  suggestImageDescription,
  generateHiddenTags,
};
