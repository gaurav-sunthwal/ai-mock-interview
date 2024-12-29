"use client";
import "regenerator-runtime/runtime";
import { chatSession } from "@/utlis/GaminiAI";
import { IconButton, Text, Box } from "@chakra-ui/react";
import React, { useState } from "react";
import { MdMic } from "react-icons/md";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

export default function Page() {
  const [transcriptText, setTranscriptText] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<string>(
    "Tell me about yourself and why you want to work at Google."
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  const handleMicClick = () => {
    if (!listening) {
      resetTranscript();
      console.log("Starting listening...");
      SpeechRecognition.startListening({ continuous: true });
    } else {
      SpeechRecognition.stopListening();
      console.log("Stopped listening.");
      setTranscriptText(transcript);
      handleSendResponse(transcript);
    }
  };
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      console.log("Starting speech synthesis...");
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US"; // Set the language of the speech (optional)
      window.speechSynthesis.speak(utterance); // Speak the text
    } else {
      console.error("Speech synthesis is not supported in this browser.");
    }
  };
  const handleSendResponse = async (userResponse: string) => {
    setIsLoading(true);
    const prompt = `
      You are an AI interviewer for a Google Software Engineer position. 
      The candidate answered the previous question with: "${userResponse}". 
      Analyze this response and ask the next most relevant interview question in JSON format as:
      {
        "question": "Your next interview question here",
        "objective": "Purpose of asking this question"
      }
    `;

    try {
      const result = await chatSession.sendMessage(prompt);
      const mockJSONResp = result.response
        .text()
        .replace("```json", "")
        .replace("```", "");
      const parsedResponse = JSON.parse(mockJSONResp);

      setCurrentQuestion(parsedResponse.question);

      // Convert the question text to speech after receiving the response
      console.log("Speaking the next question: ", parsedResponse.question);
      speakText(parsedResponse.question);
    } catch (error) {
      console.error("Error fetching the next question from Gemini:", error);
      setCurrentQuestion(
        "There was an error fetching the next question. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <span>Speech recognition is not supported in your browser.</span>;
  }

  return (
    <Box padding="4" maxWidth="600px" margin="auto">
      <Text fontSize="lg" fontWeight="bold" marginBottom="4">
        🎤 AI Mock Interview
      </Text>

      <Box marginBottom="4" padding="3" bg="gray.100" borderRadius="md">
        <Text color={"black"} fontWeight="medium">
          🤖 <strong>Interviewer:</strong> {currentQuestion}
        </Text>
      </Box>

      <IconButton
        aria-label="mic"
        icon={<MdMic />}
        onClick={handleMicClick}
        colorScheme={listening ? "red" : "blue"}
        isLoading={isLoading}
      />

      <Box marginTop="4">
        <Text>
          <strong>🎯 Your Response:</strong> {transcriptText || transcript}
        </Text>
      </Box>
    </Box>
  );
}
