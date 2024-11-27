"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Webcam from "react-webcam";
import moment from "moment";
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
  IconButton,
  Spinner,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { MdOutlineNavigateBefore, MdOutlineNavigateNext } from "react-icons/md";
import { LuWebcam } from "react-icons/lu";
import { SpeakerLoudIcon } from "@radix-ui/react-icons";
import useSpeechToText from "react-hook-speech-to-text";
import Header from "@/app/dashboard/_components/Header";
import { db } from "@/utlis/db";
import { eq } from "drizzle-orm";
import { MockInterview, UserAnswer } from "@/utlis/schema";
import { chatSession } from "@/utlis/GaminiAI";
import { useUser } from "@clerk/nextjs";

export default function InterviewPage() {
  const [loading, setLoading] = useState(true);
  const [interviewData, setInterviewData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [recordedAnswer, setRecordedAnswer] = useState("");
  const [webCamEnabled, setWebCamEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { interviewId } = useParams();
  const router = useRouter();
  const toast = useToast();
  const user = useUser();
  const cardBg = useColorModeValue("gray.100", "gray.700");

  const {
    startSpeechToText,
    stopSpeechToText,
    error,
    isRecording,
    interimResult,
  } = useSpeechToText({ continuous: true });

  useEffect(() => {
    const fetchInterviewDetails = async () => {
      try {
        if (interviewId) {
          const result = await db
            .select()
            .from(MockInterview)
            .where(eq(MockInterview.mockId, interviewId));

          if (result && result.length > 0) {
            const interview = result[0];
            setInterviewData(interview);
            const questionsArray = JSON.parse(interview.jsonMockResp);
            setQuestions(questionsArray.map((q) => q.question));

            const answerResults = await db
              .select()
              .from(UserAnswer)
              .where(eq(UserAnswer.mockIdRef, interviewId));

            const existingAnswers = questionsArray.map((_, index) => {
              const matchingAnswer = answerResults.find(
                (ans) => ans.question === questionsArray[index].question
              );
              return matchingAnswer?.userAns || "";
            });
            setAnswers(existingAnswers);
          }
        }
      } catch (error) {
        console.error("Error fetching interview details:", error);
        toast({
          title: "Error",
          description: "Failed to load interview details.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewDetails();
  }, [interviewId, toast]);

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleEndInterview = () => {
    onClose();
    router.push(`/dashboard/interview/${interviewId}/Review`);
  };

  const handleListenQuestion = () => {
    const utterance = new SpeechSynthesisUtterance(questions[currentQuestion]);
    speechSynthesis.speak(utterance);
  };

  const handleSaveAnswer = async (answer) => {
    try {
      const question = questions[currentQuestion];
      const existingAnswer = answers[currentQuestion];

      const feedbackPrompt = `
        Analyze the following response to a mock interview question and provide constructive feedback in JSON format.
        The feedback should include:
        - A rating (1 to 5) for the quality of the answer.
        - Specific areas of improvement in 2 to 3 lines.
  
        Input:
        Question: ${question}
        User Answer: ${answer}
      `;

      const result = await chatSession.sendMessage(feedbackPrompt);

      // Await and properly parse the response text
      const responseText = await result.response.text();
      const cleanedText = responseText
        .replace(/```json|```/g, "") // Remove both occurrences of the markdown
        .trim();

      const feedbackData = JSON.parse(cleanedText);

      // Ensure feedbackData has expected properties
      if (!feedbackData.rating || !feedbackData.feedback) {
        throw new Error("Incomplete feedback data received");
      }

      if (existingAnswer) {
        // Update the answer, feedback, and rating
        await db
          .update(UserAnswer)
          .set({
            userAns: answer,
            feedback: feedbackData.feedback,
            rating: feedbackData.rating,
          })
          .where(eq(UserAnswer.question, question));
      } else {
        // Insert new answer with feedback and rating
        await db.insert(UserAnswer).values({
          mockIdRef: interviewData?.mockId || "",
          question,
          userAns: answer,
          feedback: feedbackData.feedback,
          rating: feedbackData.rating,
          userEmail:
            user?.user?.primaryEmailAddress?.emailAddress ||
            "unknown@example.com",
          createdAt: moment().format("DD-MM-yyyy"),
        });
      }

      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestion] = answer;
      setAnswers(updatedAnswers);

      toast({
        title: "Answer Saved",
        description: "Your answer, feedback, and rating have been saved.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error saving answer:", err);
      toast({
        title: "Error",
        description: "Failed to save your answer.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  const startRecording = () => {
    if (!isRecording && !isProcessing) {
      setIsProcessing(true);
      startSpeechToText();
      setTimeout(() => setIsProcessing(false), 1000);
      toast({
        title: "Recording Started",
        description: "Speak your answer.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const stopRecording = async () => {
    if (isRecording) {
      stopSpeechToText();
      const answer = recordedAnswer + (interimResult || "");
      await handleSaveAnswer(answer);
    }
  };

  if (loading) {
    return (
      <Box h="100vh" display="flex" justifyContent="center" alignItems="center">
        <Spinner size="xl" />
      </Box>
    );
  }
  const confirmEndInterview = () => {
    onOpen();
    setRecordedAnswer("")
  };
  return (
    <>
      <Header />
      <Box p={5}>
        {interviewData && (
          <Text fontSize="lg">Job Position: {interviewData.jobPosition}</Text>
        )}
        <HStack justifyContent="space-between" w="100%" spacing={4} mt={8}>
          {/* Webcam and Controls */}
          {/* Left Section */}
          <VStack
            w="50%"
            h="70vh"
            p={4}
            borderRadius="lg"
            boxShadow="lg"
            bg={cardBg}
          >
            {webCamEnabled ? (
              <Webcam
                style={{
                  width: "100%",
                  height: "300px",
                  borderRadius: "50px",
                  boxShadow: "lg",
                }}
              />
            ) : (
              <Card
                onClick={() => setWebCamEnabled(true)}
                w="500px"
                h="300px"
                alignItems="center"
                justifyContent="center"
                boxShadow="2xl"
                borderRadius="lg"
                _hover={{ cursor: "pointer", bg: "teal.200" }}
                transition="background 0.3s ease"
              >
                <CardBody textAlign="center">
                  <VStack justifyContent="center" h="100%">
                    <Heading fontSize="100px" color="gray.200">
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
                isDisabled={isProcessing}
              >
                {isProcessing ? (
                  <Spinner size="sm" />
                ) : isRecording ? (
                  "Stop Recording"
                ) : (
                  "Start Recording"
                )}
              </Button>
              <Text fontSize="sm" color="gray.500">
                {error ? error : isRecording ? "Recording..." : ""}
              </Text>
            </VStack>
          </VStack>

          {/* Questions and Answers */}
          <Box
            w="50%"
            h="70vh"
            p={4}
            borderRadius="lg"
            boxShadow="lg"
            bg={cardBg}
          >
            <Tabs
              index={currentQuestion}
              isFitted
              onChange={(index) => setCurrentQuestion(index)}
              h="55vh"
              overflow="auto"
            >
              <TabList>
                {questions.map((_, index) => (
                  <Tab
                    key={index}
                    _selected={{ bg: "teal.500", color: "white" }}
                  >
                    Q{index + 1}
                  </Tab>
                ))}
              </TabList>
              <TabPanels>
                {questions.map((q, index) => (
                  <TabPanel key={index}>
                    <Text fontSize="lg">{q}</Text>
                    <HStack mt={2}>
                      <IconButton
                        aria-label="Listen Question"
                        icon={<SpeakerLoudIcon />}
                        onClick={handleListenQuestion}
                      />
                    </HStack>
                    <Box mt={4} p={4} borderRadius="md">
                      <Text fontWeight="bold">Your Answer:</Text>
                      <Text mt={2}>
                        {answers[index] || "No answer recorded yet."}
                      </Text>
                    </Box>
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
            <HStack justifyContent={"space-between"}>
              <Button
                leftIcon={<MdOutlineNavigateBefore />}
                onClick={handlePreviousQuestion}
                isDisabled={currentQuestion === 0}
              >
                Previous
              </Button>
              <Button
                rightIcon={<MdOutlineNavigateNext />}
                onClick={handleNextQuestion}
                colorScheme="teal"
                isDisabled={currentQuestion >= questions.length - 1}
              >
                Next
              </Button>
              <Button colorScheme="red" onClick={confirmEndInterview}>
                End Interview
              </Button>
            </HStack>
          </Box>
        </HStack>
      </Box>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>End Interview</ModalHeader>
          <ModalBody>
            {`Are you sure you want to end the interview? You won't be able to
            modify your answers after this step.`}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" onClick={handleEndInterview}>
              Yes, End Interview
            </Button>
            <Button ml={3} onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
