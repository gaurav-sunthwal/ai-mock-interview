"use client";

import React, { useEffect, useState } from "react";
import Header from "../../_components/Header";
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
} from "@chakra-ui/react";
import { MockInterview } from "@/utlis/schema";
import { eq } from "drizzle-orm";
import { db } from "@/utlis/db";
import Webcam from "react-webcam";
import { LuWebcam } from "react-icons/lu";
import { useRouter } from "next/navigation";

// Define the type for interview data
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

// Remove the constraint on PageProps
export default function Page({ params }: { params: { interviewId: string } }) {
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [webCamEable, setWebCamEable] = useState(false);
  const router = useRouter();
  const textColor = useColorModeValue("teal.600", "teal.300");
  const btnBgColor = useColorModeValue("teal.600", "teal.400");

  useEffect(() => {
    const GetInterviewDetails = async () => {
      try {
        const result = await db
          .select()
          .from(MockInterview)
          .where(eq(MockInterview.mockId, params.interviewId));

        if (result && result.length > 0) {
          setInterviewData(result[0]);
          console.log(result[0]);
        } else {
          console.error("No interview data found for this ID");
        }
      } catch (error) {
        console.error("Error fetching interview details:", error);
      }
    };

    if (params.interviewId) {
      GetInterviewDetails();
      console.log(`Interview ID: ${params.interviewId}`);
    } else {
      console.log("Interview ID is undefined");
    }
  }, [params.interviewId]);

  return (
    <div>
      <Header />
      <VStack p={4} mt={6} w={"100%"} justifyContent={"center"} spacing={6}>
        <Heading color={textColor} fontSize="3xl" mb={4}>
          {`Let's Get Started with Your Mock Interview!`}
        </Heading>

        <HStack justifyContent={"center"} w={"100%"} spacing={10}>
          <Box p={8} maxW={"50%"} borderRadius="lg">
            {webCamEable ? (
              <Webcam
                style={{
                  width: "500px",
                  height: "350px",
                  borderRadius: "10px",
                  border: `4px solid ${textColor}`,
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
                    <Heading fontSize={"100px"} color={textColor}>
                      <LuWebcam />
                    </Heading>
                    <Text fontWeight="bold">Click to Enable Webcam</Text>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </Box>

          {/* Display interview details */}
          <Box maxW={"50%"} borderRadius="lg" p={4}>
            {interviewData ? (
              <>
                <Card p={5} boxShadow={"2xl"} mb={5} borderRadius="md">
                  <VStack align={"start"} spacing={4}>
                    <Text fontSize={"20px"} fontWeight={700} color={textColor}>
                      <strong>Job Role/Job Position:</strong>{" "}
                      {interviewData.jobPosition}
                    </Text>
                    <Text fontSize={"18px"}>
                      <strong>Job Description/Tech Stack:</strong>{" "}
                      {interviewData.jobDesc}
                    </Text>
                    <Text fontSize={"18px"}>
                      <strong>Years of Experience:</strong>{" "}
                      {interviewData.jobExperience}
                    </Text>
                    <Text fontSize={"18px"}>
                      <strong>Created By:</strong> {interviewData.createdBy}
                    </Text>
                    <Text fontSize={"18px"}>
                      <strong>Created At:</strong>{" "}
                      {interviewData.createdAt || "N/A"}
                    </Text>
                  </VStack>
                </Card>
                <Card p={5} boxShadow="lg" bg="teal.50" borderRadius="md">
                  <Text fontSize="lg" color="gray.600">
                    <strong>Instructions:</strong>{" "}
                    {`Enable your webcam and
                    microphone to begin your AI-generated mock interview. You
                    will be asked 5 questions, which you can answer, and at the
                    end, you'll receive feedback based on your responses.`}
                    <br />
                    <br />
                    <em>Note:</em> Your video is not recorded, and webcam access
                    can be disabled at any time.
                  </Text>
                </Card>
              </>
            ) : (
              <Text fontSize="lg" color="gray.500">
                Loading interview details...
              </Text>
            )}
          </Box>
        </HStack>

        {/* Start Interview Button */}
        <Button
          mt={8}
          colorScheme="teal"
          bg={btnBgColor}
          size="lg"
          boxShadow="xl"
          borderRadius="full"
          _hover={{ bg: "teal.500" }}
          onClick={() => router.push(`${interviewData?.mockId}/start`)}
        >
          Start Interview
        </Button>
      </VStack>
    </div>
  );
}