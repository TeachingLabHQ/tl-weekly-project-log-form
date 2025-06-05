import { ReminderItem } from "../weekly-project-log/reminders";

export enum Tier {
  TIER_1 = "Tier 1",
  TIER_2 = "Tier 2",
  TIER_3 = "Tier 3",
}

export type TaskDetails = {
  taskName: string;
  "Tier 1": number | null;
  "Tier 2": number | null;
  "Tier 3": number | null;
  maxHours: number | null;
};

export const facilitationTaskOptions: TaskDetails[] = [
  {
    taskName: "Onboarding",
    "Tier 1": 50,
    "Tier 2": null,
    "Tier 3": null,
    maxHours: 10,
  },
  {
    taskName:
      "Lead coaching activities: 1-1 coaching sessions, micro group PL, or walkthrough",
    "Tier 1": 110,
    "Tier 2": 125,
    "Tier 3": 140,
    maxHours: 6,
  },
  {
    taskName:
      "Lead coaching preparation & follow-up: internalization or preparation for coaching sessions; follow-up activities; completion of Coaching Action Plans and Coaching Logs",
    "Tier 1": 50,
    "Tier 2": 50,
    "Tier 3": 50,
    maxHours: null,
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
    taskName: "Tech/Support Facilitation of virtual group PL courses",
    "Tier 1": 50,
    "Tier 2": 50,
    "Tier 3": 50,
    maxHours: null,
  },
  {
    taskName: "Site Context + Support: Meetings and collaborations with project team members and/or partners to support the overall project success",
    "Tier 1": 50,
    "Tier 2": 50,
    "Tier 3": 50,
    maxHours: null,
  },
  {
    taskName: "Content Training: Training to internalize the content of PL courses, curricula, or coaching framework. ",
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

export const copyEditorTaskOptions: TaskDetails[] = [
  {
    taskName: "Copy Editing",
    "Tier 1": 40,
    "Tier 2": 45,
    "Tier 3": 50,
    maxHours: null,
  },
]

export const copyRightPermissionsTaskOptions: TaskDetails[] = [
  {
    taskName: "Copy Right Permissions",
    "Tier 1": 40,
    "Tier 2": 45,
    "Tier 3": 50,
    maxHours: null,
  },
]

export const presentationDesignTaskOptions: TaskDetails[] = [
  {
    taskName: "Presentation Design",
    "Tier 1": 40,
    "Tier 2": 45,
    "Tier 3": 50,
    maxHours: null,
  },
]
export const contentDeveloperTaskOptions: TaskDetails[] = [
  {
    taskName: "Content Development",
    "Tier 1": 70,
    "Tier 2": 85,
    "Tier 3": 100,
    maxHours: null,
  },
]

export const dataEvaluationTaskOptions: TaskDetails[] = [
  {
    taskName: "Data Evaluation",
    "Tier 1": 27,
    "Tier 2": null,
    "Tier 3": null,
    maxHours: null,
  },
]


export const REMINDER_ITEMS: ReminderItem[] = [
  {
    title: "Submission Deadline:",
    content:
      "Ensure to submit your payment as soon as possible on the day of your work. If you need to submit a payment for a previous month, please contact the finance team.",
  },
];
