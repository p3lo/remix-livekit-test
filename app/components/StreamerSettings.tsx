import type { Room } from 'livekit-client';
import { VideoPresets } from 'livekit-client';
import React from 'react';
import { setMediaEnabled } from '~/utils/stream_utils';
import StreamingRoom from './StreamingRoom';

interface Props {
  url: string;
  token: string;
  roomId: string;
  getName: string;
  audioEnabled: boolean;
  audioDevice: MediaDeviceInfo;
  videoEnabled: boolean;
  videoDevice: MediaDeviceInfo;
}

function StreamerSettings({
  url,
  token,
  roomId,
  getName,
  audioEnabled,
  audioDevice,
  videoEnabled,
  videoDevice,
}: Props) {
  return (
    <StreamingRoom
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
      onConnected={async (room: Room) => {
        await setMediaEnabled({
          room,
          audioEnabled,
          audioDevice,
          videoEnabled,
          videoDevice,
        });
      }}
    />
  );
}

export default StreamerSettings;
