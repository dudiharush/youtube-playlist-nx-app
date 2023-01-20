import { getVideobyId, VideoItem } from "./youtubeApi";
import { getVideoIds } from "../utils";
import { PlaylistData, PositionType } from "@youtube-playlist-nx-app/shared/video-types";
const localhostUrl = new URL("http://www.localhost:3000/playlist");

const patchRequest = ({
  params = {},
  op,
}: {
  params: Record<string, string>;
  op: "add" | "remove" | "move";
}) => {
  localhostUrl.search = new URLSearchParams(params).toString();
  const url = localhostUrl.toString();
  const body = JSON.stringify({op});

  return fetch(url, {
    method: "PATCH",
    body,
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });
};

export interface VideoDataMap {
  [videoId: string]: VideoItem;
}

export const addVideoId = (videoId: string) =>
  patchRequest({ op: "add", params: { videoId } });

export const removeVideoId = (nodeId: string) =>
  patchRequest({ op: "remove", params: { nodeId } });

export const moveVideo = ({
  sourceNodeId,
  targetNodeId,
  positionType,
}: {
  sourceNodeId: string;
  targetNodeId: string;
  positionType: PositionType;
}) =>
  patchRequest({
    op: "move",
    params: {
      sourceNodeId,
      targetNodeId,
      positionType,
    },
  });

export const getVideosDataByIds = async (videoIds: string[]) => {
  const res: { items: VideoItem[] } = await getVideobyId(videoIds.join());

  const videos: VideoDataMap = res.items.reduce(
    (videos: VideoDataMap, video: VideoItem) => {
      videos[video.id] = video;
      return videos;
    },
    {}
  );
  return videos;
};

export const getLinkedListData = () =>
  fetch(localhostUrl.toString()).then((res) => res.json() as Promise<PlaylistData>);

export const getPlaylistAndVideos = async () => {
  const { nodes, headId } = await getLinkedListData();

  const videoIds = getVideoIds({ nodes, headId });

  let videos = {};
  try {
    videos = await getVideosDataByIds(videoIds);
  } catch (err) {
    console.log("youtube API KEY related error: ", err);
  }

  return { videos, playlist: { nodes, headId } as PlaylistData };
};
