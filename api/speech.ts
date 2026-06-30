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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Language');
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
    const contentType = req.headers['content-type'] || '';
    let language = (req.headers['x-language'] as string) || 'zh-CN';

    let audioBuffer: Buffer;
    let audioMimeType: string;

    if (contentType.includes('application/json')) {
      const { audio, language: bodyLang } = req.body;
      if (!audio) {
        return res.status(400).json({ error: 'No audio data provided' });
      }
      audioBuffer = Buffer.from(audio, 'base64');
      audioMimeType = 'audio/webm';
      if (bodyLang) {
        language = bodyLang;
      }
    } else {
      audioBuffer = req.body as Buffer;
      if (!audioBuffer || audioBuffer.length === 0) {
        return res.status(400).json({ error: 'No audio data provided' });
      }
      audioMimeType = contentType || 'audio/webm';
    }

    const endpoint = `https://api.deepgram.com/v1/listen?model=nova-2&language=${language}&smart_format=false&punctuate=false&profanity_filter=false&detect_topics=false&diarize=false`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': audioMimeType,
      },
      body: audioBuffer,
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
