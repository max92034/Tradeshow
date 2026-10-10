// MediaRecorder lifecycle and MIME negotiation helpers used by
// useDeepgramVoiceSearch. Kept free of React state so the platform-specific
// quirks (iOS Safari audio session, WebAudio silence bug) live in one place.

export function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1);
}

export function getBestAudioMimeType(isIOS: boolean): string {
  if (isIOS) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/mp4')) {
      return 'audio/mp4';
    }
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm')) {
      return 'audio/webm';
    }
    return 'audio/mp4';
  }

  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ];

  for (const type of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return 'audio/webm';
}

export async function acquireMicStream(isIOS: boolean): Promise<MediaStream> {
  // NOTE: getUserMedia must run as early as possible in the user-gesture
  // call stack. On iOS Safari, awaiting anything (e.g. AudioContext.resume)
  // before this call can make the permission prompt never appear.
  // Also: do NOT route this stream through WebAudio on iOS — a known bug
  // makes MediaRecorder capture silence when the same stream is consumed
  // by an AudioContext, which is exactly the "no speech recognized"
  // failure seen on iPhone.
  const constraints: MediaStreamConstraints = {
    audio: isIOS
      ? true
      : {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
          channelCount: 1,
        },
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  const audioTracks = stream.getAudioTracks();
  if (audioTracks.length === 0) {
    stream.getTracks().forEach(t => t.stop());
    throw new Error('No audio track available');
  }
  const track = audioTracks[0];
  if (!track.enabled) track.enabled = true;

  return stream;
}

export function createMediaRecorder(
  stream: MediaStream,
  isIOS: boolean
): { recorder: MediaRecorder; mimeType: string } {
  const preferredMimeType = getBestAudioMimeType(isIOS);

  const recorderOptions: MediaRecorderOptions = {};
  if (preferredMimeType) {
    recorderOptions.mimeType = preferredMimeType;
  }
  if (!isIOS) {
    recorderOptions.audioBitsPerSecond = 128000;
  }

  // Try the preferred MIME type; fall back to the browser default.
  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(stream, recorderOptions);
  } catch {
    recorder = new MediaRecorder(stream);
  }
  // Capture the actual MIME type from the created recorder
  const mimeType = recorder.mimeType || preferredMimeType || 'audio/webm';

  return { recorder, mimeType };
}

export function stopStreamTracks(stream: MediaStream | null): void {
  stream?.getTracks().forEach(t => t.stop());
}
