import React, { useState } from "react";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import { ProjectLogsWidget } from "./project-logs-widget";
import { Textarea } from "@mantine/core";

export const ProjectLogForm = () => {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
    },
  });
  const [value, setValue] = useState<Date | null>(null);
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-2/4 p-[3%] rounded-[25px] bg-white/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] text-white mb-12">
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
          <h1>Weekly Project Log Form</h1>
          <div>
            <DateInput
              value={value}
              onChange={setValue}
              label="Date input"
              placeholder="Date input"
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
