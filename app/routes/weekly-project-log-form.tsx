import { LoaderFunctionArgs } from "@remix-run/node";
import { ProjectLogForm } from "~/components/weekly-project-log/project-log-form";
import { LoadingSpinner } from "~/utils/LoadingSpinner";
import { Suspense } from "react";

// We can make this even simpler since we don't need server-side data anymore
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Just return empty data since everything is handled client-side now
  return {};
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
