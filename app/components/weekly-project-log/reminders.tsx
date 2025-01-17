import { Divider } from "@mantine/core";

export const Reminders = () => {
  return (
    <div className="w-fit p-8 rounded-[25px] bg-white/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] text-white flex flex-col gap-5 overflow-auto ">
      <div>
        <p
          style={{
            fontSize: "20px",
            fontWeight: "700",
          }}
        >
          Reminder: NEW Staffing Utilization Dashboard
        </p>
        <p
          style={{
            fontSize: "18px",
            fontWeight: "500",
          }}
        >
          - To find information on your program project assignments and budgeted
          hours for each project role, please visit the{" "}
          <a
            href="https://tl-data.teachinglab.org/shiny/project_log_tl/"
            style={{ textDecoration: "underline" }}
            rel="noreferrer noopener"
            target="_blank"
          >
            Staffing Utilization Dashboard
          </a>
        </p>
      </div>
      <Divider />
      <div>
        <p
          style={{
            fontSize: "20px",
            fontWeight: "700",
          }}
        >
          Q: Need to adjust your hours post submission?
        </p>
        <p
          style={{
            fontSize: "18px",
            fontWeight: "500",
          }}
        >
          - To adjust submitted hours, please send an email to the{" "}
          <a
            href="mailto:project.log@teachinglab.org"
            style={{ textDecoration: "underline" }}
          >
            project log service
          </a>
          , addressed to Savanna Worthington.
        </p>
      </div>
      <Divider />
      <div>
        <p
          style={{
            fontSize: "20px",
            fontWeight: "700",
          }}
        >
          Q: Don't see your project?
        </p>
        <p
          style={{
            fontSize: "18px",
            fontWeight: "500",
          }}
        >
          - New projects are created when partner contracts have been signed, or
          internal project budgets have been created. If you do not see your
          client project listed in the drop down, please contact{" "}
          <a
            href="mailto:daissan.colbert@teachinglab.org"
            style={{ textDecoration: "underline" }}
          >
            Daissan Colbert
          </a>{" "}
          and{" "}
          <a
            href="mailto:kelly.sanders@teachinglab.org"
            style={{ textDecoration: "underline" }}
          >
            Kelly Sanders
          </a>
          .
        </p>
      </div>
    </div>
  );
};
