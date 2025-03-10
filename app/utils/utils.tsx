import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: string) => {
  console.log("date", date);
  const datePart = date.split("T")[0] || "";
  const parts = datePart.split("-");

  // Check if parts exist before accessing them
  if (parts.length >= 3) {
    return `${parts[0]}-${parts[1]}-${parts[2]}`;
  }
  // Fallback if parts are missing
  return date.substring(0, 10);
};
