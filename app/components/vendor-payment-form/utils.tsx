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
  {
    title: "FY26 Facilitation Payment Guide:",
    content: (
      <>
        Please review the{" "}
        <a
          href="https://docs.google.com/document/d/1N8FOqieDQWt0sGJH1pFqyMnWv4Rb4ykmuvlhBShWrfA/edit?tab=t.0"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "underline" }}
        >
          FY26 Facilitation Payment Guide
        </a>{" "}
        for detailed information about payment processes and requirements.
      </>
    ),
  },
];

export const shouldExcludeVendorPaymentDate = (date: Date): boolean => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();
  
  const dateMonth = date.getMonth();
  const dateYear = date.getFullYear();
  
  // If today is 6th or earlier, allow prior month dates + ALL current month dates
  if (currentDay <= 6) {
    const priorMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const priorMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Allow all prior month dates
    if (dateYear === priorMonthYear && dateMonth === priorMonth) {
      return false; // Don't exclude prior month dates
    }
    
    // Allow ALL current month dates (including future dates)
    if (dateYear === currentYear && dateMonth === currentMonth) {
      return false; // Don't exclude any current month dates
    }
  } else {
    // If today is 7th or later, only allow current month dates from today onwards
    if (dateYear === currentYear && dateMonth === currentMonth && date >= today) {
      return false; // Don't exclude current month dates from today onwards
    }
  }
  
  // Exclude all other dates
  return true;
};
