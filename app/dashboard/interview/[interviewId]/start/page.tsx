import Header from '@/app/dashboard/_components/Header'
import { Box, HStack } from '@chakra-ui/react'
import React from 'react'
import Question from './_components/Question'

export default function page({ params }: { params: { interviewId: string } }) {
  return (
    <div>
        <Header/>
        <Box p={5}>

      <HStack>
        <Question params={params}/>
      </HStack>
        </Box>
    </div>
  )
}
