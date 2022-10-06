import { createLocalVideoTrack, Room, VideoPresets } from 'livekit-client';
import type {
  SetMediaEnabledParams,
  OnParticipantDisconnectedParams,
  SelectVideoDeviceParams,
  ToggleAudioParams,
  ToggleVideoParams,
  UpdateParticipantSizeParams,
} from '../constants/types';

export async function getAudioDevices() {
  const devices = await Room.getLocalDevices('audioinput');
  return devices;
}

export async function getVideoDevices() {
  const devices = await Room.getLocalDevices('videoinput');
  return devices;
}

export async function toggleVideo({ videoTrack, videoDevice, setVideoEnabled, setVideoTrack }: ToggleVideoParams) {
  if (videoTrack) {
    videoTrack.stop();
    setVideoEnabled(false);
    setVideoTrack(undefined);
  } else {
    const track = await createLocalVideoTrack({
      deviceId: videoDevice?.deviceId,
    });
    setVideoEnabled(true);
    setVideoTrack(track);
  }
}

export function toggleAudio({ audioEnabled, setAudioEnabled }: ToggleAudioParams) {
  if (audioEnabled) {
    setAudioEnabled(false);
  } else {
    setAudioEnabled(true);
  }
}

export function selectVideoDevice({ device, videoTrack, setVideoDevice }: SelectVideoDeviceParams) {
  setVideoDevice(device);
  if (videoTrack) {
    if (videoTrack.mediaStreamTrack.getSettings().deviceId === device.deviceId) {
      return;
    }
    // stop video
    videoTrack.stop();
  }
}

export function updateParticipantSize({ room, setNumParticipants }: UpdateParticipantSizeParams) {
  setNumParticipants(room.participants.size + 1);
}

export function onParticipantDisconnected({ room, setNumParticipants }: OnParticipantDisconnectedParams) {
  updateParticipantSize({ room, setNumParticipants });
}

export async function setMediaEnabled({
  room,
  audioEnabled,
  audioDevice,
  videoEnabled,
  videoDevice,
}: SetMediaEnabledParams) {
  // make it easier to debug
  (window as any).currentRoom = room;

  if (audioEnabled) {
    const audioDeviceId = audioDevice.deviceId;
    if (audioDeviceId && room.options.audioCaptureDefaults) {
      room.options.audioCaptureDefaults.deviceId = audioDeviceId;
    }
    await room.localParticipant.setMicrophoneEnabled(true);
  }

  if (videoEnabled) {
    const videoDeviceId = videoDevice.deviceId;
    if (videoDeviceId && room.options.videoCaptureDefaults) {
      room.options.videoCaptureDefaults.deviceId = videoDeviceId;
    }
    await room.localParticipant.setCameraEnabled(true);
  }
}
