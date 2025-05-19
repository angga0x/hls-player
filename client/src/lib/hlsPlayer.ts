import Hls from 'hls.js';
import { QualityLevel } from '@/hooks/use-stream';

interface HlsPlayerOptions {
  onQualitiesLoaded?: (qualities: QualityLevel[]) => void;
  onError?: (error: Error) => void;
}

const hlsInstances = new WeakMap<HTMLVideoElement, Hls>();

export function initHlsPlayer(video: HTMLVideoElement, url: string, options: HlsPlayerOptions = {}): () => void {
  // Clean up any existing HLS instance for this video element
  destroyHlsPlayer(video);

  // Check if HLS is supported in the browser
  if (!Hls.isSupported()) {
    // For browsers that have native HLS support (Safari)
    try {
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(err => {
          if (options.onError) {
            options.onError(new Error("Failed to play video: " + err.message));
          }
        });
      });
      return () => {
        video.src = "";
      };
    } catch (err) {
      if (options.onError) {
        options.onError(new Error("Native HLS playback failed"));
      }
      return () => {};
    }
  }

  // Create a new HLS instance with optimized configuration
  const hls = new Hls({
    enableWorker: true,
    lowLatencyMode: true,
    backBufferLength: 90,
    maxBufferLength: 60, // default 30
    maxMaxBufferLength: 120,
    liveSyncDuration: 10
  });
  
  hlsInstances.set(video, hls);

  // Bind HLS to the video element
  hls.attachMedia(video);

  // Load the source
  hls.on(Hls.Events.MEDIA_ATTACHED, () => {
    hls.loadSource(url);
  });

  // Handle manifest parsed event to get quality levels
  hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
    if (options.onQualitiesLoaded && data.levels.length > 0) {
      const qualities: QualityLevel[] = data.levels.map((level: any) => ({
        bitrate: level.bitrate,
        width: level.width,
        height: level.height,
        name: `${level.height}p`,
        level: level.id
      }));
      
      options.onQualitiesLoaded(qualities);
    }

    // Auto-play after manifest is parsed
    video.play().catch(err => {
      console.warn("Auto-play failed:", err);
      // Many browsers block autoplay with sound
      video.muted = true;
      video.play().catch(muteErr => {
        if (options.onError) {
          options.onError(new Error("Auto-play failed even with muted audio"));
        }
      });
    });
  });

  // Handle HLS errors
  hls.on(Hls.Events.ERROR, (event, data) => {
    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          // Try to recover network error
          hls.startLoad();
          break;
        case Hls.ErrorTypes.MEDIA_ERROR:
          // Try to recover media error
          hls.recoverMediaError();
          break;
        default:
          // Cannot recover
          destroyHlsPlayer(video);
          if (options.onError) {
            options.onError(new Error(`Fatal HLS error: ${data.type}`));
          }
          break;
      }
    } else {
      // Non-fatal error, log it
      console.warn("Non-fatal HLS error:", data);
    }
  });

  // Return cleanup function
  return () => {
    destroyHlsPlayer(video);
  };
}

export function destroyHlsPlayer(video: HTMLVideoElement): void {
  const hls = hlsInstances.get(video);
  if (hls) {
    hls.destroy();
    hlsInstances.delete(video);
  }
  video.src = "";
  video.removeAttribute('src');
  video.load();
}

export function changeQuality(video: HTMLVideoElement, level: number): boolean {
  const hls = hlsInstances.get(video);
  if (hls) {
    hls.currentLevel = level;
    return true;
  }
  return false;
}

export function setAutoQuality(video: HTMLVideoElement): boolean {
  const hls = hlsInstances.get(video);
  if (hls) {
    hls.currentLevel = -1; // -1 is auto
    return true;
  }
  return false;
}
