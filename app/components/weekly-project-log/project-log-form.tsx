import React, { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import { ProjectLogsWidget } from "./project-logs-widget";
import { Textarea } from "@mantine/core";
import { projectService } from "../../domains/project/service";
import { projectRepository } from "../../domains/project/repository";
import { useLoaderData } from "@remix-run/react";
import { useSession } from "../hooks/useSession";

export const ProjectLogForm = () => {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
    },
  });

  const { session, setSession, isAuthenticated } = useSession();
  const [pickedDate, setPickedDate] = useState<Date | null>(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6

    // Calculate the current week's Monday
    const currentMonday = new Date(today);
    currentMonday.setDate(
      today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
    ); //Monday is start of a new week

    // Calculate the next week's Monday
    const lastMonday = new Date(currentMonday);
    lastMonday.setDate(currentMonday.getDate() - 7);

    // If today is between Thursday and Sunday, return current Monday
    if (dayOfWeek >= 4 || dayOfWeek === 0) {
      return currentMonday;
    }
    // Otherwise, return the last Monday
    return lastMonday;
  });

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-4/5 p-[3%] rounded-[25px] bg-white/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] text-white mb-12">
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
          <h1>Weekly Project Log Form</h1>
          <div>
            <DateInput
              value={pickedDate}
              onChange={setPickedDate}
              label="Date input"
              placeholder="Date input"
              excludeDate={(date) => date.getDay() !== 1}
            />
          </div>
          <div>
            <ProjectLogsWidget />
          </div>
          <div>
            <Textarea
              label="Do you have any additional comments?"
              description="Please use this notes section to add details about time allocation this week. If you have concerns about your capacity or your projects, please discuss with your home manager and/or project lead."
              placeholder=""
            />
          </div>
        </form>
      </div>
    </div>
  );
};
