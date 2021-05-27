import {
  Button,
  Container,
  Flex,
  Link,
  Heading,
  HStack,
  VStack,
  Stack,
  Spacer,
  Text,
} from "@chakra-ui/react";
import Navbar from "./components/Navbar";
import Hero from "./components/landingPage/Hero";
import Features from "./components/landingPage/Features";
import FilecoinStats from "./components/landingPage/FilecoinStats";
import JoinNetwork from "./components/landingPage/JoinNetwork";
import Footer from "./components/landingPage/Footer";

const IndexPage = () => {
  return (
    <>
      <Navbar />
      <Container maxW="container.xl">
        <Stack spacing="28">
          <Hero />
          <Features />
          <FilecoinStats />
          <JoinNetwork />
        </Stack>
      </Container>
      <Footer />
    </>
  );
};

export default IndexPage;
