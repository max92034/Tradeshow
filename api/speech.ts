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
    const { audio, language, mimeType } = req.body;

    if (!audio) {
      return res.status(400).json({ error: 'No audio data provided' });
    }

    // Decode base64 audio
    let audioBuffer: Buffer;
    try {
      audioBuffer = Buffer.from(audio, 'base64');
    } catch {
      return res.status(400).json({ error: 'Invalid audio data format' });
    }

    if (audioBuffer.length === 0) {
      return res.status(400).json({ error: 'Audio data is empty' });
    }

    if (audioBuffer.length < 100) {
      return res.status(400).json({ error: 'Audio too short - record for at least 1 second' });
    }

    // Determine content type from mimeType or default
    const contentType = mimeType || 'audio/webm';

    // Use the specified language, default to Chinese
    const lang = language === 'en' ? 'en' : 'zh';

    // numerals=true helps Deepgram recognize spoken numbers better
    const endpoint = `https://api.deepgram.com/v1/listen?model=nova-3&language=${lang}&smart_format=true&punctuate=true&numerals=true`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': contentType,
      },
      body: audioBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deepgram error:', response.status, errorText);
      return res.status(response.status).json({ error: `Deepgram error: ${response.status}` });
    }

    const result = await response.json();
    let transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
    const confidence = result?.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;

    // Post-process: extract only digits and relevant characters for SKU numbers
    // This handles cases where voice recognition adds extra words
    const cleanedTranscript = transcript
      .replace(/[^\d\s\-_]/g, '') // Remove non-digits except spaces, hyphens, underscores
      .replace(/\s+/g, ' ')        // Normalize spaces
      .trim();

    const trimmed = cleanedTranscript || transcript.trim();
    if (trimmed.length > 0) {
      return res.status(200).json({ text: trimmed, confidence });
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
