import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface StreamURLInputProps {
  onUrlSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function StreamURLInput({ onUrlSubmit, isLoading }: StreamURLInputProps) {
  const [url, setUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const validateUrl = (value: string): boolean => {
    // Basic validation for M3U8 URL
    // In a production environment, this could be more comprehensive
    return value.trim() !== "" && value.trim().endsWith('.m3u8');
  };

  const handleSubmit = () => {
    if (validateUrl(url)) {
      setError(null);
      onUrlSubmit(url);
    } else {
      setError("Please enter a valid M3U8 URL");
    }
  };

  return (
    <Card className="mb-8 bg-dark-lighter rounded-xl shadow-lg">
      <CardContent className="p-6">
        <h2 className="text-xl font-medium mb-4">Enter Stream URL</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter M3U8 URL (e.g., https://example.com/stream.m3u8)"
              className="w-full px-4 py-3 bg-dark-lightest text-light border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-sm text-light-darker mt-2">
              Paste a valid HLS stream URL to begin playback
            </p>
          </div>
          <div className="flex items-start">
            <Button
              onClick={handleSubmit}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors flex items-center gap-2 min-w-[120px] justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span>Loading...</span>
                  <span className="material-icons animate-spin">refresh</span>
                </>
              ) : (
                <span>Load Stream</span>
              )}
            </Button>
          </div>
        </div>
        {error && (
          <div className="mt-3 text-error text-sm flex items-center gap-1">
            <span className="material-icons text-sm">error</span>
            <span>{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
