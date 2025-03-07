import { Divider, ScrollArea, Text } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { Link } from "@remix-run/react";

export const Reminders = () => {
  return (
    <div className="w-full p-6 rounded-[25px] bg-white/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] text-white flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <Text size="xl" fw={700}>
          Important Reminders
        </Text>
        <div className="flex items-center gap-1">
          <Text size="sm" fw={500}>
            Scroll for more
          </Text>
          <IconChevronDown size={16} className="animate-bounce" />
        </div>
      </div>

      <ScrollArea h={200} scrollbarSize={6} type="hover" offsetScrollbars>
        <div className="flex flex-col gap-4 pr-2">
          <div>
            <Text size="lg" fw={700}>
              NEW Budgeted Hours Column:
            </Text>
            <Text size="md" fw={500}>
              - The "Budgeted Hours" column displays estimated hours for program
              projects. You are free to log hours below or above the displayed
              amount. If needed, please provide additional context or reasons in
              the comment section.
            </Text>
          </div>
          <Divider />
          <div>
            <Text size="lg" fw={700}>
              Staffing Utilization Dashboard
            </Text>
            <Text size="md" fw={500}>
              - To find information on your program project assignments and
              budgeted hours for each project role, please visit the{" "}
              <Link
                to="/staffing-dashboard"
                style={{ textDecoration: "underline" }}
              >
                Staffing Utilization Dashboard
              </Link>{" "}
              in the navigation bar.
            </Text>
          </div>
          <Divider />
          <div>
            <Text size="lg" fw={700}>
              Q: Need to adjust your hours post submission?
            </Text>
            <Text size="md" fw={500}>
              - To adjust submitted hours, please send an email to the{" "}
              <a
                href="mailto:project.log@teachinglab.org"
                style={{ textDecoration: "underline" }}
              >
                project log service
              </a>
              , addressed to Savanna Worthington.
            </Text>
          </div>
          <Divider />
          <div>
            <Text size="lg" fw={700}>
              Q: Don't see your project?
            </Text>
            <Text size="md" fw={500}>
              - New projects are created when partner contracts have been
              signed, or internal project budgets have been created. If you do
              not see your client project listed in the drop down, please
              contact finance team, attention{" "}
              <a
                href="mailto:eric.vandonge@teachinglab.org"
                style={{ textDecoration: "underline" }}
              >
                Eric Van Donge
              </a>
              .
            </Text>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
