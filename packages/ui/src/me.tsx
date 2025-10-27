'use client';

import { useState } from 'react';
import GlareHover from '@repo/ui/glare-hover';

type Props = {
  src: string;
  label: string;
  src2?: string;
  width?: number | string;
  height?: number | string;
};

const Me = ({ src, label, src2, width = 300, height = 400 }: Props) => {
  const [image, setImage] = useState<string>(src);

  // const source =

  return (
    <GlareHover
      background="rgba(0,0,0,0)"
      glareColor="#ffffffff"
      glareOpacity={0.3}
      glareAngle={-30}
      glareSize={300}
      transitionDuration={800}
      playOnce={false}
      borderColor="rgba(0,0,0,0)"
      width={width}
      height={height}
      style={{
        borderRadius: 5,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0)',
        boxShadow: '0px 0px 5px rgba(13, 13, 13, 0.24)',
      }}
      onClick={() => setImage(() => (image === src && src2 ? src2 : src))}
    >
      <img
        src={image}
        alt={label}
        width="100%"
        height="100%"
        style={{
          objectFit: 'cover',
        }}
      />
    </GlareHover>
  );
};

export default Me;
