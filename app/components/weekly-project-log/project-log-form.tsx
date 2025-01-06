import React, { useState } from "react";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import { ProjectLogsWidget } from "./project-logs-widget";

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
        </form>
      </div>
    </div>
  );
};
