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

    // Keyterm prompting boosts recognition accuracy for important terms.
    // Since we only want number recognition, we heavily boost ALL digit patterns
    // so the model strongly prefers number words over similar-sounding characters.
    const zhDigits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const keyterms: string[] = lang === 'zh'
      ? [
          ...zhDigits,
          ...zhDigits.map(d => d + d),
          '零一', '零二', '零三', '零四', '零五', '零六', '零七', '零八', '零九',
          '一零', '二零', '三零', '四零', '五零', '六零', '七零', '八零', '九零',
          '一二', '二三', '三四', '四五', '五六', '六七', '七八', '八九',
          '二一', '三二', '四三', '五四', '六五', '七六', '八七', '九八',
          '零一二', '一二三', '二三四', '三四五', '四五六', '五六七', '六七八', '七八九', '八九零',
          '零一二三', '一二三四', '二三四五', '三四五六', '四五六七',
          '五六七八', '六七八九', '七八九零', '八九零一', '九零一二',
          '一百', '一千', '一万', '号码', '编号',
        ]
      : [
          'zero', 'one', 'two', 'three', 'four', 'five',
          'six', 'seven', 'eight', 'nine',
          'oh', 'double', 'triple',
          'zero zero', 'one one', 'two two', 'three three', 'four four',
          'five five', 'six six', 'seven seven', 'eight eight', 'nine nine',
        ];

    const keytermParams = keyterms
      .map(t => `keyterm=${encodeURIComponent(t)}`)
      .join('&');

    // numerals=true converts spoken numbers to digits.
    // We request nova-3 with the full Mandarin model variant for best Chinese accuracy.
    const endpoint = `https://api.deepgram.com/v1/listen?model=nova-3&language=${lang}&smart_format=true&punctuate=true&numerals=true&${keytermParams}`;

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

    // Extract only digits and hyphens/underscores for SKU number search
    // This applies to both English and Chinese - ONLY numbers are returned
    const cleanedTranscript = transcript
      .replace(/[^\d\-_]/g, '')
      .trim();

    if (cleanedTranscript.length > 0) {
      return res.status(200).json({ text: cleanedTranscript, confidence });
    } else {
      return res.status(200).json({
        text: '',
        error: 'Only numbers are recognized. Please speak digits 0-9.',
      });
    }
  } catch (error) {
    console.error('Speech API error:', error);
    return res.status(500).json({ error: 'Failed to process speech' });
  }
}
