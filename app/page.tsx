"use client";

import {
  Box,
  Heading,
  HStack,
  Text,
  Button,
  useMediaQuery,
} from "@chakra-ui/react";
import Image from "next/image";
// import * as st from "@/utlis/schema"
// img
import desktopBg from "@/app/img/home-shapes.svg";
import tableBg from "@/app/img/home-shapes-tablet.svg";
import mobileBg from "@/app/img/home-shapes-mobile.svg";
import Link from "next/link";
import ThemeChangerBtn from "./BodyComponents/ThemeChangerBtn";
export default function Home() {
  const [isLargerThan800] = useMediaQuery("(min-width: 800px)");
  const [isLargerThan500] = useMediaQuery("(min-width: 500px)");
  return (
    <div className="home">
      <Box position="relative" w="100vw" h="100vh" overflow="hidden">
        {/* Background Image */}
        <Box
          position="absolute"
          top="0"
          left={isLargerThan800 ? "-60" : "-100"}
          w="150%"
          h="auto"
          zIndex="-1"
        >
          <Image
            src={
              isLargerThan800 ? desktopBg : isLargerThan500 ? tableBg : mobileBg
            }
            alt="background"
            objectFit="cover"
          />
        </Box>

        {/* Content */}
        <HStack justifyContent="space-between" p={6} w="100%">
          <Box />
          <Box
            position={isLargerThan500 ? "absolute" : "static"}
            left={"3"}
            w={"100%"}
          >
            <Heading textAlign={"center"} fontSize="40px">
            MockMate
            </Heading>
          </Box>
          <Box display="flex" gap="4">
            <Button variant="secondary" as={Link} href={"/dashboard"}>Login</Button>
            <Button  as={Link} href={"/dashboard"}>Sign up</Button>
            <ThemeChangerBtn/>
          </Box>
        </HStack>

        {/* Main Text */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Heading fontSize="5xl" textAlign="center" mb={4}>
            Prepare for Your Dream Job
          </Heading>
          <Text fontSize="lg" textAlign="center" maxW="600px" mb={8}>
            Ace your interviews with our AI-powered mock interview platform.
            Practice with realistic scenarios and get personalized feedback to
            boost your confidence and land your dream job.
          </Text>
          <Button
            size="lg"
            colorScheme="blue"
            borderRadius="full"
            as={Link}
            href={"/dashboard"}
          >
            Sign up free
          </Button>
        </Box>
      </Box>
    </div>
  );
}
