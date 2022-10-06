import React from 'react';
import type { Track } from 'livekit-client';
import type { Property } from 'csstype';
import type { CSSProperties } from 'react';
// import ReactPlayer from 'react-player';

export interface VideoRendererProps {
  id: string;
  videoTrack: Track;
  audioTrack: Track;
  isLocal: boolean;
  isMirrored?: boolean;
  objectFit?: Property.ObjectFit;
  className?: string;
  width?: Property.Width;
  height?: Property.Height;
  onSizeChanged?: (width: number, height: number) => void;
}

function VideoRenderer({
  id,
  videoTrack,
  audioTrack,
  isLocal,
  isMirrored,
  objectFit,
  className,
  onSizeChanged,
  width,
  height,
}: VideoRendererProps) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const stream = React.useMemo(() => {
    return new MediaStream();
  }, []);
  React.useEffect(() => {
    const videoComponent = ref.current;
    if (!videoComponent) {
      return;
    }

    stream.addTrack(videoTrack.mediaStreamTrack);
    stream.addTrack(audioTrack.mediaStreamTrack);
    videoTrack.attach(videoComponent);
    videoComponent.srcObject = stream as MediaStream;
    videoComponent.muted = false;
    videoComponent.play();
    return () => {
      stream.removeTrack(videoTrack.mediaStreamTrack);
      stream.removeTrack(audioTrack.mediaStreamTrack);
      videoTrack.detach(videoComponent);
    };
  }, [videoTrack, audioTrack, stream]);

  const handleResize = React.useCallback((ev: UIEvent) => {
    if (ev.target instanceof HTMLVideoElement) {
      if (onSizeChanged) {
        onSizeChanged(ev.target.videoWidth, ev.target.videoHeight);
      }
    }
  }, []);

  React.useEffect(() => {
    const videoComponent = document.getElementById('video') as HTMLVideoElement;
    if (videoComponent) {
      videoComponent.addEventListener('resize', handleResize);
    }
    return () => {
      videoComponent?.removeEventListener('resize', handleResize);
    };
  }, [ref]);

  const style: CSSProperties = {
    width: width,
    height: height,
  };

  // const isFrontFacingOrUnknown = videoTrack.mediaStreamTrack?.getSettings().facingMode !== 'environment';
  // if (isMirrored || (isMirrored === undefined && isLocal && isFrontFacingOrUnknown)) {
  //   style.transform = 'rotateY(180deg)';
  // }

  if (objectFit) {
    style.objectFit = objectFit;
  }

  return (
    <>
      <div className="w-[100%] h-[100%] 2xl:w-[50%] 2xl:h-[50%] xl:w-[60%] xl:h-[60%] lg:w-[70%] lg:h-[70%] md:w-[80%] md:h-[80%]">
        <video ref={ref} style={style} className={className} autoPlay controls />
        {/* <ReactPlayer playing controls url={stream as MediaStream} /> */}
      </div>
    </>
  );
}

export default VideoRenderer;
