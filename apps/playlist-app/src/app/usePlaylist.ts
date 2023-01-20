import { PlaylistData, VideoNode } from "@youtube-playlist-nx-app/shared/video-types";
import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import * as apiService from "../apiService/apiService";
import { getNodeArray, getVideoIds } from "../utils";

interface AppState {
    selectedNodeId?: string;
    videos: apiService.VideoDataMap;
    playlistArray: VideoNode[];
  }
  const initState: AppState = { videos: {}, playlistArray: [] };

export const usePlaylist = () => {
    
  const [appState, setAppStateInternal] = useState(initState);
  const setAppState = (newState: Partial<AppState>) => setAppStateInternal(prevState => ({...prevState, ...newState}))

  const [inputUrl, setInputUrl] = useState<string>('');

  const updatePlaylist = useCallback(
    async (playlist: PlaylistData) => {
      const playlistIds = getVideoIds(playlist);
      const videos = await apiService.getVideosDataByIds(playlistIds);
      if (playlist.headId && appState.selectedNodeId === undefined) {
        setAppState({
          selectedNodeId: playlist.headId,
          videos,
          playlistArray: getNodeArray(playlist)
        });
      } else {
        setAppState({
          videos,
          playlistArray: getNodeArray(playlist)
        });
      }
    },
    [appState.selectedNodeId]
  );

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) {
      (async () => {
        const { videos, playlist } = await apiService.getPlaylistAndVideos();
        setAppState({
          videos,
          playlistArray: getNodeArray(playlist),
          selectedNodeId: playlist.headId
        });
      })();
      setIsMounted(true);
    }

  }, [isMounted, updatePlaylist]);
    const socket = io("http://localhost:3000");
    useEffect(() => {
      socket.on("dataChanged", updatePlaylist);
      return () => {
        socket.off('dataChanged');
      };
    }, []);

    return { appState, setAppState, inputUrl, setInputUrl }
}