import { VideoNodeMap } from "@youtube-playlist-nx-app/shared/video-types";
import * as path from 'path';
import * as fs from 'fs';
const playlistPath = path.join(__dirname, 'assets', 'playlist.json');

export const storeData = (videoMap: VideoNodeMap) => {
  try {
    fs.writeFileSync(playlistPath, JSON.stringify(videoMap));
  } catch (err) {
    console.error(err);
  }
};

export const loadData = () => {
  let data = {};
  try {
    if (fs.existsSync(playlistPath)) {
      data = JSON.parse(fs.readFileSync(playlistPath, 'utf8'));
    }
  } catch (err) {
    console.error(err);
    return false;
  }
  return data;
};
