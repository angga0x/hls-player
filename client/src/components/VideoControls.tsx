import { useRef, useEffect } from "react";

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  bufferedProgress: number;
  playedProgress: number;
  onPlayPause: () => void;
  onMute: () => void;
  onVolumeChange: (volume: number) => void;
  onSeek: (progress: number) => void;
  onFullscreen: () => void;
}

export default function VideoControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  bufferedProgress,
  playedProgress,
  onPlayPause,
  onMute,
  onVolumeChange,
  onSeek,
  onFullscreen
}: VideoControlsProps) {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  
  // Format time for the player (MM:SS)
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle click on progress bar
  const handleProgressBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    onSeek(pos);
  };

  // Return appropriate volume icon based on state
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return "volume_off";
    if (volume < 50) return "volume_down";
    return "volume_up";
  };

  // Auto-hide controls when not in use
  useEffect(() => {
    if (!controlsRef.current) return;
    
    let timeout: NodeJS.Timeout;
    const container = controlsRef.current.parentElement;
    
    if (!container) return;
    
    const handleMouseMove = () => {
      if (controlsRef.current) {
        controlsRef.current.classList.add('opacity-100');
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (controlsRef.current && isPlaying) {
            controlsRef.current.classList.remove('opacity-100');
          }
        }, 3000);
      }
    };
    
    const handleMouseLeave = () => {
      if (controlsRef.current && isPlaying) {
        timeout = setTimeout(() => {
          controlsRef.current?.classList.remove('opacity-100');
        }, 1000);
      }
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    
    // Initial state
    controlsRef.current.classList.add('opacity-100');
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  return (
    <div 
      ref={controlsRef} 
      className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300"
    >
      {/* Progress Bar */}
      <div className="mb-2">
        <div 
          ref={progressBarRef}
          className="h-1.5 bg-gray-600/50 rounded-full cursor-pointer relative"
          onClick={handleProgressBarClick}
        >
          <div 
            className="h-full bg-gray-400/30 rounded-full absolute top-0 left-0"
            style={{ width: `${bufferedProgress}%` }}
          />
          <div 
            className="h-full bg-primary rounded-full absolute top-0 left-0"
            style={{ width: `${playedProgress}%` }}
          />
        </div>
      </div>
      
      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <button 
            className="text-light hover:text-primary transition-colors"
            onClick={onPlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <span className="material-icons text-3xl">
              {isPlaying ? "pause" : "play_arrow"}
            </span>
          </button>
          
          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button 
              className="text-light hover:text-primary transition-colors"
              onClick={onMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              <span className="material-icons">
                {getVolumeIcon()}
              </span>
            </button>
            <div className="hidden sm:block w-20">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={isMuted ? 0 : volume} 
                className="w-full h-1.5 bg-gray-600/50 rounded-full appearance-none cursor-pointer"
                onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                style={{
                  background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${isMuted ? 0 : volume}%, rgba(255, 255, 255, 0.2) ${isMuted ? 0 : volume}%, rgba(255, 255, 255, 0.2) 100%)`
                }}
              />
            </div>
          </div>
          
          {/* Time Display */}
          <div className="text-sm text-light-darker hidden sm:block">
            <span>{formatTime(currentTime)}</span>
            <span> / </span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Forward Button */}
          <button className="text-light hover:text-primary transition-colors hidden sm:block">
            <span className="material-icons">forward_10</span>
          </button>
          
          {/* PiP Button */}
          <button className="text-light hover:text-primary transition-colors hidden sm:block">
            <span className="material-icons">picture_in_picture_alt</span>
          </button>
          
          {/* Fullscreen Button */}
          <button 
            className="text-light hover:text-primary transition-colors"
            onClick={onFullscreen}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            <span className="material-icons">
              {isFullscreen ? "fullscreen_exit" : "fullscreen"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
