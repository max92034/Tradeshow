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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.DEEPGRAM_API_KEY;

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

    const lang = language || 'zh-CN';
    const model = lang === 'zh-CN' ? 'nova-3' : 'nova-3';

    const endpoint = `https://api.deepgram.com/v1/listen?model=${model}&language=${lang}&smart_format=true`;

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
