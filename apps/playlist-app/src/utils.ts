import { PlaylistData, VideoNode } from "@youtube-playlist-nx-app/shared/video-types";

export const getVideoIds = ({ headId, nodes }: PlaylistData): string[] => {
  const videoIds = [];
  if (!headId) return [];
  let currNode = nodes[headId];
  while (currNode) {
    videoIds.push(currNode.data.videoId);
    currNode = nodes[currNode.nextNodeId!];
  }
  return videoIds;
};

export const getNodeArray = ({ nodes, headId }: PlaylistData): VideoNode[] => {
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