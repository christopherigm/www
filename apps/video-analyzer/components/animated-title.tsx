'use client';

import Box from '@mui/material/Box';
import SplitText from '@repo/ui/split-text';

type Props = {
  text: string;
};
const AnimatedTitle = ({ text }: Props) => {
  return (
    <Box display="flex" justifyContent="center" width="100%">
      <SplitText
        text={text}
        tag="h1"
        className="animated-title"
        delay={100}
        duration={0.6}
        ease="power3.out"
        splitType="words"
        from={{ opacity: 0, y: 40 }}
        to={{ opacity: 1, y: 0 }}
        threshold={0.1}
        rootMargin="-100px"
        textAlign="center"
      />
    </Box>
  );
};

export default AnimatedTitle;
