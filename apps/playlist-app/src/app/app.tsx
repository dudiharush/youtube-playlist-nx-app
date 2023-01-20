import { arrayMove } from 'react-movable';
import * as apiService from '../apiService/apiService';
import { Playlist } from '../components/Playlist/PlayList';
import { SearchBar } from '../components/SearchBar/SearchBar';
import { VideoPlayer } from '../components/VideoPlayer';
import getVideoId from 'get-video-id';

import {
  AppContainerStyled,
  AppContentContainerStyled,
  SideBarContainerStyled,
  VideoPlayerContainerStyled,
} from './App.styled';
import { usePlaylist } from './usePlaylist';

const App = () => {
  const { setAppState, appState, inputUrl, setInputUrl } = usePlaylist();

  const setSelectedNodeId = (selectedNodeId?: string) => {
    setAppState({ selectedNodeId });
  };

  const getSelectedVideo = () => {
    const { videos } = appState;
    const selectedNode = getSelectedNode();
    return selectedNode && videos[selectedNode.data.videoId];
  };

  const getSelectedNode = () => {
    const {
      selectedNodeId,
      playlist: { nodes },
    } = appState;
    return selectedNodeId && nodes[selectedNodeId];
  };

  const ALERT_MESSAGE =
    'video Url format is incorrect! use this format: http://www.youtube.com/watch?v=someId';
  const addVideo = async () => {
    let videoId;
    try {
      const { id } = getVideoId(inputUrl);
      videoId = id;
      if (id === undefined) {
        alert(ALERT_MESSAGE);
      }
    } catch (e) {
      alert(ALERT_MESSAGE);
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
    newIndex,
  }: {
    oldIndex: number;
    newIndex: number;
  }) => {
    const { playlistArray } = appState;
    setAppState({
      playlistArray: arrayMove(appState.playlistArray, oldIndex, newIndex),
    });
    await apiService.moveVideo({
      sourceNodeId: playlistArray[oldIndex].id,
      targetNodeId: playlistArray[newIndex].id,
      positionType: oldIndex > newIndex ? 'before' : 'after',
    });
  };

  const selectedVideo = getSelectedVideo();

  return (
    <AppContainerStyled>
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
          {selectedVideo && (
            <VideoPlayer video={selectedVideo} onEnd={onVideoEnd} />
          )}
        </VideoPlayerContainerStyled>
      </AppContentContainerStyled>
    </AppContainerStyled>
  );
};

export default App;
