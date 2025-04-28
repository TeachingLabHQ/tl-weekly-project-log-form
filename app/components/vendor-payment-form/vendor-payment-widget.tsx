import { Button, Select, Text, TextInput, NumberInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { cn } from "../../utils/utils";
import { IconX } from "@tabler/icons-react";
import { taskOptions, Tier } from "./utils";

type VendorPaymentRowKeys = keyof {
  task: string;
  project: string;
  workHours: string;
};

export const VendorPaymentWidget = ({
  isValidated,
  vendorPaymentEntries,
  setVendorPaymentEntries,
  setTotalWorkHours,
  cfTier,
}: {
  isValidated: boolean | null;
  vendorPaymentEntries: {
    task: string;
    project: string;
    workHours: string;
  }[];
  setVendorPaymentEntries: React.Dispatch<
    React.SetStateAction<
      {
        task: string;
        project: string;
        workHours: string;
      }[]
    >
  >;
  setTotalWorkHours: React.Dispatch<React.SetStateAction<number>>;
  cfTier: string;
}) => {
  // TODO: Add project options from loader data
  const projectOptions = ["Project 1", "Project 2", "Project 3"];

  // Filter tasks based on tier and rate availability
  const getAvailableTasks = () => {
    return taskOptions.filter((task) => {
      switch (cfTier) {
        case Tier.TIER_1:
          return task["Tier 1"] !== null && task["Tier 1"] > 0;
        case Tier.TIER_2:
          return task["Tier 2"] !== null && task["Tier 2"] > 0;
        case Tier.TIER_3:
          return task["Tier 3"] !== null && task["Tier 3"] > 0;
        default:
          return false;
      }
    });
  };

  const calculateTotalPay = (task: string, workHours: string): number => {
    try {
      const taskData = JSON.parse(task);
      const hours = parseFloat(workHours) || 0;

      // Get rate based on tier
      let rate = 0;
      switch (cfTier) {
        case Tier.TIER_1:
          rate = taskData["Tier 1"];
          break;
        case Tier.TIER_2:
          rate = taskData["Tier 2"];
          break;
        case Tier.TIER_3:
          rate = taskData["Tier 3"];
          break;
        default:
          rate = 0;
      }

      return rate * hours;
    } catch (error) {
      console.error("Error calculating total pay:", error);
      return 0;
    }
  };

  const handleAddRow = () => {
    setVendorPaymentEntries([
      ...vendorPaymentEntries,
      {
        task: "",
        project: "",
        workHours: "",
      },
    ]);
  };

  const handleChange = (
    index: number,
    field: VendorPaymentRowKeys,
    value: string | null
  ) => {
    setVendorPaymentEntries((prevEntries) => {
      const updatedRows = prevEntries.map((entry, i) => {
        if (i === index) {
          return {
            ...entry,
            [field]: value || "",
          };
        }
        return entry;
      });
      if (field === "workHours") {
        updateTotalWorkHours(updatedRows, setTotalWorkHours);
      }
      return updatedRows;
    });
  };

  const handleDeleteRow = (index: number) => {
    const updatedRows = vendorPaymentEntries.filter((_, i) => i !== index);
    setVendorPaymentEntries(updatedRows);
    updateTotalWorkHours(updatedRows, setTotalWorkHours);
  };

  const updateTotalWorkHours = (
    rows: { workHours: string }[],
    setTotalWorkHours: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const total = rows.reduce((sum, row) => {
      const hours = parseFloat(row.workHours) || 0;
      return sum + hours;
    }, 0);
    setTotalWorkHours(total);
  };

  // Get available tasks for the current tier
  const availableTasks = getAvailableTasks();

  return (
    <div className="grid grid-rows gap-4">
      <div
        className={cn("grid gap-4 grid-cols-[2fr_2fr_1fr_1fr]", {
          "grid-cols-[2fr_2fr_1fr_1fr_0.5fr]": vendorPaymentEntries.length > 1,
        })}
      >
        <div className="">
          <Text fw={500} size="md">
            Task
          </Text>
        </div>
        <div className="">
          <Text fw={500} size="md">
            Project
          </Text>
        </div>
        <div className="">
          <Text fw={500} size="md">
            Work Hours
          </Text>
        </div>
        <div className="">
          <Text fw={500} size="md">
            Total Pay
          </Text>
        </div>
      </div>
      {/* Dynamic rows */}
      {vendorPaymentEntries.map((row, index) => (
        <div
          key={index}
          className={cn("grid gap-4 grid-cols-[2fr_2fr_1fr_1fr]", {
            "grid-cols-[2fr_2fr_1fr_1fr_0.5fr]":
              vendorPaymentEntries.length > 1,
          })}
        >
          <div>
            <Select
              value={row.task || null}
              onChange={(value) => handleChange(index, "task", value)}
              placeholder="Select a task"
              data={availableTasks.map((option) => ({
                value: JSON.stringify(option),
                label: option.taskName,
              }))}
              searchable
              error={
                isValidated === false && !row.task ? "Task is required" : null
              }
            />
          </div>
          <div>
            <Select
              value={row.project || null}
              onChange={(value) => handleChange(index, "project", value)}
              placeholder="Select a project"
              data={projectOptions}
              searchable
              error={
                isValidated === false && !row.project
                  ? "Project is required"
                  : null
              }
            />
          </div>
          <div>
            <NumberInput
              value={parseFloat(row.workHours) || 0}
              onChange={(value) =>
                handleChange(index, "workHours", value?.toString() || "")
              }
              placeholder="Enter work hours"
              max={
                taskOptions.find((option) => option.taskName === row.task)
                  ?.maxHours || undefined
              }
              min={0}
              error={
                isValidated === false &&
                (!row.workHours || Number(row.workHours) === 0)
                  ? "Work Hours are required"
                  : null
              }
            />
          </div>
          <div>
            <TextInput
              value={`$${calculateTotalPay(
                row.task || "",
                row.workHours || ""
              ).toFixed(2)}`}
              readOnly
              placeholder="Total pay"
            />
          </div>
          {vendorPaymentEntries.length > 1 && (
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
