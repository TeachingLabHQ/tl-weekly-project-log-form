import { Button, Loader, Textarea } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import React, { useState } from "react";
import { cn } from "~/utils/utils";
import { useSession } from "../hooks/useSession";
import { ProjectLogsWidget } from "./project-logs-widget";
import { isProjectLogComplete } from "./utils";
import { Reminders } from "./reminders";
import { IconX, IconCheck } from "@tabler/icons-react";
import { Notification } from "@mantine/core";
export type FormValues = {
  email: string;
  date: Date | null;
  comment: string;
};

export const ProjectLogForm = () => {
  const { session, setSession, isAuthenticated } = useSession();
  const [totalWorkHours, setTotalWorkHours] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState<boolean | null>(null);
  const [projectWorkEntries, setProjectWorkEntries] = useState([
    {
      projectType: "",
      projectName: "",
      projectRole: "",
      workHours: "",
      budgetedHours: "N/A",
    },
  ]);
  const xIcon = <IconX size={20} />;
  const checkIcon = <IconCheck size={20} />;

  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
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

  const form = useForm({
    initialValues: {
      date: selectedDate,
      comment: "",
    },
    validate: {
      date: (value) => (value ? null : "date is required"),
    },
  });

  const handleSubmit = async (
    values: typeof form.values,
    event: React.FormEvent<HTMLFormElement> | undefined
  ) => {
    if (!session?.name) {
      console.error("Please log in first");
      return; // Prevent form submission
    }
    const userName = session.name;
    // Check if all project logs are complete
    const areAllLogsComplete = projectWorkEntries.every(isProjectLogComplete);
    if (!areAllLogsComplete) {
      console.error("Please fill in all fields for each project");
      return; // Prevent form submission
    }
    try {
      setIsSuccessful(null);
      setIsSubmitted(true);
      const response = await fetch("/api/weekly-project-log/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userName,
          date: selectedDate,
          projectLogEntries: projectWorkEntries,
          comment: values.comment,
        }),
      });
      if (!response.ok) {
        console.log("Form submission went wrong");
        setIsSuccessful(false);
        setIsSubmitted(false);
        return;
      }
      setIsSuccessful(true);
      setIsSubmitted(false);
      console.log("Form submitted successfully");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full h-full grid grid-cols-12 grid-rows-[auto_auto] gap-8 py-8">
      <div className="row-start-1 col-start-2 col-span-10">
        <Reminders />
      </div>

      <div className="row-start-2 col-start-2 col-span-8 h-fit p-8 rounded-[25px] bg-white/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] text-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(form.values, e);
          }}
          className="flex flex-col gap-4"
        >
          <h1 className="font-bold text-3xl">Weekly Project Log Form</h1>
          <div className="flex flex-col gap-1">
            <h1 className="font-medium text-lg">
              Enter the Monday of the week:
            </h1>
            <DateInput
              value={selectedDate}
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
              setTotalWorkHours={setTotalWorkHours}
            />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="font-medium text-lg">
              Do you have any additional comments?
            </h1>
            <Textarea
              placeholder=""
              key={form.key("comment")}
              {...form.getInputProps("comment")}
            />
          </div>
          {(isSubmitted === false || isSuccessful !== null) && (
            <Button type="submit">Submit</Button>
          )}
          {isSubmitted && isSuccessful === null && <Loader size={30} />}
          {isSuccessful === true && (
            <Notification
              icon={checkIcon}
              color="teal"
              title="Form is submitted successfully!"
              mt="md"
            ></Notification>
          )}
          {isSuccessful === false && (
            <Notification
              icon={xIcon}
              color="red"
              title="Something went wrong"
            ></Notification>
          )}
        </form>
      </div>

      <div className="row-start-2 col-start-10 col-span-2 flex flex-col items-center">
        <div className="w-fit py-5 px-10 rounded-[25px] bg-white/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] text-white flex flex-col items-center gap-3">
          <h3 className="text-xl font-bold">Total Time</h3>
          <h1 className="text-xl font-bold">{totalWorkHours}</h1>
        </div>
      </div>
    </div>
  );
};
