import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { StreamInfo } from "@/hooks/use-stream";

interface StreamStatsProps {
  isPlaying: boolean;
  streamInfo: StreamInfo | null;
  currentTime: number;
}

export default function StreamStats({ isPlaying, streamInfo, currentTime }: StreamStatsProps) {
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");
  const [cpuUsage, setCpuUsage] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [networkSpeed, setNetworkSpeed] = useState<number>(0);

  // Update simulated resource usage stats every second
  useEffect(() => {
    if (!isPlaying || !streamInfo) return;

    const interval = setInterval(() => {
      // Simulated CPU usage between 5-15%
      setCpuUsage(Math.floor(Math.random() * 10) + 5);
      
      // Simulated memory usage between 50-70%
      setMemoryUsage(Math.floor(Math.random() * 20) + 50);
      
      // Simulated network speed fluctuation 2.0-3.0 Mbps
      setNetworkSpeed(2 + Math.random());
      
      // Update stream stats based on actual play time
      if (streamInfo.startTime) {
        const elapsed = new Date().getTime() - streamInfo.startTime.getTime();
        setElapsedTime(formatElapsedTime(elapsed));
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isPlaying, streamInfo]);

  // Format elapsed time as HH:MM:SS
  const formatElapsedTime = (ms: number): string => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!streamInfo) return null;

  return (
    <Card className="bg-dark-lighter shadow-lg overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Stream Statistics</h3>
          <Badge variant={streamInfo.status === 'live' ? 'secondary' : streamInfo.status === 'buffering' ? 'outline' : 'destructive'} className="px-2 py-1">
            {streamInfo.status === 'live' ? '● LIVE' : streamInfo.status === 'buffering' ? '● BUFFERING' : '● ERROR'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stream Information Column */}
          <div className="space-y-4">
            <div>
              <h4 className="text-light-darker mb-1 text-sm">Stream Info</h4>
              <div className="grid grid-cols-2 gap-y-2">
                <div className="text-sm">Resolution:</div>
                <div className="text-sm font-medium">{streamInfo.resolution || 'Unknown'}</div>
                
                <div className="text-sm">Bitrate:</div>
                <div className="text-sm font-medium">{streamInfo.bitrate || 'Unknown'}</div>
                
                <div className="text-sm">Codec:</div>
                <div className="text-sm font-medium">{streamInfo.codec || 'Unknown'}</div>
                
                <div className="text-sm">Elapsed Time:</div>
                <div className="text-sm font-medium">{elapsedTime}</div>
              </div>
            </div>

            <div>
              <h4 className="text-light-darker mb-1 text-sm">Audience</h4>
              <div className="grid grid-cols-2 gap-y-2">
                <div className="text-sm">Current Viewers:</div>
                <div className="text-sm font-medium">{streamInfo.viewerCount?.toLocaleString() || '0'}</div>
              </div>
            </div>
          </div>

          {/* Performance Metrics Column */}
          <div className="space-y-4">
            <div>
              <h4 className="text-light-darker mb-1 text-sm">Performance</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Buffer Health</span>
                    <span className="text-sm font-medium">{streamInfo.bufferHealth || 0}%</span>
                  </div>
                  <Progress value={streamInfo.bufferHealth || 0} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Current Speed</span>
                    <span className="text-sm font-medium">{networkSpeed.toFixed(1)} Mbps</span>
                  </div>
                  <Progress value={networkSpeed * 20} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">CPU Usage</span>
                    <span className="text-sm font-medium">{cpuUsage}%</span>
                  </div>
                  <Progress value={cpuUsage} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm font-medium">{memoryUsage}%</span>
                  </div>
                  <Progress value={memoryUsage} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-dark-lightest rounded-lg p-3">
            <div className="text-xs text-light-darker mb-1">Dropped Frames</div>
            <div className="text-lg font-medium">{streamInfo.droppedFrames || 0}</div>
          </div>
          
          <div className="bg-dark-lightest rounded-lg p-3">
            <div className="text-xs text-light-darker mb-1">Packet Loss</div>
            <div className="text-lg font-medium">{streamInfo.packetLoss?.toFixed(1) || 0}%</div>
          </div>
          
          <div className="bg-dark-lightest rounded-lg p-3">
            <div className="text-xs text-light-darker mb-1">Current Position</div>
            <div className="text-lg font-medium">{formatTime(currentTime)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Format time as MM:SS
const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};