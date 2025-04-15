import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Navigate } from "@remix-run/react";
import { useSession } from "~/components/auth/hooks/useSession";
import { ProjectLogForm } from "~/components/weekly-project-log/project-log-form";
import { projectRepository } from "~/domains/project/repository";
import { projectService } from "~/domains/project/service";
import { LoadingSpinner } from "~/utils/LoadingSpinner";
import { Suspense } from "react";

export const loader = async (args: LoaderFunctionArgs) => {
  const newProjectService = projectService(projectRepository());

  // Fetch data in parallel using Promise.all
  const [
    programProjectsWithBudgetedHours,
    programProjectsStaffing,
    allProjects,
    allBudgetedHours,
  ] = await Promise.all([
    newProjectService.fetchProgramProjectsWithHours(),
    newProjectService.fetchProgramProjectsStaffing(),
    newProjectService.fetchAllProjects(),
    newProjectService.fetchAllBudgetedHours(),
  ]);

  return {
    programProjectsWithBudgetedHours: programProjectsWithBudgetedHours.data,
    programProjectsStaffing: programProjectsStaffing.data,
    allProjects: allProjects.data,
    allBudgetedHours: allBudgetedHours.data,
  };
};

// Loading component for the form
const ProjectLogFormLoader = () => (
  <div className="w-full h-screen flex items-center justify-center">
    <LoadingSpinner className="bg-white/50" />
    <>Weekly Project Log Form Loading...</>
  </div>
);

export default function WeeklyProjectLogForm() {
  return (
    <div className="min-h-screen w-full overflow-auto">
      <Suspense fallback={<ProjectLogFormLoader />}>
        <ProjectLogForm />
      </Suspense>
    </div>
  );
}
