import { LoaderFunctionArgs } from "@remix-run/node";
import { useSession } from "~/components/hooks/useSession";
import { ProjectLogForm } from "~/components/weekly-project-log/project-log-form";
import { projectRepository } from "~/domains/project/repository";
import { projectService } from "~/domains/project/service";
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
export default function WeeklyProjectLogForm() {
  const { isAuthenticated, errorMessage } = useSession();
  return (
    <div className="min-h-screen w-full overflow-auto">
      {isAuthenticated ? <ProjectLogForm /> : <></>}
    </div>
  );
}
