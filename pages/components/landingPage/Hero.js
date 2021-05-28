import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Image,
  VStack,
  Stack,
  Heading,
  Text,
  Spacer,
  WrapItem,
} from "@chakra-ui/react";
import React from "react";

const Hero = (props) => {
  return (
    <Stack>
      <HStack>
        <Stack spacing="4">
          <Heading size="3xl" lineHeight="1.2" color="gray.900">
            {props.heroHeading}
          </Heading>
          <Text maxW="30vw" color="gray.700">
            {props.heroText}
          </Text>
          <Box>
            <Button
              size="lg"
              variant="link"
              colorScheme="blue"
              textDecoration="underline"
            >
              {props.ctaText}
            </Button>
          </Box>
        </Stack>
        <Image src="/images/heroGlobe.svg" />
      </HStack>
    </Stack>
  );
};

export default Hero;
