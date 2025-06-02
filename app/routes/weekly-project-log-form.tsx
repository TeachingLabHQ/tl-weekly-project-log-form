import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Navigate } from "@remix-run/react";
import { useSession } from "~/components/auth/hooks/useSession";
import { ProjectLogForm } from "~/components/weekly-project-log/project-log-form";
import { projectRepository } from "~/domains/project/repository";
import { projectService } from "~/domains/project/service";
import { LoadingSpinner } from "~/utils/LoadingSpinner";
import { Suspense } from "react";
import { createSupabaseServerClient } from "../../supabase/supabase.server";
import { employeeRepository } from "~/domains/employee/repository";
import { employeeService } from "~/domains/employee/service";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabaseClient } = createSupabaseServerClient(request);
  
  // Get session from server-side Supabase client
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  let mondayProfileId = "";
  let employeeId = "";
  console.log("session", session);
  // If user is authenticated, fetch their Monday profile
  if (session?.user?.email) {
    const newEmployeeService = employeeService(employeeRepository());
    const { data: employee, error } = await newEmployeeService.fetchMondayEmployee("sarah.johnson@teachinglab.org");
    
    if (employee && !error) {
      mondayProfileId = employee.mondayProfileId;
      employeeId = employee.employeeId;
    }
  }

  const newProjectService = projectService(projectRepository());
  
  // Fetch data in parallel using Promise.all
  const [
    programProjectsStaffing,
    allProjects,
    allBudgetedHours,
  ] = await Promise.all([
    newProjectService.fetchProgramProjectsStaffing(mondayProfileId),
    newProjectService.fetchAllProjects(),
    newProjectService.fetchAllBudgetedHours(),
  ]);

  return {
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
