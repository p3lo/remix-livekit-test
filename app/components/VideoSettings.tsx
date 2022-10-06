import React from 'react';
import type { Participant } from 'livekit-client';
import { useParticipant } from '@livekit/react-components';
import { LocalTrack, RemoteTrack } from 'livekit-client';
import VideoRenderer from './VideoRenderer';
import { Text } from '@mantine/core';

interface Props {
  participant: Participant;
}

function VideoSettings({ participant }: Props) {
  const [videoSize, setVideoSize] = React.useState<string>('');
  const { isLocal, cameraPublication, microphonePublication } = useParticipant(participant);
  const [currentBitrate, setCurrentBitrate] = React.useState<number>(0);

  const handleResize = React.useCallback((width: number, height: number) => {
    setVideoSize(`${width}x${height}`);
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      let total = 0;
      participant.tracks.forEach((pub) => {
        if (pub.track instanceof LocalTrack || pub.track instanceof RemoteTrack) {
          total += pub.track.currentBitrate;
        }
      });
      setCurrentBitrate(total);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {cameraPublication?.track && microphonePublication?.track && (
        <>
          <div className="absolute z-100">
            <span>{videoSize}</span>
            {currentBitrate !== undefined && currentBitrate > 0 && (
              <span>&nbsp;{Math.round(currentBitrate / 1024)} kbps</span>
            )}
          </div>

          <VideoRenderer
            id={'video'}
            videoTrack={cameraPublication.track}
            audioTrack={microphonePublication.track}
            isLocal={isLocal}
            objectFit={'contain'}
            width={'100%'}
            height={'100%'}
            onSizeChanged={handleResize}
          />
        </>
      )}
    </>
  );
}

export default VideoSettings;
