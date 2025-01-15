import React from "react";
import BackgroundImg from "../assets/background.png";
import { ProjectLogForm } from "../components/weekly-project-log/project-log-form";
import { LoaderFunctionArgs } from "@remix-run/node";
import { projectRepository } from "~/domains/project/repository";
import { projectService } from "~/domains/project/service";
import { useSession } from "~/components/hooks/useSession";
import { useLoaderData } from "@remix-run/react";
import { LandingPage } from "~/components/ui/landing-page";
export const headers = () => {
  return {
    "Cross-Origin-Opener-Policy": "unsafe-none",
    "Cross-Origin-Resource-Policy": "cross-origin",
  };
};
export const loader = async (args: LoaderFunctionArgs) => {
  const newProjectService = projectService(projectRepository());

  const { data: programProjectsWithBudgetedHours } =
    await newProjectService.fetchProgramProjectsWithHours();
  const { data: programProjectsStaffing } =
    await newProjectService.fetchProgramProjectsStaffing();
  const { data: allProjects } = await newProjectService.fetchAllProjects();
  return {
    programProjectsWithBudgetedHours,
    programProjectsStaffing,
    allProjects,
  };
};
export default function Index() {
  const { session, setSession, isAuthenticated, errorMessage } = useSession();
  return (
    <div
      className=" bg-no-repeat bg-cover"
      style={{
        backgroundImage: `url(${BackgroundImg})`,
      }}
    >
      <div className="min-h-screen w-full overflow-auto flex justify-center items-center">
        {isAuthenticated ? (
          <ProjectLogForm />
        ) : (
          <LandingPage errorMessage={errorMessage} />
        )}
      </div>
    </div>
  );
}
