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
import { Readable } from 'stream';

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

async function parseFormData(req: VercelRequest): Promise<{ audio: Buffer; language: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    
    if (!boundaryMatch) {
      return reject(new Error('Missing multipart boundary'));
    }
    
    const boundary = '--' + boundaryMatch[1];
    const boundaryBuffer = Buffer.from(boundary);
    
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks);
        
        let audioBuffer: Buffer | null = null;
        let language = '';
        let mimeType = '';
        
        // Split by boundary while preserving binary data.
        // A boundary only counts when it sits at the start of a line
        // (start of body or preceded by CRLF) — binary audio can legally
        // contain any byte sequence, so we must never filter parts by
        // their content.
        const splitBody = (body: Buffer, boundary: Buffer): Buffer[] => {
          const positions: number[] = [];
          let idx = body.indexOf(boundary);
          while (idx !== -1) {
            if (idx === 0 || (body[idx - 2] === 0x0D && body[idx - 1] === 0x0A)) {
              positions.push(idx);
            }
            idx = body.indexOf(boundary, idx + boundary.length);
          }

          const parts: Buffer[] = [];
          for (let i = 0; i < positions.length - 1; i++) {
            // Skip past the boundary line's trailing CRLF
            const lineEnd = body.indexOf(Buffer.from('\r\n'), positions[i] + boundary.length);
            if (lineEnd === -1) continue;
            const partStart = lineEnd + 2;
            // Strip the CRLF that precedes the next boundary
            const partEnd = positions[i + 1] - 2;
            if (partEnd > partStart) {
              parts.push(body.slice(partStart, partEnd));
            }
          }
          return parts;
        };

        const parts = splitBody(body, boundaryBuffer);
        
        for (const part of parts) {
          // Find header-content separation (two CRLF = \r\n\r\n)
          let headerEnd = -1;
          for (let i = 0; i < part.length - 3; i++) {
            if (part[i] === 0x0D && part[i + 1] === 0x0A && 
                part[i + 2] === 0x0D && part[i + 3] === 0x0A) {
              headerEnd = i + 4;
              break;
            }
          }
          if (headerEnd === -1) continue;
          
          const header = part.slice(0, headerEnd).toString('utf-8');
          const contentBuffer = part.slice(headerEnd);
          
          if (header.includes('name="audio"')) {
            // Extract Content-Type from header to confirm
            const contentTypeMatch = header.match(/Content-Type:\s*([^\r\n]+)/i);
            if (contentTypeMatch) {
              mimeType = contentTypeMatch[1].trim();
            }
            // Content is already binary - just use it directly
            audioBuffer = contentBuffer;
          } else if (header.includes('name="language"')) {
            language = contentBuffer.toString('utf-8').trim();
          } else if (header.includes('name="mimeType"')) {
            mimeType = contentBuffer.toString('utf-8').trim();
          }
        }
        
        if (!audioBuffer || audioBuffer.length === 0) {
          return reject(new Error('No audio data provided'));
        }
        
        resolve({ audio: audioBuffer, language, mimeType });
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '10mb',
  },
};

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
    let audioBuffer: Buffer;
    let language: string;
    let mimeType: string;
    
    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('multipart/form-data')) {
      ({ audio: audioBuffer, language, mimeType } = await parseFormData(req));
    } else if (contentType.includes('application/json')) {
      const body = await new Promise<{ audio: string; language?: string; mimeType?: string }>((resolve, reject) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
        req.on('error', reject);
      });
      
      if (!body.audio) {
        return res.status(400).json({ error: 'No audio data provided' });
      }
      
      audioBuffer = Buffer.from(body.audio, 'base64');
      language = body.language || '';
      mimeType = body.mimeType || '';
    } else {
      return res.status(400).json({ error: 'Unsupported content type' });
    }

    if (audioBuffer.length === 0) {
      return res.status(400).json({ error: 'Audio data is empty' });
    }

    if (audioBuffer.length < 100) {
      return res.status(400).json({ error: 'Audio too short - record for at least 1 second' });
    }

    const audioContentType = mimeType || (contentType.includes('multipart') ? 'audio/webm' : contentType);

    const lang = language === 'en' ? 'en' : 'zh';

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

    const endpoint = `https://api.deepgram.com/v1/listen?model=nova-3&language=${lang}&smart_format=true&punctuate=true&numerals=true&noise_reduction=true&${keytermParams}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': audioContentType,
        },
        body: audioBuffer,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Deepgram error:', response.status, errorText);
        return res.status(response.status).json({ error: `Deepgram error: ${response.status}` });
      }

      const result = await response.json();
      let transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
      const confidence = result?.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;

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
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error('Speech API error:', error);
    return res.status(500).json({ error: 'Failed to process speech' });
  }
}