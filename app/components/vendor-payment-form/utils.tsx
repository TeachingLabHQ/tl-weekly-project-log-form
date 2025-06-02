import { ReminderItem } from "../weekly-project-log/reminders";

export enum Tier {
  TIER_1 = "Tier 1",
  TIER_2 = "Tier 2",
  TIER_3 = "Tier 3",
}

export type TaskOption = {
  taskName: string;
  "Tier 1": number | null;
  "Tier 2": number | null;
  "Tier 3": number | null;
  maxHours: number | null;
};

export const taskOptions: TaskOption[] = [
  {
    taskName: "Onboarding",
    "Tier 1": 50,
    "Tier 2": null,
    "Tier 3": null,
    maxHours: 10,
  },
  {
    taskName:
      "Lead Coaching activities: 1-1, direct-to-educator sessions, micro group Professional Learning, or walkthrough",
    "Tier 1": 110,
    "Tier 2": 125,
    "Tier 3": 140,
    maxHours: 6,
  },
  {
    taskName: "Lead Facilitation of group Professional Learning course",
    "Tier 1": 150,
    "Tier 2": 165,
    "Tier 3": 180,
    maxHours: 6,
  },
  {
    taskName:
      "Tech/Support Facilitation of group Professional Learning courses",
    "Tier 1": 50,
    "Tier 2": 50,
    "Tier 3": 50,
    maxHours: null,
  },
  {
    taskName: "Second Facilitation of group Professional Learning courses",
    "Tier 1": 100,
    "Tier 2": null,
    "Tier 3": null,
    maxHours: 6,
  },
  {
    taskName: "Mentoring of other Facilitation Contractors",
    "Tier 1": null,
    "Tier 2": 80,
    "Tier 3": 80,
    maxHours: null,
  },
  {
    taskName: "Site Context + Support",
    "Tier 1": 50,
    "Tier 2": 50,
    "Tier 3": 50,
    maxHours: null,
  },
  {
    taskName: "Content Training",
    "Tier 1": 50,
    "Tier 2": 50,
    "Tier 3": 50,
    maxHours: null,
  },
  {
    taskName: "Learning Opportunities: Quarterly Paid Office Hours, Book Clubs, Observations, Kick Offs, etc.",
    "Tier 1": 50,
    "Tier 2": 50,
    "Tier 3": 50,
    maxHours: null,
  },
  {
    taskName: "Local Travel",
    "Tier 1": 20,
    "Tier 2": 20,
    "Tier 3": 20,
    maxHours: 3,
  },
  {
    taskName: "Non-Local Travel",
    "Tier 1": 20,
    "Tier 2": 20,
    "Tier 3": 20,
    maxHours: 16,
  },
];
export const REMINDER_ITEMS: ReminderItem[] = [
  {
    title: "Submission Deadline:",
    content:
      "Ensure to submit your payment as soon as possible on the day of your work. If you need to submit a payment for a previous month, please contact the finance team.",
  },
];
