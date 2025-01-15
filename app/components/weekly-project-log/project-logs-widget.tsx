import { Button, Select, Text, TextInput } from "@mantine/core";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { loader } from "~/routes/_index";
import { cn } from "../../utils/utils";
import { useSession } from "../hooks/useSession";
import {
  getPreAssignedProgramProjects,
  handleProjectTypeByTeam,
  projectRolesList,
  updateTotalWorkHours,
} from "./utils";
import { IconX } from "@tabler/icons-react";

type ProjectRowKeys = keyof {
  projectType: string;
  projectName: string;
  projectRole: string;
  workHours: string;
  budgetedHours: string;
};
export const ProjectLogsWidget = ({
  isSubmitted,
  projectWorkEntries,
  setProjectWorkEntries,
  setTotalWorkHours,
}: {
  isSubmitted: boolean;
  projectWorkEntries: {
    projectType: string;
    projectName: string;
    projectRole: string;
    workHours: string;
    budgetedHours: string;
  }[];
  setProjectWorkEntries: React.Dispatch<
    React.SetStateAction<
      {
        projectType: string;
        projectName: string;
        projectRole: string;
        workHours: string;
        budgetedHours: string;
      }[]
    >
  >;
  setTotalWorkHours: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const {
    programProjectsWithBudgetedHours,
    programProjectsStaffing,
    allProjects,
  } = useLoaderData<typeof loader>();
  const { session, setSession, isAuthenticated } = useSession();
  useEffect(() => {
    getPreAssignedProgramProjects(
      programProjectsStaffing,
      programProjectsWithBudgetedHours,
      projectWorkEntries,
      setProjectWorkEntries,
      "Erik Reitinger"
    );
  }, []);

  const handleAddRow = () => {
    setProjectWorkEntries([
      ...projectWorkEntries,
      {
        projectType: "",
        projectName: "",
        projectRole: "",
        workHours: "",
        budgetedHours: "N/A",
      },
    ]);
  };

  const handleChange = (
    index: number,
    field: ProjectRowKeys,
    value: string | null
  ) => {
    const updatedRows = [...projectWorkEntries];
    if (updatedRows[index]) {
      updatedRows[index][field] = value || "";
    }
    setProjectWorkEntries(updatedRows);
    updateTotalWorkHours(updatedRows, setTotalWorkHours);
  };

  const handleDeleteRow = (index: number) => {
    const updatedRows = projectWorkEntries.filter((_, i) => i !== index);
    setProjectWorkEntries(updatedRows);
    updateTotalWorkHours(updatedRows, setTotalWorkHours);
  };

  const handleProjectOptions = (projectType: string) => {
    if (!allProjects) {
      return [];
    }
    if (projectType === "Program-related Project") {
      return allProjects[0]?.projects || [];
    }
    if (projectType === "Internal Project") {
      return allProjects[1]?.projects || [];
    }
    return [];
  };

  return (
    <div className="grid grid-rows gap-4">
      <div
        className={cn("grid gap-4 grid-cols-5", {
          "grid-cols-6": projectWorkEntries.length > 1,
        })}
      >
        <div className="">
          <Text fw={500}>Project Type</Text>
        </div>
        <div className="">
          <Text fw={500}>Project Name</Text>
        </div>
        <div className="">
          <Text fw={500}>Project Role</Text>
        </div>
        <div className="">
          <Text fw={500}>Work Hours</Text>
        </div>
        <div className="">
          <Text fw={500}>Budgeted Hours</Text>
        </div>
      </div>
      {/* Dynamic rows */}
      {projectWorkEntries.map((row, index) => (
        <div
          key={index}
          className={cn("grid gap-4 grid-cols-5", {
            "grid-cols-6": projectWorkEntries.length > 1,
          })}
        >
          <div>
            <Select
              value={row.projectType}
              onChange={(value) => handleChange(index, "projectType", value)}
              placeholder="Select a type"
              data={handleProjectTypeByTeam(session?.buesinessFunction || "")}
              error={
                isSubmitted && !row.projectType
                  ? "Project type is required"
                  : null
              }
            />
          </div>
          <div>
            <Select
              value={row.projectName}
              onChange={(value) => handleChange(index, "projectName", value)}
              placeholder="Select a project"
              data={handleProjectOptions(row.projectType)}
              searchable
              error={
                isSubmitted && !row.projectName
                  ? "Project name is required"
                  : null
              }
            />
          </div>
          <div>
            <Select
              value={row.projectRole}
              onChange={(value) => handleChange(index, "projectRole", value)}
              placeholder="Select a role"
              data={projectRolesList}
              searchable
              error={
                isSubmitted && !row.projectRole
                  ? "Project Role is required"
                  : null
              }
            />
          </div>
          <div>
            <TextInput
              value={row.workHours}
              onChange={(e) => handleChange(index, "workHours", e.target.value)}
              placeholder="Enter work hours"
              error={
                isSubmitted && !row.workHours ? "Work hour is required" : null
              }
            />
          </div>
          <div>
            <TextInput value={row.budgetedHours} placeholder="N/A" readOnly />
          </div>
          {projectWorkEntries.length > 1 && (
            <div>
              <Button
                color="red"
                onClick={() => handleDeleteRow(index)}
                size="xs"
              >
                <IconX size={20} />
              </Button>
            </div>
          )}
        </div>
      ))}

      <Button onClick={handleAddRow}>Add New Row</Button>
    </div>
  );
};
