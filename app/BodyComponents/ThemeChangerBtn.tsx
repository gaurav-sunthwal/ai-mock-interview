"use clinet";

import { Button, useColorMode } from "@chakra-ui/react";
import React from "react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useTheme } from "next-themes";

export default function ThemeChangerBtn() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { setTheme } = useTheme();
  const handalTheme = () => {
    toggleColorMode();
    setTheme(colorMode === "light" ? "dark" : "light"); // Updated line
  };
  return (
    <div>
      <Button onClick={handalTheme}>
        {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
      </Button>
    </div>
  );
}
