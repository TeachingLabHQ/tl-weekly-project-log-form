import React from "react";
import BackgroundImg from "../assets/background.png";
import { ProjectLogForm } from "../components/weekly-project-log/project-log-form";
export const headers = () => {
  return {
    "Cross-Origin-Opener-Policy": "unsafe-none",
    "Cross-Origin-Resource-Policy": "cross-origin",
  };
};

export default function Index() {
  return (
    <div
      className="h-screen w-full bg-no-repeat bg-cover"
      style={{ backgroundImage: `url(${BackgroundImg})` }}
    >
      <ProjectLogForm />

      {/* Content goes here */}
    </div>
  );
}
