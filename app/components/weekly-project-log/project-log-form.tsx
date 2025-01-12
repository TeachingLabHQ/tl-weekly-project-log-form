import { Button, Textarea } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import React, { useState } from "react";
import { cn } from "~/utils/utils";
import { useSession } from "../hooks/useSession";
import { ProjectLogsWidget } from "./project-logs-widget";
import { isProjectLogComplete } from "./utils";
export type FormValues = {
  email: string;
  date: Date | null;
  comment: string;
};

export const ProjectLogForm = () => {
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
  const { session, setSession, isAuthenticated } = useSession();
  const form = useForm({
    initialValues: {
      email: session?.email || "",
      date: pickedDate,
      comment: "",
    },
    validate: {
      email: (value) => (value ? null : "Email is required"),
      date: (value) => (value ? null : "date is required"),
    },
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [projectWorkEntries, setProjectWorkEntries] = useState([
    {
      projectType: "",
      projectName: "",
      projectRole: "",
      workHours: "",
      budgetedHours: "",
    },
  ]);

  const handleSubmit = async (
    values: typeof form.values,
    event: React.FormEvent<HTMLFormElement> | undefined
  ) => {
    setIsSubmitted(true);

    // Check if all project logs are complete
    const areAllLogsComplete = projectWorkEntries.every(isProjectLogComplete);

    if (!areAllLogsComplete) {
      console.error("Please fill in all fields for each project");
      return; // Prevent form submission
    }
    console.log("setProjectWorkEntries", projectWorkEntries);
  };

  return (
    <div className="w-full h-full flex items-center justify-center py-16">
      <div className="w-4/5 p-[3%] rounded-[25px] bg-white/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] text-white mb-12">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(form.values, e);
          }}
        >
          <h1>Weekly Project Log Form</h1>
          <div>
            <DateInput
              value={pickedDate}
              label="Date input"
              placeholder="Date input"
              excludeDate={(date) => date.getDay() !== 1}
              key={form.key("date")}
              {...form.getInputProps("date")}
            />
          </div>
          <div>
            <ProjectLogsWidget
              isSubmitted={isSubmitted}
              projectWorkEntries={projectWorkEntries}
              setProjectWorkEntries={setProjectWorkEntries}
            />
          </div>
          <div>
            <Textarea
              label="Do you have any additional comments?"
              description="Please use this notes section to add details about time allocation this week. If you have concerns about your capacity or your projects, please discuss with your home manager and/or project lead."
              placeholder=""
              key={form.key("comment")}
              {...form.getInputProps("comment")}
            />
          </div>
          <Button type="submit">Submit</Button>
        </form>
      </div>
    </div>
  );
};
