"use client";

import Header from "@/app/dashboard/_components/Header";
import { MockInterview } from "@/utlis/schema";
import { db } from "@/utlis/db";
import { eq } from "drizzle-orm";
import {
  Box,
  Button,
  VStack,
  HStack,
  Heading,
  Text,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  useColorModeValue,
  Card,
  CardBody,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import { MdOutlineNavigateBefore, MdOutlineNavigateNext } from "react-icons/md";
import useSpeechToText from "react-hook-speech-to-text";
import { useParams } from "next/navigation";
import { LuWebcam } from "react-icons/lu";

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

export default function InterviewPage() {
  const [interviewData, setInterviewData] = useState<InterviewData | null>(
    null
  );
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [recordedAnswer, setRecordedAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [webCamEable, setWebCamEable] = useState(false);
  const { interviewId } = useParams();
  const cardBg = useColorModeValue("gray.100", "gray.700");

  // Initialize Speech-to-Text hook
  const {
    startSpeechToText,
    stopSpeechToText,
    error,
    isRecording,
    interimResult,
  } = useSpeechToText({
    continuous: true,
  });

  // Fetch interview data from DB
  useEffect(() => {
    const fetchInterviewDetails = async () => {
      if (interviewId && typeof interviewId === "string") {
        try {
          const result = await db
            .select()
            .from(MockInterview)
            .where(eq(MockInterview.mockId, interviewId));
          if (result && result.length > 0) {
            setInterviewData(result[0]);
            const questionsArray = JSON.parse(result[0].jsonMockResp);
            setQuestions(questionsArray.map((q: { question: string }) => q.question));
            setAnswers(new Array(questionsArray.length).fill("")); // Initialize answers array
          }
        } catch (error) {
          console.error("Error fetching interview details:", error);
        }
      }
    };

    fetchInterviewDetails();
  }, [interviewId]);

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setShowAnswer(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      setShowAnswer(false);
    }
  };

  const startRecording = () => {
    startSpeechToText();
  };

  const stopRecording = () => {
    stopSpeechToText();
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[currentQuestion] = recordedAnswer + (interimResult || "");
      setRecordedAnswer(newAnswers[currentQuestion]);
      return newAnswers;
    });
    setShowAnswer(true);
  };

  const handleReAnswer = () => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[currentQuestion] = ""; // Clear current answer
      return newAnswers;
    });
    setRecordedAnswer(""); // Clear the recorded answer state
    setShowAnswer(false);
    startRecording(); // Start re-recording
  };

  // Function to listen to the current question
  const handleListenQuestion = () => {
    const utterance = new SpeechSynthesisUtterance(questions[currentQuestion]);
    speechSynthesis.speak(utterance);
  };

  return (
    <Box p={5}>
      <Header />
      {interviewData && (
        <Text fontSize="lg">Job Position: {interviewData.jobPosition}</Text>
      )}
      <HStack justifyContent="space-between" w="100%" spacing={4} mt={8}>
        <VStack w="50%" p={4} borderRadius="lg" boxShadow="lg" bg={cardBg}>
          {webCamEable ? (
            <Webcam
              style={{
                width: "100%",
                height: "300px",
                borderRadius: "50px",
                boxShadow: "lg",
              }}
              onUserMedia={() => setWebCamEable(true)}
              onUserMediaError={() => setWebCamEable(false)}
            />
          ) : (
            <Card
              onClick={() => setWebCamEable(true)}
              w={"500px"}
              h={"300px"}
              alignItems={"center"}
              justifyContent="center"
              boxShadow={"2xl"}
              borderRadius="lg"
              _hover={{ cursor: "pointer", bg: "teal.200" }}
              transition="background 0.3s ease"
            >
              <CardBody textAlign={"center"} alignItems={"center"}>
                <VStack justifyContent={"center"} h={"100%"}>
                  <Heading fontSize={"100px"} color={"gray.200"}>
                    <LuWebcam />
                  </Heading>
                  <Text fontWeight="bold">Click to Enable Webcam</Text>
                </VStack>
              </CardBody>
            </Card>
          )}
          <VStack spacing={4} mt={4}>
            <Button
              colorScheme="teal"
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? "Stop Answering" : "Answer Question"}
            </Button>
            <Text fontSize="sm" color="gray.500">
              {error ? error : interimResult || "Listening..."}
            </Text>
          </VStack>
        </VStack>

        <Box w="50%" p={4} borderRadius="lg" boxShadow="lg" bg={cardBg}>
          <Tabs
            index={currentQuestion}
            isFitted
            onChange={(index) => setCurrentQuestion(index)}
          >
            <TabList>
              {questions.map((_, index) => (
                <Tab key={index} _selected={{ bg: "teal.500", color: "white" }}>
                  Question {index + 1}
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              {questions.map((question, index) => (
                <TabPanel key={index}>
                  <Card p={5} boxShadow="md">
                    <Heading size="md">Question {index + 1}</Heading>
                    <Text mt={2} fontSize="lg">
                      {question}
                    </Text>
                    <Button
                      colorScheme="purple"
                      mt={2}
                      onClick={handleListenQuestion}
                    >
                      Listen to Question
                    </Button>
                    {showAnswer && (
                      <Text mt={4} fontSize="sm" color="gray.500">
                        Answer: {answers[index] || "No answer recorded yet."}
                      </Text>
                    )}
                    <Button
                      colorScheme="blue"
                      mt={4}
                      onClick={handleReAnswer}
                      isDisabled={!showAnswer}
                    >
                      Re-answer
                    </Button>
                  </Card>
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
          <HStack spacing={4} mt={8} justifyContent="space-between">
            <Button
              colorScheme="teal"
              onClick={handlePreviousQuestion}
              isDisabled={currentQuestion === 0}
            >
              <MdOutlineNavigateBefore />
              Previous
            </Button>
            <Button colorScheme="red" onClick={() => alert("Ending Interview")}>
              End Interview
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleNextQuestion}
              isDisabled={currentQuestion >= questions.length - 1}
            >
              Next
              <MdOutlineNavigateNext />
            </Button>
          </HStack>
        </Box>
      </HStack>

      {/* Tips Card */}
      <Box w="full" mt={8}>
        <Card boxShadow="lg" p={5}>
          <Heading size="md" mb={3}>
            Interview Preparation Tips
          </Heading>
          <Text fontSize="md" color="gray.300">
            - Structure responses with clarity. <br />
            - Highlight your achievements with examples. <br />
            - Demonstrate problem-solving skills and adaptability. <br />-
            Practice calm and confidence during responses.
          </Text>
        </Card>
      </Box>
    </Box>
  );
}
