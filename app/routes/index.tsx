import { Button, Divider, Paper, Text, TextInput } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { useRef } from 'react';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';
import type { LoaderArgs, ActionArgs } from '@remix-run/node';
import { getRoomsFromServer } from '~/utils/stream_utils.server';

export async function loader(params: LoaderArgs) {
  const rooms = await getRoomsFromServer();
  return json({ rooms });
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  if (formData.get('action') === 'start-stream') {
    const streamName = formData.get('stream-name');
    const nickName = formData.get('nickname');
    invariant(streamName, 'Stream name missing!');
    return redirect(`${streamName.toString().toLowerCase()}?nick=${nickName}`);
  }
  return null;
}

export default function Index() {
  const data = useLoaderData();
  const [nickname, setNickname] = useLocalStorage({ key: 'nick-name', defaultValue: '' });
  const nickRef = useRef<HTMLInputElement>(null);
  const setNick = () => {
    if (nickRef.current?.value) setNickname(nickRef.current?.value);
  };
  return (
    <div className="flex flex-col p-10 space-y-5">
      <div className="flex items-end justify-center space-x-5">
        <TextInput
          ref={nickRef}
          type="text"
          defaultValue={nickname}
          placeholder="Your nick"
          label="Nickname"
          required
        />
        <Button onClick={setNick} variant="outline">
          Set nick
        </Button>
      </div>
      {nickname && (
        <>
          <Divider />
          <Form method="post" className="flex justify-center">
            <input hidden readOnly name="stream-name" value={nickname} />
            <input hidden readOnly name="nickname" value={nickname} />
            <Button type="submit" name="action" value="start-stream" className="w-[300px]" variant="outline">
              Start stream
            </Button>
          </Form>
          <Paper shadow="xs" p="md" withBorder className="bg-gray-800">
            <div className="flex flex-col items-center justify-center space-y-3">
              <Text weight={500} size="sm" className="">
                Active Streams
              </Text>
              {data.rooms.map((room: string) => (
                <Button className="w-[300px]" key="room" component={Link} to={`${room}?nick=${nickname}`}>
                  {room}
                </Button>
              ))}
            </div>
          </Paper>
        </>
      )}
    </div>
  );
}
