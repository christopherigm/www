import MainFormMini from '@/components/main-form-mini';
import LocalVideoList from '@/components/local-video-list';
import { Container } from '@mui/material';
import Divisor from '@repo/ui/divisor';
import Background from '@/components/background';
import AnimatedTitle from '@/components/animated-title';

const Page = () => {
  return (
    <>
      <Background />
      <Container maxWidth="sm">
        <Divisor height={20} />
        <AnimatedTitle text="Video Analyzer Tool" />
        <Divisor />
        <MainFormMini />
        <Divisor />
        <LocalVideoList />
        <Divisor height={20} />
      </Container>
    </>
  );
};

export default Page;
