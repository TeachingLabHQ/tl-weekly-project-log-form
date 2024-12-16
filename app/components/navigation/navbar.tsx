import { Box, Flex, Image, Text, Link } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import TLLogo from "../../assets/tllogo.png";
import { useHydrated } from "remix-utils/use-hydrated";
import { GoogleLogin, googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Button } from "@chakra-ui/react";

interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

export const Navbar = () => {
  const [user, setUser] = useState<UserProfile | null>(null);

  const responseMessage = (response: any) => {
    try {
      // Decode the JWT credential
      const decodedToken: any = jwtDecode(response.credential);

      // Extract user details from the decoded token
      const { name, email, picture } = decodedToken;

      // Set the user details in the state
      setUser({ name, email, picture });
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };
  const errorMessage = () => {
    console.log("Login failed");
  };

  const logOut = () => {
    setUser(null); // Clear user state
  };

  return (
    <Box
      w="100%"
      paddingX={16}
      paddingY={5}
      display={"flex"}
      bg="#F7FAFC"
      justifyContent={"space-between"}
      alignItems={"center"}
    >
      <Flex gap={"5"}>
        <Link href="/" _hover={{ textDecoration: "none" }}>
          <Flex gap={2} align={"center"}>
            <Image src={TLLogo} h="40px" />
            <Text fontSize={"2xl"}>Teaching Lab Form Hub</Text>
          </Flex>
        </Link>
        <Flex>
          <Link href="/weekly-project-log">
            <Text>Weekly Project Log</Text>
          </Link>
        </Flex>
      </Flex>

      <Box>
        {user ? (
          <Box>
            <Button variant={"outline"} onClick={logOut}>
              Log Out
            </Button>
          </Box>
        ) : (
          <GoogleLogin onSuccess={responseMessage} onError={errorMessage} />
        )}
      </Box>
    </Box>
  );
};
