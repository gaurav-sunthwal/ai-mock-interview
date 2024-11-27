"use client";

import Header from "@/app/dashboard/_components/Header";
import { db } from "@/utlis/db";
import { UserAnswer } from "@/utlis/schema";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Divider,
  useColorModeValue,
  Button,
} from "@chakra-ui/react";
import { AiFillStar } from "react-icons/ai";
import { eq } from "drizzle-orm";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";

type UserAnswerData = {
  question: string;
  userAns: string;
  feedback: string;
  rating: number;
};

export default function Page() {

  const { interviewId } = useParams();
  const [answers, setAnswers] = useState<UserAnswerData[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);

  const GetFeedback = React.useCallback(async () => {
    if (!interviewId) {
      console.error("interviewId is undefined");
      return;
    }
    const id = Array.isArray(interviewId) ? interviewId[0] : interviewId;
    const result = await db
      .select()
      .from(UserAnswer)
      .where(eq(UserAnswer.mockIdRef, id))
      .orderBy(UserAnswer.id);

    if (result.length > 0) {
      const mappedAnswers = result.map(item => ({
        question: item.question,
        userAns: item.userAns || "",
        feedback: item.feedback || "",
        rating: item.rating ? Number(item.rating) : 0,
      }));
      setAnswers(mappedAnswers);
      const totalRating = mappedAnswers.reduce((sum, item) => sum + item.rating, 0);
      setAverageRating(totalRating / result.length);
    }
  }, [interviewId]);

  useEffect(() => {
    GetFeedback();
  }, [GetFeedback]);

  return (
    <Box bg={useColorModeValue("gray.100", "gray.900")} minH="100vh" >
      <Header />

      <Box textAlign="center" mt={5}>
        <Heading color={useColorModeValue("blue.600", "yellow.400")} size="2xl" mb={3}>
          Congratulations!
        </Heading>
        <Text fontSize="lg" color={useColorModeValue("gray.600", "gray.300")}>
         {` Here's your personalized interview feedback`}
        </Text>
      </Box>

      <Box mt={6} textAlign="center">
        <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue("blue.700", "yellow.300")} mb={4}>
          Overall Rating: {averageRating.toFixed(1)} / 10
        </Text>
        <HStack justify="center" spacing={1} mb={4}>
          {[...Array(10)].map((_, i) => (
            <Icon
              as={AiFillStar}
              key={i}
              w={6}
              h={6}
              color={i < Math.round(averageRating) ? "yellow.400" : "gray.400"}
            />
          ))}
        </HStack>
        <Divider borderColor={useColorModeValue("gray.300", "gray.600")} />
      </Box>

      <VStack spacing={8} mt={8}>
        {answers.map((item, index) => (
          <Solution key={index} {...item} />
        ))}
        <Link href={"/dashboard"}>
        <Button mb={5} colorScheme="blue">Go to Dashboard</Button>
        </Link>
      </VStack>

      
    </Box>
  );
}

function Solution({ question, userAns, rating, feedback }: UserAnswerData) {
  return (
    <Box
      bg={useColorModeValue("white", "gray.800")}
      borderRadius="lg"
      p={6}
      w="full"
      maxW="800px"
      boxShadow="lg"
      transition="transform 0.3s ease, background-color 0.3s ease"
      _hover={{
        transform: "scale(1.02)",
        bg: useColorModeValue("blue.50", "gray.700"),
      }}
    >
      <Accordion allowToggle>
        <AccordionItem border="none">
          <h2>
            <AccordionButton _expanded={{ bg: "blue.300", color: "white" }} p={4} borderRadius="md">
              <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                {question}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4} borderRadius="md">
            <Heading size="sm" color={useColorModeValue("blue.600", "yellow.400")} mb={2}>
              Your Answer
            </Heading>
            <Text color={useColorModeValue("gray.700", "gray.300")} mb={4}>
              {userAns}
            </Text>

            <Heading size="sm" color={useColorModeValue("blue.600", "yellow.400")} mb={2}>
              Rating
            </Heading>
            <Text color="green.400" fontWeight="bold" mb={4}>
              {rating} / 5
            </Text>

            <Heading size="sm" color={useColorModeValue("blue.600", "yellow.400")} mb={2}>
              Feedback
            </Heading>
            <Text color={useColorModeValue("gray.600", "gray.300")}>{feedback}</Text>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
}