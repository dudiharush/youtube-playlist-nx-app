import { useCallback, useEffect, useState } from "react";
import { arrayMove } from "react-movable";
import { io } from "socket.io-client";
import { PlaylistData, VideoNode } from "@youtube-playlist-nx-app/shared/video-types";
import * as apiService from "../apiService/apiService";
import { VideoDataMap } from "../apiService/apiService";
import { Playlist } from "../components/Playlist/PlayList";
import { SearchBar } from "../components/SearchBar/SearchBar";
import { VideoPlayer } from "../components/VideoPlayer";
import { getVideoIds } from "../utils";
import getVideoId from 'get-video-id';

import {
  AppContainerStyled,
  AppContentContainerStyled,
  SideBarContainerStyled,
  VideoPlayerContainerStyled
} from "./App.styled";
import { useEffectOnce } from "react-use";

interface AppState {
  selectedNodeId?: string;
  videos: VideoDataMap;
  playlist: PlaylistData;
  playlistArray: VideoNode[];
}
const initState: AppState = { videos: {}, playlist: { nodes: {} }, playlistArray: [] };
const socket = io("http://localhost:3000");

const App = () => {

  const [appState, setAppStateInternal] = useState(initState);
  const setAppState = (newState: Partial<AppState>) => setAppStateInternal(prevState => ({...prevState, ...newState}))
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffectOnce(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  });

  const [inputUrl, setInputUrl] = useState<string>('');

  const updatePlaylist = useCallback(
    async (playlist: PlaylistData) => {
      const playlistIds = getVideoIds(playlist);
      const videos = await apiService.getVideosDataByIds(playlistIds);
      if (playlist.headId && appState.selectedNodeId === undefined) {
        setAppState({
          selectedNodeId: playlist.headId,
          playlist,
          videos,
          playlistArray: getNodeArray(playlist)
        });
      } else {
        setAppState({
          playlist,
          videos,
          playlistArray: getNodeArray(playlist)
        });
      }
    },
    [appState.selectedNodeId]
  );

  useEffect(() => {
    socket.on("dataChanged", updatePlaylist);
    return () => {
      socket.off('dataChanged');
    };
  }, []);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (!isMounted) {
      (async () => {
        const { videos, playlist } = await apiService.getPlaylistAndVideos();
        setAppState({
          playlist,
          videos,
          playlistArray: getNodeArray(playlist),
          selectedNodeId: playlist.headId
        });
      })();
      setIsMounted(true);
    }

  }, [isMounted, updatePlaylist]);

  const setSelectedNodeId = (selectedNodeId?: string) => {
    setAppState({selectedNodeId});
  };

  const getSelectedVideo = () => {
    const { videos } = appState;
    const selectedNode = getSelectedNode();
    return selectedNode && videos[selectedNode.data.videoId];
  };

  const getSelectedNode = () => {
    const {
      selectedNodeId,
      playlist: { nodes }
    } = appState;
    return selectedNodeId && nodes[selectedNodeId];
  };

  const getNodeArray = ({ nodes, headId }: PlaylistData): VideoNode[] => {
    const nodeArray = [];
    if (headId) {
      let currNode = nodes[headId];
      while (currNode) {
        nodeArray.push(currNode);
        currNode = nodes[currNode.nextNodeId!];
      }
    }
    return nodeArray;
  };

  const addVideo = async () => {
    let videoId;
    try {
      const { id } = getVideoId(inputUrl);
      videoId = id;
      if(id === undefined){
        alert(
          "video Url format is incorrect! use this format: http://www.youtube.com/watch?v=someId"
        );
      }
    } catch (e) {
      alert(
        "video Url format is incorrect! use this format: http://www.youtube.com/watch?v=someId"
      );
    }
    if (videoId) {
      await apiService.addVideoId(videoId);
    }
  };

  const onVideoEnd = async () => {
    const selectedNode = getSelectedNode();
    const nextNodeId = selectedNode && selectedNode.nextNodeId;
    await apiService.removeVideoId(appState.selectedNodeId!);
    setSelectedNodeId(nextNodeId!);
  };

  const removeVideo = async (nodeId: string) => {
    const selectedNode = getSelectedNode();
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNodeId(undefined);
    }
    await apiService.removeVideoId(nodeId);
  };

  const updatePlaylistArray = async ({
    oldIndex,
    newIndex
  }: {
    oldIndex: number;
    newIndex: number;
  }) => {
    const { playlistArray } = appState;
    setAppState({
      playlistArray: arrayMove(appState.playlistArray, oldIndex, newIndex)
    });
    await apiService.moveVideo({
      sourceNodeId: playlistArray[oldIndex].id,
      targetNodeId: playlistArray[newIndex].id,
      positionType: oldIndex > newIndex ? "before" : "after"
    });
  };

  const selectedVideo = getSelectedVideo();

  return (
    <AppContainerStyled>
        <p>Connected: { '' + isConnected }</p>
        <AppContentContainerStyled>
          <SideBarContainerStyled>
            <SearchBar onAddClick={addVideo} onInputChange={setInputUrl} />
            <Playlist
              videos={appState.videos}
              playlistArray={appState.playlistArray}
              onVideoSelected={setSelectedNodeId}
              removeVideo={removeVideo}
              updatePlaylistArray={updatePlaylistArray}
            />
          </SideBarContainerStyled>
          <VideoPlayerContainerStyled>
            {selectedVideo && <VideoPlayer video={selectedVideo} onEnd={onVideoEnd} />}
          </VideoPlayerContainerStyled>
        </AppContentContainerStyled>
      </AppContainerStyled>
  );
};

export default App;
