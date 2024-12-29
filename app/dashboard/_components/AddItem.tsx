"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import moment from "moment"; // Added import for moment
import {
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Input,
  Stack,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";
import React, { useState } from "react";
import { chatSession } from "@/utlis/GaminiAI";
import { db } from "@/utlis/db";
import { MockInterview } from "@/utlis/schema";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function AddItem() {
  const router = useRouter();
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added state for loading
  const [btnText, setBtnText] = useState("Submit");
  const user = useUser();
  const handleCancel = () => {
    setIsDialogOpen(false); // Close the dialog on cancel
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true); // Start loading on submit

    console.log(jobDescription, jobRole, yearsOfExperience, additionalInfo);

    const InputPrompt = `Based on the following information, generate 7 tailored interview questions and answers in JSON format. Include only "question" and "answer" fields without additional notes.

Details:
- Job Position: ${jobRole}
- Job Description: ${jobDescription}
- Years of Experience: ${yearsOfExperience}
- Additional Information: ${additionalInfo}

Please ensure that the questions are relevant to the job role, experience level, and provided job description, utilizing the additional information for a more accurate response.`;
    const result = await chatSession.sendMessage(InputPrompt);
    const mockJSONResp = result.response
      .text()
      .replace("```json", "")
      .replace("```", "");
    console.log(JSON.parse(mockJSONResp));
    if (mockJSONResp) {
      const resp = await db
        .insert(MockInterview)
        .values({
          mockId: uuidv4(),
          jsonMockResp: mockJSONResp,
          jobPosition: jobRole,
          jobDesc: jobDescription,
          jobExperience: yearsOfExperience,
          createdBy:
            user?.user?.primaryEmailAddress?.emailAddress ||
            "unknown@example.com",
          createdAt: moment().format("DD-MM-yyyy"),
        })
        .returning({ mockId: MockInterview.mockId });

      console.log("Inserted Id ", resp);
      if (resp) {
        setIsDialogOpen(false);
        router.push(`dashboard/interview/${resp[0]?.mockId}`);
      }
    } else {
      console.log("error to get respo");
    }
    setIsLoading(false);
    setBtnText("Start Interview");
  };

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger onClick={() => setIsDialogOpen(true)}>
          <Card
            p={3}
            m={3}
            overflow="hidden"
            variant="outline"
            _hover={{ boxShadow: "md" }}
            border="1px solid #ddd"
          >
            <Stack>
              <CardBody border={"2px dotted #ccc"}>
                <Text textAlign={"center"} fontWeight={"700"}>
                  Add New Interview
                </Text>
              </CardBody>
            </Stack>
          </Card>
        </DialogTrigger>
        <DialogContent className="dark:text-white dark:bg-black">
          <DialogHeader>
            <DialogTitle>Tell us more about your job interview</DialogTitle>
            <DialogDescription>
              Add details about the job position, description, tech stack, and
              years of experience.
            </DialogDescription>
            <Divider />
            <form onSubmit={handleSubmit}>
              <VStack w={"100%"} mt={4} gap={3}>
                <Box w={"100%"}>
                  <InputItem
                    placeHolder="Ex. Full Stack Developer"
                    label="Job Role/Job Position"
                    value={jobRole}
                    handleChange={(e) => setJobRole(e.target.value)}
                  />
                </Box>
                <Box w={"100%"}>
                  <InputItem
                    placeHolder="Ex. React, Angular, NodeJs, MySQL etc."
                    label="Job Description/ Tech Stack (In Short)"
                    value={jobDescription}
                    handleChange={(e) => setJobDescription(e.target.value)}
                  />
                </Box>
                <Box w={"100%"}>
                  <InputItem
                    placeHolder="Years of experience"
                    label="Years of Experience"
                    value={yearsOfExperience}
                    type="number"
                    handleChange={(e) => setYearsOfExperience(e.target.value)}
                  />
                </Box>
                <Box w={"100%"}>
                  <Text mb="8px">Additional Information</Text>
                  <Textarea
                    placeholder="Add any other relevant information"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    size="sm"
                  />
                </Box>
                <Stack direction="row" spacing={4} mt={4}>
                  <DialogClose asChild>
                    <Button
                      variant="outline"
                      colorScheme="red"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </DialogClose>

                  <Button
                    colorScheme="teal"
                    type="submit"
                    isLoading={isLoading} // Added isLoading prop
                  >
                    {btnText}
                  </Button>
                </Stack>
              </VStack>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InputItem({
  placeHolder,
  label,
  value,
  handleChange,
  type = "text",
}: {
  placeHolder: string;
  label: string;
  value: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <>
      <Text mb="8px">{label}</Text>
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeHolder}
        size="sm"
        type={type}
        required
      />
    </>
  );
}
