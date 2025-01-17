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
  getBudgetedHours,
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
  isValidated,
  projectWorkEntries,
  setProjectWorkEntries,
  setTotalWorkHours,
}: {
  isValidated: boolean | null;
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
      session?.name || ""
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
    if (field === "projectType") {
      setProjectWorkEntries((prevEntries) => {
        const updatedRows = prevEntries.map((entry, i) => {
          if (i === index) {
            return {
              ...entry,
              projectType: value || "",
              projectName: "",
              budgetedHours: "N/A",
            };
          }
          return entry;
        });
        return updatedRows;
      });
    } else {
      setProjectWorkEntries((prevEntries) => {
        const updatedRows = prevEntries.map((entry, i) => {
          if (i === index) {
            const updatedEntry = {
              ...entry,
              [field]: value || "",
            };

            if (
              updatedEntry.projectType === "Program-related Project" &&
              ((field === "projectName" && updatedEntry.projectRole) ||
                (field === "projectRole" && updatedEntry.projectName))
            ) {
              const budgetedHours = getBudgetedHours(
                updatedEntry.projectName,
                updatedEntry.projectRole,
                programProjectsWithBudgetedHours
              );
              updatedEntry.budgetedHours = budgetedHours || "N/A";
            }

            return updatedEntry;
          }
          return entry;
        });
        if (field === "workHours") {
          updateTotalWorkHours(updatedRows, setTotalWorkHours);
        }
        return updatedRows;
      });
    }
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
        className={cn("grid gap-4 grid-cols-[1fr_2fr_1fr_1fr_1fr]", {
          "grid-cols-[1fr_2fr_1fr_1fr_1fr_0.5fr]":
            projectWorkEntries.length > 1,
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
          className={cn("grid gap-4 grid-cols-[1fr_2fr_1fr_1fr_1fr]", {
            "grid-cols-[1fr_2fr_1fr_1fr_1fr_0.5fr]":
              projectWorkEntries.length > 1,
          })}
        >
          <div>
            <Select
              value={row.projectType}
              onChange={(value) => handleChange(index, "projectType", value)}
              placeholder="Select a type"
              data={handleProjectTypeByTeam(session?.buesinessFunction || "")}
              error={
                isValidated === false && !row.projectType
                  ? "Project type is required"
                  : null
              }
            />
          </div>
          <div>
            <Select
              //so the select is re-rendered when the project type is changed
              key={`project-name-${row.projectType}-${index}`}
              value={row.projectName}
              onChange={(value) => handleChange(index, "projectName", value)}
              placeholder="Select a project"
              data={handleProjectOptions(row.projectType)}
              searchable
              error={
                isValidated === false && !row.projectName
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
                isValidated === false && !row.projectRole
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
                isValidated === false && !row.workHours
                  ? "Work hour is required"
                  : null
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
