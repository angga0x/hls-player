import StreamURLInput from "@/components/StreamURLInput";
import VideoPlayer from "@/components/VideoPlayer";
import { useStream } from "@/hooks/use-stream";
import { useState } from "react";

export default function Home() {
  const [streamUrl, setStreamUrl] = useState<string>("");
  const { isLoading, error, streamInfo } = useStream(streamUrl);

  const handleUrlSubmit = (url: string) => {
    setStreamUrl(url);
  };

  return (
    <div className="bg-dark text-light min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <header className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">M3U8 Stream Player</h1>
          <p className="text-light-darker">Watch live streams from M3U8 URLs with advanced playback controls</p>
        </header>

        {/* Stream URL Input Section */}
        <StreamURLInput 
          onUrlSubmit={handleUrlSubmit} 
          isLoading={isLoading} 
        />

        {/* Video Player Section */}
        <VideoPlayer 
          url={streamUrl} 
          isLoading={isLoading} 
          error={error} 
          streamInfo={streamInfo}
        />
      </div>
    </div>
  );
}