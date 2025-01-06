import {
  Select,
  TextInput,
  Group,
  Button,
  Alert,
  Text,
  Stack,
} from "@mantine/core";
import React, { useState } from "react";
import { cn } from "../../utils/utils";

export const ProjectLogsWidget = () => {
  const [rows, setRows] = useState([
    { projectType: "", projectName: "", projectRole: "", workHours: "" },
  ]);

  const handleAddRow = () => {
    setRows([
      ...rows,
      { projectType: "", projectName: "", projectRole: "", workHours: "" },
    ]);
  };

  const handleChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleDeleteRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
  };

  return (
    <div className="grid grid-rows gap-4">
      <div
        className={cn("grid gap-4 mb-4 grid-cols-5", {
          "grid-cols-6": rows.length > 1,
        })}
      >
        <div className="">
          <Text fw={500}>Project Type*</Text>
        </div>
        <div className="">
          <Text fw={500}>Project Name*</Text>
        </div>
        <div className="">
          <Text fw={500}>Project Role*</Text>
        </div>
        <div className="">
          <Text fw={500}>Actual Hours*</Text>
        </div>
        <div className="">
          <Text fw={500}>Budgeted Hours*</Text>
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
            />
          </div>
          <div>
            <Select
              value={row.projectName}
              placeholder="Pick value"
              data={["Project Names"]}
            />
          </div>
          <div>
            <Select
              value={row.projectRole}
              placeholder="Pick value"
              data={["Project Names"]}
            />
          </div>
          <div>
            <TextInput
              value={row.workHours}
              onChange={(e) => handleChange(index, "workHours", e.target.value)}
              placeholder="Enter work hours"
            />
          </div>
          <div>
            <TextInput
              value={row.workHours}
              onChange={(e) => handleChange(index, "workHours", e.target.value)}
              placeholder="Enter work hours"
            />
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
