"use client";

import {
  Box,
  Flex,
  HStack,
  IconButton,
  useDisclosure,
  useColorModeValue,
  Stack,
  Heading,
  Button,
  useColorMode,
  Link,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon, HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { UserButton } from "@clerk/nextjs";
import ThemeChangerBtn from "@/app/BodyComponents/ThemeChangerBtn";

const Links = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Projects", path: "/projects" },
  { name: "About", path: "/about" },
  { name: "Upgrade", path: "/upgrade" },
];

const NavLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
  return (
      <Link
        px={2}
        py={1}
        rounded={"md"}
        href={href}
        _hover={{
          textDecoration: "none",
          bg: useColorModeValue("gray.200", "gray.700"),
        }}
      >
        {children}
      </Link>
  );
};

export default function Header() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton
            size={"md"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />

          <Box>
            <Heading fontFamily="Playwrite GB S" style={{ fontWeight: 'bold', fontSize: '24px'}}>Mock</Heading>
          </Box>
          <HStack spacing={8} alignItems={"center"}>
            <HStack
              as={"nav"}
              spacing={4}
              display={{ base: "none", md: "flex" }}
            >
              {Links.map((link) => (
                <NavLink key={link.name} href={link.path}>{link.name}</NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={"center"} gap={4}>
            <Button>
              <UserButton />
            </Button>
            <Box>
             <ThemeChangerBtn/>
            </Box>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as={"nav"} spacing={4}>
              {Links.map((link) => (
                <NavLink key={link.name} href={link.path}>{link.name}</NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
}