import StreamCard from "./StreamCard";
import { RecentStream } from "@shared/schema";

interface RecentStreamsProps {
  streams: RecentStream[];
}

export default function RecentStreams({ streams }: RecentStreamsProps) {
  if (streams.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-10">
      <h2 className="text-xl font-medium mb-4">Recently Played</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {streams.map((stream) => (
          <StreamCard key={stream.id} stream={stream} />
        ))}
      </div>
    </div>
  );
}
