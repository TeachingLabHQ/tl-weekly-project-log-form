import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import React, { useState } from "react";
import TLLogo from "../../assets/tllogo.png";
import { employeeRepository } from "../../domains/employee/repository";
import { employeeService } from "../../domains/employee/service";
import { Button } from "@mantine/core";
import { Link } from "@remix-run/react";

function Demo() {
  return <Button variant="filled">Button</Button>;
}

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
      const { email } = decodedToken;
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
    <div className="w-full px-16 py-5 flex bg-[#F7FAFC] justify-between items-center">
      <div className="flex flex-row gap-5 items-center">
        <Link to="/">
          <div className="flex gap-2 items-center">
            <img src={TLLogo} className="h-[40px]" />
            <p className="text-2xl">Teaching Lab Form Hub</p>
          </div>
        </Link>
        <div>
          <Link to="/weekly-project-log">
            <p>Weekly Project Log</p>
          </Link>
        </div>
      </div>

      <div>
        {user ? (
          <div>
            <Button variant="outline" onClick={logOut}>
              Log Out
            </Button>
          </div>
        ) : (
          <GoogleLogin onSuccess={responseMessage} onError={errorMessage} />
        )}
      </div>
    </div>
  );
};
