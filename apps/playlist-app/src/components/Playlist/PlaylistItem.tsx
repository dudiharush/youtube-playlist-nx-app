import { IconButton, ListItem, ListItemIcon } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { VideoDetails } from "../VideoItem/VideoDetails";

interface PlayListItemProps {
  video: any;
  itemId: string;
  onVideoSelected: (itemId: string) => void;
  removeVideo: (itemId: string) => void;
}

export const PlaylistItem = ({
  itemId,
  video,
  onVideoSelected,
  removeVideo
}: PlayListItemProps) => (
  <ListItem>
    <ListItemIcon>
      <IconButton
        edge="end"
        aria-label="delete"
        onClick={() => removeVideo(itemId)}
      >
        <DeleteIcon />
      </IconButton>
    </ListItemIcon>
    <VideoDetails
      key={itemId}
      video={video}
      handleVideoSelect={() => onVideoSelected(itemId)}
    />
  </ListItem>
);
