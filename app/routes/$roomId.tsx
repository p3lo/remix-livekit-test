import React from 'react';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getAudioDevices, getVideoDevices } from '../utils/stream_utils';
import { NativeSelect, Button } from '@mantine/core';
import type { LocalVideoTrack } from 'livekit-client';
import { createLocalVideoTrack, Room } from 'livekit-client';

import { LIVEKIT_SERVER } from '../constants/index.server';
import { useLoaderData } from '@remix-run/react';
import StreamerSettings from '~/components/StreamerSettings';
import WatcherSettings from '~/components/WatcherSettings';
import { getAccessToken } from '~/utils/stream_utils.server';

export async function loader({ params, request }: LoaderArgs) {
  const roomId = params.roomId;
  const url = new URL(request.url);
  const getName = url.searchParams.get('nick');
  if (!roomId || !getName) {
    return null;
  }
  const accessToken = await getAccessToken(getName.toString(), roomId.toString());

  return json({ accessToken, url: LIVEKIT_SERVER, roomId, getName });
}

function RoomPage() {
  const [audioDevices, setAudioDevices] = React.useState<MediaDeviceInfo[]>();
  const [videoDevices, setVideoDevices] = React.useState<MediaDeviceInfo[]>();
  const [audioDevice, setAudioDevice] = React.useState<MediaDeviceInfo>();
  const [videoDevice, setVideoDevice] = React.useState<MediaDeviceInfo>();
  const [audioDevicesList, setAudioDevicesList] = React.useState<string[]>([]);
  const [videoDevicesList, setVideoDevicesList] = React.useState<string[]>([]);
  const [videoEnabled, setVideoEnabled] = React.useState(false);
  const [audioEnabled, setAudioEnabled] = React.useState(true);
  const [videoTrack, setVideoTrack] = React.useState<LocalVideoTrack>();
  const getData = useLoaderData();
  const token: string = getData?.accessToken;
  const url: string = getData?.url;
  const roomId: string = getData?.roomId;
  const getName: string = getData?.getName;

  const canStream = token && url && audioDevice && videoDevice && videoTrack;

  React.useEffect(() => {
    (async () => {
      const devices = await getAudioDevices().then((value) => {
        return value;
      });
      setAudioDevices(devices);
      setAudioDevice(devices[0]);
      const devicesList = devices.map((device) => {
        return device.label;
      });
      setAudioDevicesList(devicesList);
    })();
    (async () => {
      const devices = await getVideoDevices().then((value) => {
        return value;
      });
      setVideoDevices(devices);
      setVideoDevice(devices[0]);
      const devicesList = devices.map((device) => {
        return device.label;
      });
      setVideoDevicesList(devicesList);
    })();
  }, []);

  function changeVideoSource(source: string) {
    const index = videoDevices?.findIndex((device) => device.label === source);
    setVideoDevice(videoDevices![index!]);
  }

  function changeAudioSource(source: string) {
    const index = audioDevices?.findIndex((device) => device.label === source);
    setAudioDevice(audioDevices![index!]);
  }

  async function startStream() {
    const track = await createLocalVideoTrack({
      deviceId: videoDevice?.deviceId,
    });
    setVideoEnabled(true);
    setVideoTrack(track);
  }
  async function stopStream(videoTrack: LocalVideoTrack) {
    videoTrack.stop();
    setVideoTrack(undefined);
    setVideoEnabled(false);
  }

  return (
    <>
      <div className="flex flex-col p-10 space-y-5">
        {roomId.toLowerCase() === getName.toLowerCase() && (
          <>
            <NativeSelect
              className="w-[400px]"
              data={videoDevicesList}
              placeholder="Pick one"
              label="Select streaming video device"
              onChange={(event) => changeVideoSource(event.currentTarget.value)}
              withAsterisk
            />
            <NativeSelect
              className="w-[400px]"
              data={audioDevicesList}
              placeholder="Pick one"
              label="Select streaming audio device"
              onChange={(event) => changeAudioSource(event.currentTarget.value)}
              withAsterisk
            />
            {!videoTrack && (
              <Button className="w-[400px]" variant="subtle" onClick={startStream}>
                Start Stream
              </Button>
            )}
            {videoTrack && (
              <Button className="w-[400px]" variant="subtle" onClick={() => stopStream(videoTrack)}>
                Stop Stream
              </Button>
            )}
          </>
        )}
        {canStream && roomId.toLowerCase() === getName.toLowerCase() && (
          <StreamerSettings
            url={url}
            token={token}
            roomId={roomId.toLowerCase()}
            getName={getName.toLowerCase()}
            audioEnabled={audioEnabled}
            audioDevice={audioDevice}
            videoEnabled={videoEnabled}
            videoDevice={videoDevice}
          />
        )}
        {roomId.toLowerCase() !== getName.toLowerCase() && (
          <WatcherSettings url={url} token={token} roomId={roomId.toLowerCase()} getName={getName.toLowerCase()} />
        )}
      </div>
    </>
  );
}

export default RoomPage;
