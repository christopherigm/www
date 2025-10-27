import React, { memo } from 'react';
import isYoutube from '@repo/helpers/is-youtube-checker';
import ReactPlayer from 'react-player';

type Props = {
  link: string;
  height?: number;
  playing?: boolean;
};

const Player = ({ link, height = 350, playing = true }: Props) => {
  return (
    <ReactPlayer
      src={link}
      width="100%"
      height={isYoutube(link) ? 220 : height}
      style={{
        backgroundColor: 'rgba(28, 28, 28, 0.4)',
        backdropFilter: 'blur(10px)',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        overflow: 'hidden',
      }}
      playing={playing}
      controls
      loop
    />
  );
};

const PlayerMemo = memo(Player);

const SSRPlayer = (props: Props) => {
  if (!props.link) {
    return;
  }
  return <PlayerMemo {...props} />;
};

export default SSRPlayer;
