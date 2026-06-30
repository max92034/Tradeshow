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

    // Build request headers
    const headers = {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'audio/webm',
    };

    // Helper to call Deepgram with a specific language
    const transcribeWithLanguage = async (lang: string): Promise<{ transcript: string; confidence: number }> => {
      const endpoint = `https://api.deepgram.com/v1/listen?model=nova-3&language=${lang}&smart_format=true&punctuate=true`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: audioBuffer,
      });

      if (!response.ok) {
        throw new Error(`Deepgram error: ${response.status}`);
      }

      const result = await response.json();
      const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
      const confidence = result?.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;

      return { transcript: transcript.trim(), confidence };
    };

    let finalTranscript = '';
    let finalConfidence = 0;

    if (language === 'en') {
      // English only mode
      const result = await transcribeWithLanguage('en');
      finalTranscript = result.transcript;
      finalConfidence = result.confidence;
    } else if (language === 'zh-CN' || language === 'zh') {
      // Chinese only mode
      const result = await transcribeWithLanguage('zh');
      finalTranscript = result.transcript;
      finalConfidence = result.confidence;
    } else {
      // Auto mode: run both English and Chinese in parallel, pick the best result
      const [enResult, zhResult] = await Promise.all([
        transcribeWithLanguage('en'),
        transcribeWithLanguage('zh'),
      ]);

      // Pick the result with higher confidence and non-empty transcript
      if (enResult.transcript && zhResult.transcript) {
        // Both have results - pick the one with higher confidence
        if (enResult.confidence >= zhResult.confidence) {
          finalTranscript = enResult.transcript;
          finalConfidence = enResult.confidence;
        } else {
          finalTranscript = zhResult.transcript;
          finalConfidence = zhResult.confidence;
        }
      } else if (enResult.transcript) {
        finalTranscript = enResult.transcript;
        finalConfidence = enResult.confidence;
      } else if (zhResult.transcript) {
        finalTranscript = zhResult.transcript;
        finalConfidence = zhResult.confidence;
      }
      // If neither has results, return empty
    }

    if (finalTranscript.length > 0) {
      return res.status(200).json({ text: finalTranscript, confidence: finalConfidence });
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
