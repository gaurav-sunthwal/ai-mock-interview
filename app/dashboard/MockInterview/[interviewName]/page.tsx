"use client"

import "regenerator-runtime/runtime"
import { chatSession } from "@/utlis/GaminiAI"
import {
  IconButton,
  Text,
  Box,
  HStack,
  VStack,
  Heading,
  Card,
  Container,
  Flex,
  useColorModeValue,
  Spinner,
  Fade,
  ScaleFade,
} from "@chakra-ui/react"
import React, { useEffect, useState, useRef } from "react"
import { MdCallEnd, MdMic, MdMicOff, MdPhotoCamera } from "react-icons/md"
import { FiCameraOff } from "react-icons/fi"
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition"
import Webcam from "react-webcam"
import { LuWebcam } from "react-icons/lu"
import debounce from "lodash.debounce"
import { useParams, useRouter } from "next/navigation"
import Header from "../../_components/Header"

export default function Page() {
  const topic = useParams().interviewName
  const router = useRouter()
  const [transcriptText, setTranscriptText] = useState<string>("")
  const [currentQuestion, setCurrentQuestion] = useState<string>(
    "Tell me about yourself and why you want to work at Google."
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [webCamEnabled, setWebCamEnabled] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
  const [isListening, setIsListening] = useState<boolean>(true)

  const { transcript, listening, resetTranscript } = useSpeechRecognition()
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

  const bgColor = useColorModeValue("gray.50", "gray.900")
  const cardBgColor = useColorModeValue("white", "gray.800")
  const aiCardBgColor = useColorModeValue("blue.500", "blue.700")
  const textColor = useColorModeValue("gray.800", "white")

  useEffect(() => {
    if (!listening && isListening) {
      SpeechRecognition.startListening({ continuous: true })
    }
  }, [listening, isListening, isSpeaking])

  const handlePause = debounce(() => {
    if (!transcript) return

    setIsSpeaking(false)
    setTranscriptText(transcript)
    handleSendResponse(transcript)
    resetTranscript()
  }, 2000)

  useEffect(() => {
    if (transcript) {
      setIsSpeaking(true)
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
      debounceTimeout.current = setTimeout(handlePause, 2000)
    }
  }, [transcript, handlePause])

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      setIsListening(false)
      SpeechRecognition.stopListening()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "en-US"

      utterance.onstart = () => {
        console.log("Speech started. Microphone is muted.")
      }

      utterance.onend = () => {
        console.log("Speech ended. Microphone is unmuted.")
        setIsListening(true)
        SpeechRecognition.startListening({ continuous: true })
      }

      utterance.onerror = (error) => {
        console.error("Speech synthesis error:", error)
        setIsListening(true)
        SpeechRecognition.startListening({ continuous: true })
      }

      window.speechSynthesis.speak(utterance)
    } else {
      console.error("Speech synthesis is not supported in this browser.")
    }
  }

  const handleSendResponse = async (userResponse: string) => {
    setIsLoading(true)
    const prompt = `
    You are an AI interviewer for a **Google Software Engineer** position. 
    Your role is to make the interview **friendly, conversational, and engaging**, creating a comfortable environment for the candidate.

    ### Context:
    The candidate answered the **previous question** with:  
    "${userResponse}"  

    ### Your Task:
    - Analyze the candidate's response carefully.
    - Understand their strengths, areas of interest, and communication style.
    - Ask the **next most relevant question** based on their response.
    - Ensure the question drives the conversation **deeper into their skills, experiences, or personality**.

    ### Response Format:
    Provide your reply strictly in the following JSON format:
    \`\`\`json
    {
      "question": "Your next friendly and engaging interview question here",
      "objective": "Explain briefly why this question is important in evaluating the candidate"
    }
    \`\`\`

    ### Guidelines:
    1. Keep the **question short, clear, and engaging**.
    2. Maintain a **friendly and conversational tone**.
    3. Avoid repetitive or generic questions.
    4. Tailor each question based on the **candidate's previous answer**.
    5. Occasionally add a touch of encouragement or appreciation (e.g., "That's a great perspective!").

    ### Example:
    If the candidate shares a personal experience, ask a follow-up question related to that experience to **explore more depth**.

    Let's make this interview **enjoyable, insightful, and productive**!
    `

    try {
      const result = await chatSession.sendMessage(prompt)
      const mockJSONResp = result.response
        .text()
        .replace("```json", "")
        .replace("```", "")
      const parsedResponse = JSON.parse(mockJSONResp)

      setCurrentQuestion(parsedResponse.question)
      setIsListening(false)
      await speakText(parsedResponse.question)
      setIsListening(true)
    } catch (error) {
      console.error("Error fetching the next question from Gemini:", error)
      setCurrentQuestion(
        "There was an error fetching the next question. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleMicClick = () => {
    if (isListening) {
      setIsListening(false)
      SpeechRecognition.stopListening()
    } else {
      setIsListening(true)
      SpeechRecognition.startListening({ continuous: true })
    }
  }

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <span>Speech recognition is not supported in your browser.</span>
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Header />
      <Container maxW="container.xl" py={8}>
        <Flex direction={{ base: "column", md: "row" }} gap={8}>
          <Box flex={1}>
            <Card
              h="65vh"
              boxShadow="xl"
              borderRadius="lg"
              overflow="hidden"
              transition="all 0.3s"
              _hover={{ transform: "translateY(-4px)" }}
            >
              {webCamEnabled ? (
                <Webcam
                  className="h-full w-full object-cover"
                  mirrored={true}
                />
              ) : (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  h="full"
                  bg={cardBgColor}
                  onClick={() => setWebCamEnabled(true)}
                  cursor="pointer"
                  transition="background 0.3s"
                  _hover={{ bg: "teal.50" }}
                >
                  <LuWebcam size={64} color="gray.300" />
                  <Text mt={4} fontWeight="bold" color={textColor}>
                    Click to Enable Webcam
                  </Text>
                </Flex>
              )}
            </Card>
          </Box>
          <Box flex={1}>
            <Card
              bg={aiCardBgColor}
              h="65vh"
              boxShadow="xl"
              borderRadius="lg"
              overflow="hidden"
            >
              <Flex direction="column" justify="center" h="full" p={8}>
                <VStack spacing={6} align="center">
                  <Box
                    bg="red.500"
                    w="80px"
                    h="80px"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Heading color="white" fontSize="2xl">
                      AI
                    </Heading>
                  </Box>
                  <ScaleFade in={!isLoading} initialScale={0.9}>
                    <Text
                      fontWeight="500"
                      fontSize="xl"
                      color="white"
                      textAlign="center"
                    >
                      {currentQuestion}
                    </Text>
                  </ScaleFade>
                  {isLoading && <Spinner size="xl" color="white" />}
                </VStack>
                <Fade in={transcriptText !== ""}>
                  <Text
                    mt={8}
                    color="white"
                    fontStyle="italic"
                    textAlign="center"
                  >
                    Your response: {transcriptText}
                  </Text>
                </Fade>
              </Flex>
            </Card>
          </Box>
        </Flex>
        <Flex justify="center" mt={8}>
          <HStack spacing={6}>
            <IconButton
              aria-label={isListening ? "Mute microphone" : "Unmute microphone"}
              icon={isListening ? <MdMic /> : <MdMicOff />}
              onClick={handleMicClick}
              colorScheme={isListening ? "green" : "gray"}
              size="lg"
              fontSize="2xl"
              isRound
              transition="all 0.2s"
              _hover={{ transform: "scale(1.1)" }}
            />
            <IconButton
              aria-label={webCamEnabled ? "Disable webcam" : "Enable webcam"}
              icon={webCamEnabled ? <MdPhotoCamera /> : <FiCameraOff />}
              onClick={() => setWebCamEnabled(!webCamEnabled)}
              colorScheme={webCamEnabled ? "blue" : "gray"}
              size="lg"
              fontSize="2xl"
              isRound
              transition="all 0.2s"
              _hover={{ transform: "scale(1.1)" }}
            />
            <IconButton
              aria-label="End interview"
              icon={<MdCallEnd />}
              onClick={() => {
                router.push(`/dashboard/interview/${topic}/Review`)
              }}
              colorScheme="red"
              size="lg"
              fontSize="2xl"
              isRound
              transition="all 0.2s"
              _hover={{ transform: "scale(1.1)" }}
            />
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}

