"use client";
import { Box, HStack } from "@chakra-ui/react";
import React from "react";
import Header from "./_components/Header";
import AddItem from "./_components/AddItem";
function page() {
  // const handleClick = () => alert("hi")
  
  return (
    <div>
      <Header />
      <Box p={2}>
        <HStack gap={4} justifyContent={"center"}>
          <Box>
            <HStack>
              {
                
              }
            </HStack>
          </Box>
          <AddItem />
        </HStack>
      </Box>
    </div>
  );
}

export default page;
