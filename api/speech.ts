/**
 * Vercel Serverless Function: /api/speech
 * 
 * Receives audio from the frontend and sends it to Deepgram Speech-to-Text.
 * Returns the transcribed text.
 * 
 * Environment variables needed (set in Vercel dashboard):
 * - DEEPGRAM_API_KEY: Your Deepgram API key
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_ORIGINS = [
  /^https:\/\/.*\.vercel\.app$/,
  /^https:\/\/max92034\.github\.io$/,
  /^http:\/\/localhost:\d+$/,
];

function setCorsHeaders(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin || '';
  const isAllowed = ALLOWED_ORIGINS.some(pattern => pattern.test(origin));
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.DEEPGRAM_API_KEY || process.env.deepgram_api;

  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Deepgram not configured. Set DEEPGRAM_API_KEY environment variable.' 
    });
  }

  try {
    const { audio, language } = req.body;

    if (!audio) {
      return res.status(400).json({ error: 'No audio data provided' });
    }

    // Build API endpoint with automatic language detection
    // If language is specified, use it; otherwise, let Deepgram auto-detect
    let endpoint = 'https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true';
    
    if (language) {
      endpoint += `&language=${language}`;
    } else {
      // Automatic language detection - works for English, Chinese, and 50+ other languages
      endpoint += '&detect_language=true';
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'audio/webm',
      },
      body: Buffer.from(audio, 'base64'),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deepgram error:', response.status, errorText);
      return res.status(response.status).json({ error: `Deepgram error: ${response.status}` });
    }

    const result = await response.json();
    const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
    const confidence = result?.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;

    if (transcript) {
      return res.status(200).json({ text: transcript, confidence });
    } else {
      return res.status(200).json({ 
        text: '',
        error: 'No speech recognized - try speaking closer to the mic',
      });
    }
  } catch (error) {
    console.error('Speech API error:', error);
    return res.status(500).json({ error: 'Failed to process speech' });
  }
}
