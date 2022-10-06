import { VideoPresets } from 'livekit-client';
import React from 'react';
import WhatchingRoom from './WhatchingRoom';

interface Props {
  url: string;
  token: string;
  roomId: string;
  getName: string;
}

function WatcherSettings({ url, token, roomId, getName }: Props) {
  return (
    <WhatchingRoom
      url={url}
      token={token}
      roomId={roomId}
      getName={getName}
      roomOptions={{
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          simulcast: true,
          videoCodec: 'h264',
        },
        videoCaptureDefaults: {
          resolution: VideoPresets.h540.resolution,
        },
      }}
    />
  );
}

export default WatcherSettings;
