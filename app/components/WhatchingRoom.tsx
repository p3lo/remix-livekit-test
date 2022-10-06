import React from 'react';
import type { LocalParticipant, RoomOptions } from 'livekit-client';
import { ConnectionState } from 'livekit-client';
import { useRoom } from '@livekit/react-components';
import VideoSettings from './VideoSettings';
import { Text, Paper, Divider } from '@mantine/core';

interface Props {
  url: string;
  token: string;
  roomId: string;
  getName: string;
  roomOptions?: RoomOptions;
}

function WhatchingRoom({ roomOptions, url, token, roomId, getName }: Props) {
  const [myInfo, setMyInfo] = React.useState<LocalParticipant | undefined>(undefined);
  const { room, participants, connect } = useRoom(roomOptions);
  React.useEffect(() => {
    (async () => {
      const connectedRoom = await connect(url, token);
      if (!connectedRoom) {
        return;
      }

      const info = room?.localParticipant;
      setMyInfo(info);
    })();

    return () => {
      if (room?.state !== ConnectionState.Disconnected) {
        room?.disconnect();
      }
    };
  }, []);

  if (room?.state === ConnectionState.Connecting) {
    return <>...loading</>;
  }
  return (
    <>
      {myInfo ? (
        <div>
          <Text size="xs" color="red" weight={500}>
            My name: {myInfo.identity}
          </Text>
          <Text size="xs" color="red" weight={500}>
            My sid: {myInfo.sid}
          </Text>
        </div>
      ) : null}
      <div>
        {participants.map((participant) => {
          if (roomId === participant.identity.toLowerCase())
            return <VideoSettings key={participant.sid} participant={participant} />;
        })}
      </div>
      <div className="py-2">
        <Paper shadow="xs" p="xs" withBorder className="bg-gray-800 w-[300px]">
          <Text weight={700}>User List</Text>
          <Divider />
          {participants.map((participant) => (
            <Text size="sm" key={participant.sid}>
              {participant.identity}
            </Text>
          ))}
        </Paper>
      </div>
    </>
  );
}

export default WhatchingRoom;
