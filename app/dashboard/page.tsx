"use client";
import {
  Box,
  Card,
  CardBody,
  Text,
  Button,
  Spinner,
  useColorModeValue,
  Flex,
  Wrap,
  WrapItem,
  Heading,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Header from "./_components/Header";
import AddItem from "./_components/AddItem";
import { MockInterview } from "@/utlis/schema";
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
};

const DashboardPage = () => {
  const user = useUser();
  const [interviewData, setInterviewData] = useState<InterviewData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

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
          setInterviewData(result);
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

  const cardBgColor = useColorModeValue("white", "gray.700");
  const btnColor = useColorModeValue("blue.600", "blue.400");

  // Toggles the read more/less state for a specific card
  const toggleReadMore = (id: number) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div>
      <Header />
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
                  key={data.id}
                  w={{ base: "100%", sm: "45%", md: "30%" }}
                >
                  <Card
                    bg={cardBgColor}
                    boxShadow="lg"
                    borderRadius="md"
                    w="100%"
                    p={6}
                    transition="transform 0.2s"
                    _hover={{ transform: "scale(1.02)" }}
                  >
                    <CardBody>
                      <Text
                        fontSize="xl"
                        fontWeight="bold"
                        mb={3}
                        color={btnColor}
                      >
                        {data.jobPosition}
                      </Text>
                      <Box
                        mb={2}
                        h="70px"
                        overflow="hidden"
                        position="relative"
                      >
                        <Text
                          fontSize="md"
                          color="gray.600"
                          noOfLines={expandedCards.has(data.id) ? undefined : 3}
                        >
                          {data.jobDesc}
                        </Text>
                        {!expandedCards.has(data.id) &&
                          data.jobDesc.length > 100 && (
                            <Box
                              position="absolute"
                              bottom="0"
                              w="full"
                              h="20px"
                              bgGradient="linear(to-t, gray.50, transparent)"
                            />
                          )}
                      </Box>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="link"
                        onClick={() => toggleReadMore(data.id)}
                        mb={4}
                      >
                        {expandedCards.has(data.id) ? "Read Less" : "Read More"}
                      </Button>
                      <Text fontSize="20px" color="gray.500" mb={4}>
                        Experience: {data.jobExperience}
                      </Text>
                      <Link href={`dashboard/interview/${data.mockId}`}>
                        <Button colorScheme="blue" variant="solid" w="full">
                          Start Interview
                        </Button>
                      </Link>
                    </CardBody>
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
