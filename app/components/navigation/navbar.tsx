import { Box, Button, Flex, Image, Link, Text } from "@chakra-ui/react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import React, { useState } from "react";
import TLLogo from "../../assets/tllogo.png";
import { employeeRepository } from "../../domains/employee/repository";
import { employeeService } from "../../domains/employee/service";

interface UserProfile {
  name: string;
  email: string;
  buesinessFunction: string | null;
}

export const Navbar = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const newEmployeeService = employeeService(employeeRepository());
  const responseMessage = async (response: any) => {
    try {
      // Decode the JWT credential
      const decodedToken: any = jwtDecode(response.credential);

      // Extract user details from the decoded token
      const { name, email, picture } = decodedToken;
      console.log(email);
      try {
        const { data: mondayEmployeeInfo, error } =
          await newEmployeeService.fetchMondayEmployee(email);
        if (error) {
          console.error(
            "Failed to get employee information from Monday",
            error
          );
        }

        setUser({
          name: mondayEmployeeInfo?.name || "",
          email: mondayEmployeeInfo?.email || "",
          buesinessFunction: mondayEmployeeInfo?.businessFunction || "",
        });
      } catch (e) {
        console.error(e);
      }

      // Set the user details in the state
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };
  const errorMessage = () => {
    console.log("Login failed");
  };

  const logOut = () => {
    console.log(user);
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
