import React from "react";
import { Navbar } from "../components/navigation/navbar";
import { Box } from "@chakra-ui/react";
import BackgroundImg from "../assets/background.png";
export const headers = () => {
  return {
    "Cross-Origin-Opener-Policy": "unsafe-none",
    "Cross-Origin-Resource-Policy": "cross-origin",
  };
};

export default function Index() {
  return (
    <Box
      bgImage={`url(${BackgroundImg})`}
      bgRepeat="no-repeat"
      bgSize="cover"
      h="100vh"
      w="100%"
    >
      {/* Content goes here */}
    </Box>
  );
}
