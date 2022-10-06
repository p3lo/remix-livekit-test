import { LIVEKIT_API, LIVEKIT_SECRET, LIVEKIT_SERVER } from '../constants/index.server';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { json } from '@remix-run/node';

export async function getAccessToken(participantName: string, roomName: string) {
  const at = new AccessToken(LIVEKIT_API, LIVEKIT_SECRET, {
    identity: participantName,
  });
  if (participantName.toLocaleLowerCase() === roomName.toLocaleLowerCase()) {
    at.addGrant({
      roomJoin: true,
      room: roomName,
      roomAdmin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    });
  } else {
    at.addGrant({
      roomJoin: true,
      room: roomName,
      roomAdmin: false,
      canPublish: false,
      canPublishData: false,
      canSubscribe: true,
    });
  }
  const token = at.toJwt();

  return token;
}

export async function getRoomsFromServer() {
  const svc = new RoomServiceClient(LIVEKIT_SERVER, LIVEKIT_API, LIVEKIT_SECRET);
  const rooms = await svc.listRooms();
  const room_names = rooms.map((room) => {
    return room.name;
  });
  return room_names;
}
