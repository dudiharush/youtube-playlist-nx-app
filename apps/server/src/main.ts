import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import { Server } from 'socket.io';
import * as cors from 'cors';

import {
  VideoNodeMap,
  PlaylistData,
  PositionType,
} from '@youtube-playlist-nx-app/shared/video-types';

import { fromNodes } from 'linked-list-normalized';
import { loadData, storeData } from './database';

const app = express();
app.use(cors());
app.use(express.static('assets'));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'PUT', 'POST'],
  },
});

const playlist: VideoNodeMap = loadData() || {};

const linkedList = fromNodes(playlist);

app.patch<{
  positionType: PositionType;
  sourceNodeId: string;
  targetNodeId: string;
}>('/playlist', function (req, res) {
  if (req.body.op === 'add') {
    linkedList.addNode({ videoId: req.query.videoId as string });
  } else if (req.body.op === 'remove') {
    linkedList.removeNode(req.query.nodeId as string);
  } else if (req.body.op === 'move') {
    const { sourceNodeId, targetNodeId, positionType } = req.query;
    if (positionType === 'before') {
      linkedList.moveNodeBefore({
        sourceNodeId: sourceNodeId as string,
        beforeNodeId: targetNodeId as string,
      });
    } else {
      linkedList.moveNodeAfter({
        sourceNodeId: sourceNodeId as string,
        afterNodeId: targetNodeId as string,
      });
    }
  }

  storeData(linkedList.getNodes());
  io.emit('dataChanged', {
    nodes: linkedList.getNodes(),
    headId: linkedList.getHeadId(),
  } as PlaylistData);
  res.send();
});

app.get('/playlist', function (req, res) {
  res.send({
    nodes: playlist,
    headId: linkedList.getHeadId(),
  } as PlaylistData);
});

const port = 3000;
const server = httpServer.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/playlist`);
});

server.on('error', console.error);
