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
    "Tier 1": null,
    "Tier 2": null,
    "Tier 3": null,
    maxHours: null,
  },
];
