import { Button } from "@/components/ui/button";
import { RecentStream } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface StreamCardProps {
  stream: RecentStream;
}

export default function StreamCard({ stream }: StreamCardProps) {
  const formatTimeAgo = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="bg-dark-lighter rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <div className="aspect-video relative bg-dark-lightest">
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary bg-opacity-80 flex items-center justify-center">
            <span className="material-icons text-3xl">play_arrow</span>
          </div>
        </div>
        {stream.isLive && (
          <div className="absolute top-2 right-2 bg-error px-2 py-0.5 rounded text-xs font-medium">LIVE</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium mb-1">{stream.title}</h3>
        <p className="text-sm text-light-darker mb-2">
          Viewed {formatTimeAgo(new Date(stream.viewedAt))}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs bg-dark-lightest px-2 py-1 rounded">{stream.quality}</span>
          <Button variant="link" className="text-primary text-sm p-0 h-auto">
            Watch Again
          </Button>
        </div>
      </div>
    </div>
  );
}
