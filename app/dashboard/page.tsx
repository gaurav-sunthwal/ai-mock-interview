"use client";
import {
  Box,
  Card,
  Text,
  Spinner,
  useColorModeValue,
  Flex,
  Wrap,
  WrapItem,
  Heading,
  HStack,
  IconButton,
  Tooltip,
  Divider,
  CardHeader,
  CardFooter,
  CardBody,
  Badge,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { MdDelete, MdFeedback, MdPlayArrow } from "react-icons/md"; // Icons
import Header from "./_components/Header";
import AddItem from "./_components/AddItem";
import { MockInterview, UserAnswer } from "@/utlis/schema";
import { db } from "@/utlis/db";
import { useUser } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import Link from "next/link";

type InterviewData = {
  id: number;
  jsonMockResp: string;
  jobPosition: string;
  jobDesc: string;
  jobExperience: string;
  createdBy: string;
  createdAt: string | null;
  mockId: string;
  userAnswers: {
    rating: string | null;
  }[];
};

const DashboardPage = () => {
  const user = useUser();
  const [interviewData, setInterviewData] = useState<InterviewData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const userId = user?.user?.primaryEmailAddress?.emailAddress;

  useEffect(() => {
    const fetchInterviewDetails = async () => {
      setLoading(true);
      try {
        const result = userId
          ? await db
              .select()
              .from(MockInterview)
              .where(eq(MockInterview.createdBy, userId))
          : [];

        if (result && result.length > 0) {
          // Fetch User Answers for each interview
          const interviewDataWithAnswers = await Promise.all(
            result.map(async (interview) => {
              const answersResult = await db
                .select()
                .from(UserAnswer)
                .where(eq(UserAnswer.mockIdRef, interview.mockId));

              const userAnswers = answersResult.map((answer) => ({
                rating: answer.rating || "N/A",
              }));

              return {
                ...interview,
                userAnswers,
              };
            })
          );

          setInterviewData(interviewDataWithAnswers);
        } else {
          console.error("No interview data found for this ID");
        }
      } catch (error) {
        console.error("Error fetching interview details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewDetails();
  }, [userId]);

  const btnColor = useColorModeValue("blue.600", "blue.400");
  const cardBg = useColorModeValue("white", "gray.700")
  const headerBg = useColorModeValue("blue.50", "blue.900")
  // Format creation date

  // Toggles the read more/less state for a specific card

  // Delete Interview and User Answer function
  const handleDelete = async (mockId: string) => {
    try {
      // Delete User Answer first
      await db.delete(UserAnswer).where(eq(UserAnswer.mockIdRef, mockId));

      // Delete Mock Interview
      await db.delete(MockInterview).where(eq(MockInterview.mockId, mockId));

      // Remove the deleted interview from the local state
      setInterviewData(
        interviewData.filter((interview) => interview.mockId !== mockId)
      );
    } catch (error) {
      console.error("Error deleting interview:", error);
    }
  };

  return (
    <div>
      <Header />
      <Box mb={5}>
        <Heading
          mb={6}
          size="2xl"
          fontWeight="extrabold"
          color={btnColor}
          textAlign="center"
        >
          Ready-Made Interviews
        </Heading>
        <Wrap spacing="30px" justify="center" w="100%">
          <WrapItem w={{ base: "100%", sm: "45%", md: "30%" }}>
            <Card w="100%" boxShadow="lg" bg={cardBg}>
              <CardHeader bg={headerBg} py={6}>
                <HStack justifyContent="space-between">
                  <Heading fontSize="xl">Software Interview</Heading>
                  <Badge colorScheme="green">Available Now</Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                <Text
                  fontSize="md"
                  color={useColorModeValue("gray.600", "gray.200")}
                >
                  Explore the world of software engineering interviews and
                  sharpen your skills with real-world mock interviews.
                </Text>
              </CardBody>
              <CardFooter justifyContent="center">
                <Link href="/dashboard/MockInterview/Software-Interview">
                  <IconButton
                    icon={<MdPlayArrow />}
                    aria-label="Start Interview"
                    colorScheme="blue"
                    size="lg"
                    rounded="full"
                  />
                </Link>
              </CardFooter>
            </Card>
          </WrapItem>
        </Wrap>
      </Box>

      <Divider />
      <Box
        w="100%"
        p={{ base: 4, md: 8 }}
        bg={useColorModeValue("gray.50", "gray.800")}
      >
        <Heading
          mb={4}
          size="xl"
          fontWeight="bold"
          color={btnColor}
          textAlign="center"
        >
          Dashboard
        </Heading>
        <Flex direction="column" align="center" gap={8} w="100%">
          {loading ? (
            <Spinner size="xl" color={btnColor} />
          ) : (
            <Wrap spacing="30px" justify="center" w="100%">
              {interviewData.map((data) => (
                <WrapItem
                  w={{ base: "100%", sm: "45%", md: "30%" }}
                  key={data.mockId}
                >
                  <Card w={"100%"}>
                    <CardHeader>
                      <HStack justifyContent={"space-between"}>
                        <Heading fontSize={"20px"} textTransform={"capitalize"}>
                          {data.jobPosition}
                        </Heading>
                        <Text>{data.createdAt}</Text>
                      </HStack>
                    </CardHeader>
                    <Divider />
                    <Box p={3}>
                      <Text>Interview Id : {data.mockId}</Text>
                      <HStack
                        justifyContent={"space-between"}
                        flexWrap={"wrap"}
                      >
                        <Text>
                          Rating :{" "}
                          <b>{data.userAnswers?.[0]?.rating || "N/A"}</b>
                        </Text>
                        <Text>
                          Year of Experience : <b>{data.jobExperience}</b>
                        </Text>
                        <Text>
                          Interviewer Id : <b>{user.user?.fullName}</b>
                        </Text>
                        <Text>
                          No of questions :{" "}
                          <b>
                            {data.jsonMockResp
                              ? JSON.parse(data.jsonMockResp).length
                              : 0}
                          </b>
                        </Text>
                      </HStack>
                    </Box>
                    <CardFooter>
                      <HStack spacing={4}>
                        <Tooltip label="Give Feedback">
                          <Link
                            href={`/dashboard/interview/${data.mockId}/Review`}
                          >
                            <IconButton
                              icon={<MdFeedback />}
                              aria-label="Give Feedback"
                              onClick={() => console.log("Feedback")}
                            />
                          </Link>
                        </Tooltip>
                        <Tooltip label="Play Interview">
                          <Link href={`/dashboard/interview/${data.mockId}`}>
                            <IconButton
                              icon={<MdPlayArrow />}
                              aria-label="Play Interview"
                              onClick={() => console.log("Play")}
                            />
                          </Link>
                        </Tooltip>
                        <Tooltip label="Delete Interview">
                          <IconButton
                            icon={<MdDelete />}
                            aria-label="Delete Interview"
                            onClick={() => handleDelete(data.mockId)}
                          />
                        </Tooltip>
                      </HStack>
                    </CardFooter>
                  </Card>
                </WrapItem>
              ))}
            </Wrap>
          )}
          <AddItem />
        </Flex>
      </Box>
    </div>
  );
};

export default DashboardPage;
