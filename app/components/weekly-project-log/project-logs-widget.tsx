import { Button, Select, Text, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { cn } from "../../utils/utils";
import { useSession } from "../auth/hooks/useSession";
import {
  getPreAssignedProgramProjects,
  handleProjectTypeByTeam,
  projectRolesList,
  updateTotalWorkHours,
  getBudgetedHoursFromMonday,
  handleKeyDown,
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
  projectData,
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
  projectData: {
    programProjectsStaffing: any;
    allProjects: any;
    allBudgetedHours: any;
  } | null;
}) => {
  const { mondayProfile } = useSession();
  
  useEffect(() => {
    if (mondayProfile && projectData?.programProjectsStaffing && projectData?.allBudgetedHours) {
      getPreAssignedProgramProjects(
        projectData.programProjectsStaffing,
        projectWorkEntries,
        setProjectWorkEntries,
        {
          name: "Sarah Johnson",
          email: "sarah.johnson@teachinglab.org",
          businessFunction: "Program Manager",
          mondayProfileId: "1234567890",
          employeeId: "1234567890",
        },
        projectData.allBudgetedHours
      );
    }
  }, [mondayProfile, projectData]);

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
      //reset the project name and budgeted hours when the project type is changed
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

            // Auto-set project role for Internal Admin
            if (
              field === "projectName" &&
              (value === "TL_Internal Admin" ||
                value ===
                  "ZZ_PTO, Holidays, Approved Break, or Other Paid Leave")
            ) {
              updatedEntry.projectRole = "Other";
            }

            if (
              updatedEntry.projectType === "Program-related Project" &&
              ((field === "projectName" && updatedEntry.projectRole) ||
                (field === "projectRole" && updatedEntry.projectName)) &&
              projectData?.allBudgetedHours
            ) {
              const budgetedHours = getBudgetedHoursFromMonday(
                updatedEntry.projectName,
                updatedEntry.projectRole,
                mondayProfile?.email || "",
                projectData.allBudgetedHours
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
    if (!projectData?.allProjects) {
      return [];
    }

    let projects: string[] = [];

    if (projectType === "Program-related Project") {
      projects = projectData.allProjects[0]?.projects || [];
    } else if (projectType === "Internal Project") {
      projects = projectData.allProjects[1]?.projects || [];
    }

    // Remove duplicates by converting to Set and back to array
    return [...new Set(projects)].sort((a, b) => a.localeCompare(b));
  };

  return (
    <div className="grid grid-rows gap-4">
      <div
        className={cn("grid gap-4 grid-cols-[1fr_2fr_1.3fr_1fr_1fr]", {
          "grid-cols-[1fr_2fr_1.3fr_1fr_1fr_0.5fr]":
            projectWorkEntries.length > 1,
        })}
      >
        <div className="">
          <Text fw={500} size="md">
            Project Type
          </Text>
        </div>
        <div className="">
          <Text fw={500} size="md">
            Project Name
          </Text>
        </div>
        <div className="">
          <Text fw={500} size="md">
            Project Role
          </Text>
        </div>
        <div className="">
          <Text fw={500} size="md">
            Work Hours
          </Text>
        </div>
        <div className="">
          <Text fw={500} size="md">
            Budgeted Hours
          </Text>
        </div>
      </div>
      {/* Dynamic rows */}
      {projectWorkEntries.map((row, index) => (
        <div
          key={index}
          className={cn("grid gap-4 grid-cols-[1fr_2fr_1.3fr_1fr_1fr]", {
            "grid-cols-[1fr_2fr_1.3fr_1fr_1fr_0.5fr]":
              projectWorkEntries.length > 1,
          })}
        >
          <div>
            <Select
              value={row.projectType}
              onChange={(value) => handleChange(index, "projectType", value)}
              placeholder="Select a type"
              data={handleProjectTypeByTeam(
                mondayProfile?.businessFunction || ""
              )}
              onKeyDown={handleKeyDown}
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
              onKeyDown={handleKeyDown}
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
              disabled={row.projectName === "Internal Admin"}
              onKeyDown={handleKeyDown}
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
              onKeyDown={handleKeyDown}
              error={
                isValidated === false &&
                (!row.workHours || Number(row.workHours) === 0)
                  ? "Work Hours are required"
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
