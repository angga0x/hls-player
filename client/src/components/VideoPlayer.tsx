import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import VideoControls from "./VideoControls";
import StreamStats from "./StreamStats";
import { initHlsPlayer, destroyHlsPlayer } from "@/lib/hlsPlayer";
import { QualityLevel, StreamInfo } from "@/hooks/use-stream";

interface VideoPlayerProps {
  url: string;
  isLoading: boolean;
  error: Error | null;
  streamInfo: StreamInfo | null;
}

export default function VideoPlayer({ url, isLoading, error, streamInfo }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [showQualityDropdown, setShowQualityDropdown] = useState(false);
  const [availableQualities, setAvailableQualities] = useState<QualityLevel[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null);

  useEffect(() => {
    // Clean up player when component unmounts
    return () => {
      if (videoRef.current) {
        destroyHlsPlayer(videoRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!url || !videoRef.current) return;

    const video = videoRef.current;
    
    // Initialize HLS player with the new URL
    const cleanup = initHlsPlayer(video, url, {
      onQualitiesLoaded: (qualities) => {
        setAvailableQualities(qualities);
        if (qualities.length > 0) {
          setSelectedQuality(qualities[0].height.toString() + 'p');
        }
      },
      onError: (err) => {
        console.error("HLS player error:", err);
      }
    });

    // Set up video event listeners
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      // Update buffered amount
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1) / video.duration);
      }
    };

    const onDurationChange = () => {
      setDuration(video.duration);
    };

    const onPlay = () => {
      setIsPlaying(true);
    };

    const onPause = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      cleanup();
    };
  }, [url]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(error => {
        console.error("Error playing video:", error);
      });
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    const newMutedState = !isMuted;
    videoRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
  };

  const changeVolume = (value: number) => {
    if (!videoRef.current) return;
    
    const volumeValue = value / 100;
    videoRef.current.volume = volumeValue;
    setVolume(volumeValue);
    
    // If we're changing volume and it was muted, unmute it
    if (isMuted && volumeValue > 0) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  const seekTo = (value: number) => {
    if (!videoRef.current) return;
    
    const newTime = value * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const toggleQualityDropdown = () => {
    setShowQualityDropdown(!showQualityDropdown);
  };

  const selectQuality = (level: QualityLevel) => {
    // In a real implementation, this would change the quality level in HLS.js
    setSelectedQuality(level.height.toString() + 'p');
    setShowQualityDropdown(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRetry = () => {
    if (url) {
      // Reinitialize the player with the same URL
      if (videoRef.current) {
        destroyHlsPlayer(videoRef.current);
        initHlsPlayer(videoRef.current, url, {
          onQualitiesLoaded: (qualities) => {
            setAvailableQualities(qualities);
            if (qualities.length > 0) {
              setSelectedQuality(qualities[0].height.toString() + 'p');
            }
          },
          onError: (err) => {
            console.error("HLS player error:", err);
          }
        });
      }
    }
  };

  return (
    <div className="bg-dark-lighter rounded-xl shadow-lg overflow-hidden">
      {/* Player Header */}
      <div className="px-6 py-4 border-b border-dark-lightest flex justify-between items-center">
        <div>
          <h2 className="text-xl font-medium">Stream Player</h2>
          {url && !error && !isLoading && (
            <p className="text-secondary text-sm flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary inline-block"></span>
              Live Streaming
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {url && !error && availableQualities.length > 0 && (
            <div className="relative">
              <button 
                className="text-light-darker hover:text-light flex items-center gap-1 py-1 px-2 rounded hover:bg-dark-lightest transition-colors"
                onClick={toggleQualityDropdown}
              >
                <span className="material-icons text-sm">settings</span>
                <span>Quality</span>
                <span className="material-icons text-sm">arrow_drop_down</span>
              </button>
              {showQualityDropdown && (
                <div className="quality-dropdown show absolute bottom-100 right-0 bg-dark-lightest rounded-lg shadow-lg min-w-[150px] z-10">
                  {availableQualities.map((quality, index) => (
                    <div 
                      key={index}
                      className={`quality-option p-2 hover:bg-dark-lighter cursor-pointer ${selectedQuality === quality.height.toString() + 'p' ? 'text-primary' : ''}`}
                      onClick={() => selectQuality(quality)}
                    >
                      <span>{quality.height}p</span>
                    </div>
                  ))}
                  <div 
                    className={`quality-option p-2 hover:bg-dark-lighter cursor-pointer ${selectedQuality === 'Auto' ? 'text-primary' : ''}`}
                    onClick={() => setSelectedQuality('Auto')}
                  >
                    <span>Auto</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Video Container */}
      <div className="video-container relative bg-black aspect-video flex items-center justify-center">
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark bg-opacity-70 z-10 animate-fade-in">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-light">Loading stream...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark bg-opacity-80 z-10">
            <span className="material-icons text-5xl text-error mb-4">error_outline</span>
            <h3 className="text-xl font-medium mb-2">Stream Error</h3>
            <p className="text-light-darker text-center max-w-md">
              {error.message || "Unable to load the stream. Please check the URL and try again."}
            </p>
            <Button 
              className="mt-4 px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors"
              onClick={handleRetry}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* No URL State */}
        {!url && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-lightest z-10">
            <div className="w-1/2 max-w-md text-center">
              <span className="material-icons text-6xl text-light-darker mb-4">play_circle_outline</span>
              <h3 className="text-xl font-medium mb-2">Ready to Stream</h3>
              <p className="text-light-darker mb-6">Enter an M3U8 URL above and click "Load Stream" to begin watching</p>
              <div className="flex gap-4 justify-center">
                <Button className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors flex items-center gap-2">
                  <span className="material-icons">help_outline</span>
                  <span>Need Help?</span>
                </Button>
                <Button variant="outline" className="px-4 py-2 bg-dark-lightest hover:bg-dark-lighter border border-gray-700 rounded-lg transition-colors flex items-center gap-2">
                  <span className="material-icons">smart_display</span>
                  <span>Sample Streams</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Video Element */}
        <video 
          ref={videoRef}
          className="custom-video-player w-full h-full"
          playsInline
        ></video>

        {/* Custom Video Controls */}
        {url && !error && !isLoading && (
          <VideoControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume * 100}
            isMuted={isMuted}
            isFullscreen={isFullscreen}
            bufferedProgress={buffered * 100}
            playedProgress={(currentTime / duration) * 100 || 0}
            onPlayPause={togglePlay}
            onMute={toggleMute}
            onVolumeChange={changeVolume}
            onSeek={seekTo}
            onFullscreen={toggleFullscreen}
          />
        )}
      </div>

      {/* Player Footer */}
      {url && !error && !isLoading && (
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-medium mb-1">Live Stream</h3>
            <p className="text-sm text-light-darker">
              {streamInfo?.resolution && <span>{streamInfo.resolution} • </span>}
              {streamInfo?.bitrate && <span>{streamInfo.bitrate} • </span>}
              {streamInfo?.codec && <span>{streamInfo.codec}</span>}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="px-3 py-1.5 text-sm bg-dark-lightest hover:bg-dark-lighter rounded-lg transition-colors flex items-center gap-1">
              <span className="material-icons text-sm">share</span>
              <span>Share</span>
            </Button>
            <Button variant="secondary" size="sm" className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary-dark rounded-lg transition-colors flex items-center gap-1">
              <span className="material-icons text-sm">play_arrow</span>
              <span>Watch Later</span>
            </Button>
          </div>
        </div>
      )}
      
      {/* Stream Statistics Section */}
      {url && !error && !isLoading && streamInfo && (
        <div className="mt-6">
          <StreamStats 
            isPlaying={isPlaying} 
            streamInfo={streamInfo} 
            currentTime={currentTime} 
          />
        </div>
      )}
    </div>
  );
}
