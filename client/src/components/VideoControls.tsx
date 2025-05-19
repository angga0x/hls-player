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
      className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 transition-opacity duration-300"
    >
      {/* Progress Bar */}
      <div className="mb-2 mx-1 group">
        <div 
          ref={progressBarRef}
          className="h-2 bg-gray-600/40 rounded-full cursor-pointer relative group-hover:h-3 transition-all duration-200"
          onClick={handleProgressBarClick}
        >
          <div 
            className="h-full bg-white/20 rounded-full absolute top-0 left-0 transition-all"
            style={{ width: `${bufferedProgress}%` }}
          />
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full absolute top-0 left-0 transition-all"
            style={{ width: `${playedProgress}%` }}
          >
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      </div>
      
      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <button 
            className="text-white hover:text-primary transition-colors p-1.5 rounded-full hover:bg-white/10 active:bg-white/20"
            onClick={onPlayPause}
            aria-label={isPlaying ? "Jeda" : "Putar"}
          >
            <span className="material-icons text-3xl">
              {isPlaying ? "pause" : "play_arrow"}
            </span>
          </button>
          
          {/* Volume Control */}
          <div className="flex items-center gap-2 group relative">
            <button 
              className="text-white hover:text-primary transition-colors p-1 rounded-full hover:bg-white/10"
              onClick={onMute}
              aria-label={isMuted ? "Bunyikan" : "Diamkan"}
            >
              <span className="material-icons">
                {getVolumeIcon()}
              </span>
            </button>
            <div className="hidden sm:block w-0 group-hover:w-20 overflow-hidden transition-all duration-300">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={isMuted ? 0 : volume} 
                className="w-full h-1.5 bg-gray-600/50 rounded-full appearance-none cursor-pointer"
                onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                style={{
                  background: `linear-gradient(to right, var(--primary) 0%, var(--secondary) ${isMuted ? 0 : volume}%, rgba(255, 255, 255, 0.2) ${isMuted ? 0 : volume}%, rgba(255, 255, 255, 0.2) 100%)`
                }}
              />
            </div>
          </div>
          
          {/* Time Display */}
          <div className="text-sm text-white font-medium hidden sm:flex items-center bg-black/30 px-2 py-0.5 rounded-md border border-white/10">
            <span>{formatTime(currentTime)}</span>
            <span className="mx-1 text-white/50">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Forward Button */}
          <button className="text-white hover:text-primary transition-colors hidden sm:flex p-1 rounded-full hover:bg-white/10 items-center">
            <span className="material-icons">forward_10</span>
          </button>
          
          {/* Quality Indicator */}
          <div className="hidden md:flex items-center text-xs text-white/80 bg-black/30 px-2 py-0.5 rounded-md border border-white/10">
            <span className="material-icons text-xs mr-1">hd</span>
            <span>HD</span>
          </div>
          
          {/* PiP Button */}
          <button className="text-white hover:text-primary transition-colors hidden sm:flex p-1 rounded-full hover:bg-white/10 items-center">
            <span className="material-icons">picture_in_picture_alt</span>
          </button>
          
          {/* Fullscreen Button */}
          <button 
            className="text-white hover:text-primary transition-colors p-1 rounded-full hover:bg-white/10"
            onClick={onFullscreen}
            aria-label={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
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
