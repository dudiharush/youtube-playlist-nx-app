import { YOUTUBE_API_KEY } from "../keys";

//@ts-ignore
if (YOUTUBE_API_KEY === "ENTER KEY HERE") {
  alert("please provide a YOUTUBE_API_KEY first!");
}

export type VideoItem = {snippet: {title: string}, id: string};

export const getVideobyId = (videoId: string) => {
  return fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&maxResults=1&id=${videoId}&key=${YOUTUBE_API_KEY}`
  ).then(res=>res.json())
};
