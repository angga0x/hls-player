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
    <div className="bg-card rounded-xl shadow-xl overflow-hidden border border-border/40">
      {/* Player Header */}
      <div className="px-6 py-4 border-b border-border/80 flex justify-between items-center bg-gradient-to-r from-background/90 to-muted/70">
        <div className="flex items-center">
          <span className="material-icons text-primary text-2xl mr-3">smart_display</span>
          <div>
            <h2 className="text-xl font-semibold">Stream Player</h2>
            {url && !error && !isLoading && (
              <p className="text-secondary text-sm flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-secondary inline-block animate-pulse"></span>
                <span>Live Streaming</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {url && !error && availableQualities.length > 0 && (
            <div className="relative">
              <button 
                className="flex items-center gap-1 py-1.5 px-3 rounded-lg border border-border/60 bg-background/60 hover:bg-background/90 transition-colors shadow-sm"
                onClick={toggleQualityDropdown}
              >
                <span className="material-icons text-primary text-sm">settings</span>
                <span className="text-sm font-medium">Kualitas</span>
                <span className="material-icons text-sm text-muted-foreground">arrow_drop_down</span>
              </button>
              {showQualityDropdown && (
                <div className="quality-dropdown absolute top-full right-0 mt-1 bg-popover rounded-lg shadow-xl min-w-[150px] z-10 border border-border/40 overflow-hidden">
                  {availableQualities.map((quality, index) => (
                    <div 
                      key={index}
                      className={`quality-option p-2.5 px-3 hover:bg-muted cursor-pointer transition-colors ${selectedQuality === quality.height.toString() + 'p' ? 'bg-primary/10 text-primary font-medium' : ''}`}
                      onClick={() => selectQuality(quality)}
                    >
                      <div className="flex items-center">
                        {selectedQuality === quality.height.toString() + 'p' && (
                          <span className="material-icons text-sm mr-1.5">check</span>
                        )}
                        <span>{quality.height}p</span>
                      </div>
                    </div>
                  ))}
                  <div 
                    className={`quality-option p-2.5 px-3 hover:bg-muted cursor-pointer transition-colors ${selectedQuality === 'Auto' ? 'bg-primary/10 text-primary font-medium' : ''}`}
                    onClick={() => setSelectedQuality('Auto')}
                  >
                    <div className="flex items-center">
                      {selectedQuality === 'Auto' && (
                        <span className="material-icons text-sm mr-1.5">check</span>
                      )}
                      <span>Otomatis</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Video Container */}
      <div className="video-container relative bg-black aspect-video flex items-center justify-center overflow-hidden rounded-sm">
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10 animate-in fade-in duration-300">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-20 blur-xl rounded-full"></div>
              <div className="w-16 h-16 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4 relative"></div>
            </div>
            <p className="text-foreground font-medium mt-4">Memuat stream...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm z-10">
            <div className="p-8 rounded-xl bg-background/70 border border-destructive/20 shadow-lg max-w-md text-center">
              <span className="material-icons text-6xl text-destructive mb-4 opacity-80">error_outline</span>
              <h3 className="text-xl font-semibold mb-3">Error Stream</h3>
              <p className="text-muted-foreground mb-5">
                {error.message || "Gagal memuat stream. Silakan periksa URL dan coba lagi."}
              </p>
              <Button 
                className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary hover:brightness-110 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
                onClick={handleRetry}
              >
                <span className="material-icons">refresh</span>
                <span>Coba Lagi</span>
              </Button>
            </div>
          </div>
        )}

        {/* No URL State */}
        {!url && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 backdrop-blur-sm z-10 p-4">
            <div className="max-w-md text-center bg-background/70 p-8 rounded-2xl border border-border/60 shadow-lg">
              <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-5 rounded-full inline-block mb-6">
                <span className="material-icons text-6xl text-primary">play_circle</span>
              </div>
              <h3 className="text-2xl font-semibold mb-3">Siap Streaming</h3>
              <p className="text-muted-foreground mb-6">Masukkan URL M3U8 di atas dan klik "Putar Stream" untuk mulai menonton</p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button className="px-4 py-2.5 bg-primary/90 hover:bg-primary rounded-lg transition-colors flex items-center gap-2 shadow-md">
                  <span className="material-icons">help_outline</span>
                  <span>Bantuan</span>
                </Button>
                <Button variant="outline" className="px-4 py-2.5 bg-card hover:bg-muted border border-border rounded-lg transition-colors flex items-center gap-2 shadow-sm">
                  <span className="material-icons">smart_display</span>
                  <span>Stream Contoh</span>
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
        <div className="px-6 py-4 bg-gradient-to-r from-background/90 to-muted/70 border-t border-border/80">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold mb-1 flex items-center gap-1.5">
                <span className="material-icons text-secondary text-sm">stream</span>
                <span>Informasi Stream</span>
              </h3>
              <div className="flex items-center text-sm text-muted-foreground gap-2 flex-wrap">
                {streamInfo?.resolution && (
                  <div className="flex items-center bg-muted/50 px-2 py-0.5 rounded">
                    <span className="material-icons text-xs mr-1">hd</span>
                    <span>{streamInfo.resolution}</span>
                  </div>
                )}
                {streamInfo?.bitrate && (
                  <div className="flex items-center bg-muted/50 px-2 py-0.5 rounded">
                    <span className="material-icons text-xs mr-1">speed</span>
                    <span>{streamInfo.bitrate}</span>
                  </div>
                )}
                {streamInfo?.codec && (
                  <div className="flex items-center bg-muted/50 px-2 py-0.5 rounded">
                    <span className="material-icons text-xs mr-1">code</span>
                    <span>{streamInfo.codec}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="px-3 py-1.5 text-sm bg-background/80 hover:bg-background rounded-lg transition-all flex items-center gap-1 border border-border/60 shadow-sm">
                <span className="material-icons text-sm">share</span>
                <span>Bagikan</span>
              </Button>
              <Button variant="secondary" size="sm" className="px-3 py-1.5 text-sm bg-secondary hover:opacity-90 rounded-lg transition-all flex items-center gap-1 shadow-sm text-secondary-foreground">
                <span className="material-icons text-sm">bookmark</span>
                <span>Simpan</span>
              </Button>
            </div>
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
