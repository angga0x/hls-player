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
    <Card className="mb-8 bg-card/80 backdrop-blur-sm rounded-xl shadow-xl border border-border/40">
      <CardContent className="p-6">
        <div className="flex items-center mb-5">
          <span className="material-icons text-primary text-2xl mr-3">link</span>
          <h2 className="text-xl font-semibold">Masukkan URL Stream</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative">
              <Input
                type="url"
                placeholder="Masukkan URL M3U8 (contoh: https://example.com/stream.m3u8)"
                className="w-full px-4 py-3 bg-background/80 text-foreground border border-input/50 rounded-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all h-12"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit();
                  }
                }}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <span className="material-icons text-lg">play_circle</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2 ml-1">
              Tempel URL streaming HLS yang valid untuk memulai pemutaran
            </p>
          </div>
          <div className="flex items-start">
            <Button
              onClick={handleSubmit}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:brightness-110 text-white font-medium rounded-lg transition-all flex items-center gap-2 min-w-[140px] justify-center h-12 shadow-md hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="material-icons animate-spin text-xl">refresh</span>
                  <span>Memuat...</span>
                </>
              ) : (
                <>
                  <span className="material-icons text-xl">stream</span>
                  <span>Putar Stream</span>
                </>
              )}
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded-lg text-sm flex items-center gap-2 text-destructive animate-in fade-in duration-300">
            <span className="material-icons text-base">error_outline</span>
            <span>{error}</span>
          </div>
        )}
        
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center">
            <span className="material-icons text-xs mr-1">verified</span>
            <span>Streaming HLS Berkualitas Tinggi</span>
          </div>
          <div className="flex items-center">
            <span className="material-icons text-xs mr-1">speed</span>
            <span>Buffer Dioptimalkan</span>
          </div>
          <div className="flex items-center">
            <span className="material-icons text-xs mr-1">policy</span>
            <span>Pemutaran Aman</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
