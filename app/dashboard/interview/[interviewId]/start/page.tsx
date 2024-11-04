"use client";

import Header from "@/app/dashboard/_components/Header";
import { db } from "@/utlis/db";
import { MockInterview } from "@/utlis/schema";
import {
  Box,
  Card,
  CardBody,
  Heading,
  HStack,
  Text,
  VStack,
  Button,
  useColorModeValue,
  Icon,
  Divider,
} from "@chakra-ui/react";
import { FaLightbulb } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import ReactWebcam from "react-webcam";
import { eq } from "drizzle-orm";

type InterviewData = {
  id: number;
  jsonMockResp: string;
  jobPosition: string;
  jobDesc: string;
  jobExperience: string;
  createdBy: string;
  createdAt: string | null;
  mockId: string;
};

export default function Page({ params }: { params: { interviewId: string } }) {
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [interviewQuestion, setInterviewQuestion] = useState<{ question: string; answer: string }[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);

  useEffect(() => {
    const GetInterviewDetails = async () => {
      try {
        const result = await db
          .select()
          .from(MockInterview)
          .where(eq(MockInterview.mockId, params.interviewId));

        if (result && result.length > 0) {
          setInterviewData(result[0]);
          const JsonRes = JSON.parse(result[0].jsonMockResp);
          setInterviewQuestion(JsonRes);
        } else {
          console.error("No interview data found for this ID");
        }
      } catch (error) {
        console.error("Error fetching interview details:", error);
      }
    };

    if (params.interviewId) {
      GetInterviewDetails();
    } else {
      console.log("Interview ID is undefined");
    }
  }, [params.interviewId]);

  const textColor = useColorModeValue("teal.700", "teal.300");
  const cardBgColor = useColorModeValue("white", "gray.800");
  const btnBgColor = useColorModeValue("teal.600", "teal.400");
  const btnHoverColor = useColorModeValue("teal.700", "teal.500");

  const handleNextQuestion = () => {
    if (currentQuestion < interviewQuestion.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <div>
      <Header />

      <Box p={6} mt={4}>
        <HStack spacing={4} alignItems="flex-start">
          {/* Question List Section */}
          <Card w="25%" p={4} boxShadow="md" bg={cardBgColor} borderRadius="lg">
            <Heading fontSize="xl" mb={4} color={textColor}>Questions</Heading>
            <VStack spacing={2}>
              {interviewQuestion.map((item, index) => (
                <Box
                  key={index}
                  bg={index === currentQuestion ? "blue.600" : "gray.100"}
                  color={index === currentQuestion ? "white" : textColor}
                  p={2}
                  borderRadius="md"
                  cursor="pointer"
                  boxShadow="sm"
                  onClick={() => setCurrentQuestion(index)}
                  _hover={{ bg: "blue.500", color: "white" }}
                  textAlign="center"
                  w="100%"
                >
                  <Text fontWeight="bold">Q{index + 1}</Text>
                </Box>
              ))}
            </VStack>
          </Card>

          {/* Current Question and Action Section */}
          <VStack spacing={6} w="75%">
            {/* Current Question Display */}
            <Card w="100%" p={6} boxShadow="md" bg={cardBgColor} borderRadius="lg">
              <Text fontSize="xl" fontWeight="bold" color={textColor} textAlign="center">
                {interviewQuestion[currentQuestion]?.question || "No question available"}
              </Text>
            </Card>

            {/* Webcam and Button Section */}
            <HStack w="100%" spacing={4} alignItems="center">
              {/* Webcam */}
              <Box flex="1" display="flex" justifyContent="center">
                <ReactWebcam
                  audio
                  mirrored
                  screenshotFormat="image/jpeg"
                  width={280}
                  height={200}
                  videoConstraints={{ facingMode: "user" }}
                  style={{
                    borderRadius: "10px",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.15)",
                  }}
                />
              </Box>

              {/* Control Buttons */}
              <VStack flex="1" spacing={4}>
                <Button
                  bg={btnBgColor}
                  color="white"
                  size="md"
                  _hover={{ bg: btnHoverColor }}
                  transition="background 0.3s ease"
                >
                  Record Answer
                </Button>

                <HStack spacing={6}>
                  <Button
                    bg={btnBgColor}
                    color="white"
                    onClick={handlePreviousQuestion}
                    isDisabled={currentQuestion === 0}
                    _hover={{ bg: btnHoverColor }}
                    transition="background 0.3s ease"
                  >
                    Previous
                  </Button>
                  <Button
                    bg={btnBgColor}
                    color="white"
                    onClick={handleNextQuestion}
                    isDisabled={currentQuestion === interviewQuestion.length - 1}
                    _hover={{ bg: btnHoverColor }}
                    transition="background 0.3s ease"
                  >
                    Next
                  </Button>
                </HStack>
              </VStack>
            </HStack>
          </VStack>
        </HStack>
      </Box>

      {/* Tips Section */}
      <Box p={4} mt={8} w="100%" textAlign="center">
        <Heading color={textColor} fontSize="3xl" mb={6}>
          Tips for Answering Interview Questions
        </Heading>
        <Card p={5} bg={cardBgColor} boxShadow="lg" borderRadius="lg" maxWidth="70%" mx="auto">
          <CardBody display="flex" alignItems="center">
            <Icon as={FaLightbulb} color={btnBgColor} boxSize={6} mr={4} />
            <Text color={textColor} fontSize="md">
              Be confident and honest in your answers. Prepare examples from your past experiences that demonstrate
              your skills and accomplishments.
            </Text>
          </CardBody>
        </Card>
      </Box>
    </div>
  );
}