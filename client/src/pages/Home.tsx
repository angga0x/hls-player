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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <header className="mb-10 text-center">
          <div className="flex items-center justify-center mb-4">
            <span className="material-icons text-4xl text-primary mr-3">live_tv</span>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">M3U8 Stream Player</h1>
          </div>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Stream profesional dengan teknologi HLS dan kontrol pemutaran canggih untuk pengalaman streaming terbaik
          </p>
        </header>

        {/* Stream URL Input Section */}
        <div className="mb-8 max-w-4xl mx-auto">
          <StreamURLInput 
            onUrlSubmit={handleUrlSubmit} 
            isLoading={isLoading} 
          />
        </div>

        {/* Video Player Section */}
        <div className="backdrop-blur-sm bg-card/50 p-6 rounded-xl shadow-lg mb-10">
          <VideoPlayer 
            url={streamUrl} 
            isLoading={isLoading} 
            error={error} 
            streamInfo={streamInfo}
          />
        </div>
        
        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground mt-auto pt-8">
          <p>© 2025 Stream Player Pro. Semua hak dilindungi.</p>
        </footer>
      </div>
    </div>
  );
}