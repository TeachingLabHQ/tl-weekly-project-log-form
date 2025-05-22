import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Navigate } from "@remix-run/react";
import { useSession } from "~/components/auth/hooks/useSession";
import { ProjectLogForm } from "~/components/weekly-project-log/project-log-form";
import { projectRepository } from "~/domains/project/repository";
import { projectService } from "~/domains/project/service";
import { LoadingSpinner } from "~/utils/LoadingSpinner";
import { AccessDeniedState } from "~/components/vendor-payment-form/access-denied-state";
export const loader = async (args: LoaderFunctionArgs) => {
  const newProjectService = projectService(projectRepository());

  // Fetch data in parallel using Promise.all
  const [
    programProjectsStaffing,
    allProjects,
    allBudgetedHours,
  ] = await Promise.all([
    newProjectService.fetchProgramProjectsStaffing(),
    newProjectService.fetchAllProjects(),
    newProjectService.fetchAllBudgetedHours(),
  ]);

  return {
    programProjectsStaffing: programProjectsStaffing.data,
    allProjects: allProjects.data,
    allBudgetedHours: allBudgetedHours.data,
  };
};

export default function WeeklyProjectLogForm() {
  const { mondayProfile } = useSession();
  if (mondayProfile === null) {
    return <LoadingSpinner />;
  }
  if (mondayProfile?.businessFunction === "coach/facilitator") {
    return <AccessDeniedState errorMessage="This form is only accessible to FTE/PTE employees. If you believe this is an error, please contact your administrator." />;
  }
  return (
    <div className="min-h-screen w-full overflow-auto">
      <ProjectLogForm />
    </div>
  );
}
