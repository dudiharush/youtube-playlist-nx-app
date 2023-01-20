import React from "react";
import ReactPlayer from "react-player";
import { VideoItem } from "../apiService/youtubeApi";

interface VideoPlayerProps {
  video: VideoItem;
  onEnd?: () => void;
}

export const VideoPlayer = ({ video, onEnd }: VideoPlayerProps) => {
  if (!video) {
    return <div>No video selected</div>;
  }
  return (
    <div>
      <div>
        <ReactPlayer playing controls height="390px" width="640px" url={`https://www.youtube.com/watch?v=${video.id}`} onEnded={onEnd}/>
      </div>
      <div>
        <h4>{video.snippet.title}</h4>
      </div>
    </div>
  );
};
