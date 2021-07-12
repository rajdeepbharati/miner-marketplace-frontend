import {
  Box,
  Container,
  Image,
  Stack,
  Heading,
  Button,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/landingPage/Footer";
import { useRouter } from "next/router";
import Head from "next/head"

const privacy = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>
          Miner Marketplace - Privacy Policy
        </title>
      </Head>
      <Navbar />
      <Container
        maxW="container.lg"
        alignItems="center"
        textAlign="center"
        justifyContent="center"
      >
        <Stack textAlign="center" alignItems="center" py="32">
          <Heading>Privacy Policy</Heading>
          <Text>for Miner marketplace</Text>
        </Stack>
      </Container>

      <Footer />
    </>
  );
};

export default privacy;
