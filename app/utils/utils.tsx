import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: Date) => {
  const dateValue = new Date(date);
  const month = ("0" + (dateValue.getMonth() + 1)).slice(-2);
  const day = ("0" + dateValue.getDate()).slice(-2);
  const year = dateValue.getFullYear();
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
};
