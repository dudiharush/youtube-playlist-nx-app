import React from 'react';
import { PlaylistContainerStyled } from './Playlist.styled';
import { VideoDataMap } from '../../apiService/apiService';
import { List } from 'react-movable';
import { PlaylistItem } from './PlaylistItem';
import { VideoNode } from '@youtube-playlist-nx-app/shared/video-types';

interface PlayListProps {
  videos: VideoDataMap;
  playlistArray: VideoNode[];
  onVideoSelected: (itemId: string) => void;
  removeVideo: (itemId: string) => void;
  updatePlaylistArray: ({
    oldIndex,
    newIndex
  }: {
    oldIndex: number;
    newIndex: number;
  }) => void;
}

export const Playlist = ({
  videos,
  onVideoSelected,
  removeVideo,
  updatePlaylistArray,
  playlistArray
}: PlayListProps) => {
  return (
    <List
      values={playlistArray}
      onChange={updatePlaylistArray}
      renderList={({ children, props }) => (
        <PlaylistContainerStyled {...props}>{children}</PlaylistContainerStyled>
      )}
      renderItem={({ value: videoItem, props }) => (
        <div {...props}>
          <PlaylistItem
            key={videoItem.id}
            video={videos[videoItem.data.videoId]}
            onVideoSelected={onVideoSelected}
            removeVideo={removeVideo}
            itemId={videoItem.id}
          />
        </div>
      )}
    />
  );
};
