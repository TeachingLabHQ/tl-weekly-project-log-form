import { Button, Select, Text, TextInput } from "@mantine/core";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { loader } from "~/routes/_index";
import { cn } from "../../utils/utils";
import { useSession } from "../hooks/useSession";
import { getPreAssignedProgramProjects, projectRolesList } from "./utils";

type ProjectRowKeys = keyof {
  projectType: string;
  projectName: string;
  projectRole: string;
  workHours: string;
  budgetedHours: string;
};
export const ProjectLogsWidget = ({
  isSubmitted,
}: {
  isSubmitted: boolean;
}) => {
  const {
    programProjectsWithBudgetedHours,
    programProjectsStaffing,
    allProjects,
  } = useLoaderData<typeof loader>();
  const { session, setSession, isAuthenticated } = useSession();
  const [rows, setRows] = useState([
    {
      projectType: "",
      projectName: "",
      projectRole: "",
      workHours: "",
      budgetedHours: "",
    },
  ]);
  useEffect(() => {
    getPreAssignedProgramProjects(
      programProjectsStaffing,
      programProjectsWithBudgetedHours,
      rows,
      setRows,
      "Erik Reitinger"
    );
  }, []);

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        projectType: "",
        projectName: "",
        projectRole: "",
        workHours: "",
        budgetedHours: "",
      },
    ]);
  };

  const handleChange = (
    index: number,
    field: ProjectRowKeys,
    value: string | null
  ) => {
    const updatedRows = [...rows];
    if (updatedRows[index]) {
      updatedRows[index][field] = value || "";
    }
    setRows(updatedRows);
  };

  const handleDeleteRow = (index: number) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
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
        className={cn("grid gap-4 mb-4 grid-cols-5", {
          "grid-cols-6": rows.length > 1,
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
      {rows.map((row, index) => (
        <div
          key={index}
          className={cn("grid gap-4 mb-4 grid-cols-5", {
            "grid-cols-6": rows.length > 1,
          })}
        >
          <div>
            <Select
              value={row.projectType}
              onChange={(value) => handleChange(index, "projectType", value)}
              placeholder="Pick value"
              data={["Program-related Project", "Internal Project"]}
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
              placeholder="Pick value"
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
              placeholder="Pick value"
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
          {rows.length > 1 && (
            <div>
              <Button color="red" onClick={() => handleDeleteRow(index)}>
                Delete
              </Button>
            </div>
          )}
        </div>
      ))}

      <Button onClick={handleAddRow}>Add New Row</Button>
    </div>
  );
};
