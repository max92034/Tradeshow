/**
 * Vercel Serverless Function: /api/speech
 * 
 * Receives audio from the frontend and sends it to Azure Speech-to-Text.
 * Returns the transcribed text.
 * 
 * Environment variables needed (set in Vercel dashboard):
 * - AZURE_SPEECH_KEY: Your Azure Speech API key
 * - AZURE_SPEECH_REGION: Your Azure region (e.g., eastasia, southeastasia, westeurope)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const azureKey = process.env.AZURE_SPEECH_KEY;
  const azureRegion = process.env.AZURE_SPEECH_REGION;

  if (!azureKey || !azureRegion) {
    return res.status(500).json({ 
      error: 'Azure Speech not configured. Please set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION environment variables.' 
    });
  }

  try {
    const { audio, language } = req.body;

    if (!audio) {
      return res.status(400).json({ error: 'No audio data provided' });
    }

    // Azure Speech-to-Text REST API endpoint
    const endpoint = `https://${azureRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${language || 'zh-CN'}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': azureKey,
        'Content-Type': 'audio/webm;codecs=opus',
      },
      body: Buffer.from(audio, 'base64'),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure Speech error:', response.status, errorText);
      return res.status(response.status).json({ error: `Azure error: ${response.status}` });
    }

    const result = await response.json();

    if (result.RecognitionStatus === 'Success') {
      return res.status(200).json({ 
        text: result.NBest?.[0]?.Display || result.Text || '',
        confidence: result.NBest?.[0]?.Confidence || 0,
      });
    } else {
      return res.status(200).json({ 
        text: '',
        error: `Recognition failed: ${result.RecognitionStatus}`,
      });
    }
  } catch (error) {
    console.error('Speech API error:', error);
    return res.status(500).json({ error: 'Failed to process speech' });
  }
}
