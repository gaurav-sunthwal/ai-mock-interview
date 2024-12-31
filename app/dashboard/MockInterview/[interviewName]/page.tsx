"use client";
import "regenerator-runtime/runtime";
import { chatSession } from "@/utlis/GaminiAI";
import {
  IconButton,
  Text,
  Box,
  HStack,
  VStack,
  Heading,
  CardBody,
  Card,
} from "@chakra-ui/react";
import React, { useEffect, useState, useRef } from "react";
import { MdCallEnd, MdMic, MdPhotoCamera } from "react-icons/md";
import { FiCameraOff } from "react-icons/fi";

import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import Webcam from "react-webcam";
import { LuWebcam } from "react-icons/lu";
import debounce from "lodash.debounce";
import { useParams, useRouter } from "next/navigation";
import Header from "../../_components/Header";

export default function Page() {
  const topic = useParams().interviewName;
  const router = useRouter();
  const [transcriptText, setTranscriptText] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<string>(
    "Tell me about yourself and why you want to work at Google."
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [webCamEnabled, setWebCamEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(true);

  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  // const toast = useToast();
  // const [isLargerThan800] = useMediaQuery("(min-width: 800px)");

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // 📌 Start Speech Recognition on Mount
  useEffect(() => {
    if (!listening && isListening) {
      SpeechRecognition.startListening({ continuous: true });
      console.log(isSpeaking);
    }
  }, [listening, isListening, isSpeaking]);

  // 📌 Handle Submission after Pause
  const handlePause = debounce(() => {
    if (!transcript) return; // Avoid sending empty transcripts

    setIsSpeaking(false);
    setTranscriptText(transcript);
    handleSendResponse(transcript);
    resetTranscript();
  }, 2000); // Waits 2 seconds after last detected speech

  // 📌 Listen for Transcript Changes
  useEffect(() => {
    if (transcript) {
      setIsSpeaking(true);
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(handlePause, 2000);
    }
  }, [transcript, handlePause]);

  // 📌 Speak Text using Browser Speech Synthesis
  // 📌 Speak Text using Browser Speech Synthesis and Manage Mic State
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      // Mute Mic
      setIsListening(false);

      SpeechRecognition.stopListening();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";

      // When the speech starts
      utterance.onstart = () => {
        console.log("Speech started. Microphone is muted.");
      };

      // When the speech ends
      utterance.onend = () => {
        console.log("Speech ended. Microphone is unmuted.");
        setIsListening(true);
        SpeechRecognition.startListening({ continuous: true });
      };

      // Handle speech synthesis errors
      utterance.onerror = (error) => {
        console.error("Speech synthesis error:", error);
        setIsListening(true); // Ensure mic is re-enabled even if there's an error
        SpeechRecognition.startListening({ continuous: true });
      };

      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Speech synthesis is not supported in this browser.");
    }
  };

  // 📌 Fetch the Next Question from AI
  const handleSendResponse = async (userResponse: string) => {
    setIsLoading(true);
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
    `;

    try {
      const result = await chatSession.sendMessage(prompt);
      const mockJSONResp = result.response
        .text()
        .replace("```json", "")
        .replace("```", "");
      const parsedResponse = JSON.parse(mockJSONResp);

      setCurrentQuestion(parsedResponse.question);
      setIsListening(false);
      console.log("setIsListening(false);");
      await speakText(parsedResponse.question); // Speak the new question
      setIsListening(true);
      console.log("setIsListening(true);");
    } catch (error) {
      console.error("Error fetching the next question from Gemini:", error);
      setCurrentQuestion(
        "There was an error fetching the next question. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 📌 Toggle Microphone
  const handleMicClick = () => {
    if (isListening) {
      setIsListening(false);
      SpeechRecognition.stopListening();
    } else {
      setIsListening(true);
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  // 📌 Ensure SpeechRecognition Support
  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <span>Speech recognition is not supported in your browser.</span>;
  }

  return (
    <>
      <Header />
      <HStack w={"100%"} p={4} h={"85vh"}>
        <Box w={"50%"}>
          {webCamEnabled ? (
            <Webcam className="h-[80vh] w-[100%]" />
          ) : (
            <Card
              onClick={() => setWebCamEnabled(true)}
              w={"100%"}
              h="65vh"
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
        </Box>
        <Box w={"50%"}>
          <Card
            bg={"black"}
            w={"100%"}
            h="65vh"
            alignItems="center"
            justifyContent="center"
            boxShadow="2xl"
            borderRadius="lg"
          >
            <CardBody textAlign="center">
              <VStack justifyContent="center" h="100%">
                <Box bg={"red"} w={"20%"} p={10} borderRadius="full">
                  <Heading color={"white"} size={"xl"}>
                    AI
                  </Heading>
                </Box>
                <Text fontWeight={"500"} fontSize={"26px"} color="gray.200">
                  {currentQuestion}
                </Text>
                <Text>Your Res : {transcriptText}</Text>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </HStack>
      <VStack>
        <HStack gap={6}>
          <IconButton
            fontSize={"2xl"}
            aria-label="mic"
            icon={<MdMic />}
            onClick={handleMicClick}
            colorScheme={isListening ? "red" : "blue"}
            isLoading={isLoading}
            isDisabled={!isListening}
          />
          <IconButton
            aria-label="webcam"
            fontSize={"2xl"}
            icon={webCamEnabled ? <MdPhotoCamera /> : <FiCameraOff />}
            onClick={() => setWebCamEnabled(!webCamEnabled)}
            colorScheme={webCamEnabled ? "red" : "blue"}
          />
          <IconButton
            fontSize={"2xl"}
            aria-label="end"
            icon={<MdCallEnd />}
            onClick={() => {
              router.push(`/dashboard/interview/${topic}/Review`);
            }}
            colorScheme={"red"}
          />
        </HStack>
      </VStack>
    </>
  );
}
