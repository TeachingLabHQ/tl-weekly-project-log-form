import { ProjectLogRows, ProjectMember } from "~/domains/project/model";
import { ExecutiveAssistantMapping } from "./executive-assistant-selector";

export const projectRolesList = [
  "Analyst",
  "Client/Partnership Manager",
  "Coach Coordinator",
  "Facilitator/Coach",
  "Instructional Designer",
  "Project Lead",
  "Project Sponsor",
  "Project Management Support",
  "Subject Matter Expert",
  "Tech Engineer/Developer",
  "Other",
];

export const isProjectLogComplete = (log: {
  projectType: string;
  projectRole: string;
  projectName: string;
  workHours: string;
}) => {
  return (
    log.projectType !== "" &&
    log.projectRole !== "" &&
    log.projectName !== "" &&
    log.workHours !== ""
  );
};

export const getPreAssignedProgramProjects = (
  programProjectsStaffing: any,
  programProjectsWithBudgetedHours: any,
  rows: {
    projectType: string;
    projectName: string;
    projectRole: string;
    workHours: string;
    budgetedHours: string;
  }[],
  setRows: React.Dispatch<
    React.SetStateAction<
      {
        projectType: string;
        projectName: string;
        projectRole: string;
        workHours: string;
        budgetedHours: string;
      }[]
    >
  >,
  userName: string
) => {
  let projectMembersInfo: ProjectLogRows[] = [];
  if (programProjectsStaffing) {
    for (const project of programProjectsStaffing) {
      const { projectName, projectMembers } = project;
      const member = projectMembers.find(
        (member: any) => member.name === userName
      );
      if (member) {
        projectMembersInfo.push({
          projectType: "Program-related Project",
          projectRole: member.role,
          projectName: projectName,
          workHours: "",
          budgetedHours: "N/A",
        });
      }
    }
  }
  //get budgeted hours
  for (const member of projectMembersInfo) {
    const projectRoleIdx = programProjectsWithBudgetedHours[1].findIndex(
      (v: string) => v === member.projectRole
    );
    const budgetedHours = programProjectsWithBudgetedHours.find(
      (p: (string | undefined)[]) => p[0] === member.projectName
    )[projectRoleIdx];
    member.budgetedHours = budgetedHours;
  }
  if (projectMembersInfo.length > 0) {
    setRows(projectMembersInfo);
  }
  return projectMembersInfo;
};

export const getBudgetedHours = (
  projectName: string,
  projectRole: string,
  programProjectsWithBudgetedHours: any
) => {
  const projectRoleIdx = programProjectsWithBudgetedHours[1].findIndex(
    (v: string) => v === projectRole
  );
  const projectRow = programProjectsWithBudgetedHours.find(
    (p: (string | undefined)[]) => p[0] === projectName
  );
  if (projectRow) {
    return projectRow[projectRoleIdx];
  }
  return "N/A";
};

export const handleProjectTypeByTeam = (businessFunction: string) => {
  const projectTypes = ["Internal Project", "Program-related Project"];

  switch (businessFunction) {
    case "Operations&Technology":
      return projectTypes;
    case "Finance":
      return projectTypes;
    case "Strategy & Communications":
      return ["Internal Project"];
    case "People & Culture":
      return projectTypes;
    case "Strategic Growth & Marketing":
      return ["Program-related Project"];
    case "Program":
      return ["Program-related Project"];
    case "Innovation Studio":
      return projectTypes;
    case "Learning & Research":
      return projectTypes;
    case "Office of the CEO":
      return projectTypes;
    case "Shared Operations":
      return projectTypes;
    case "Facilitation":
      return projectTypes;
    case "":
      return projectTypes;
    default:
      return projectTypes;
  }
};

export const updateTotalWorkHours = (
  updatedProjectLogEntries: ProjectLogRows[],
  setTotalWorkHours: React.Dispatch<React.SetStateAction<number>>
) => {
  let totalWorkHours = 0;
  for (const projectLog of updatedProjectLogEntries) {
    const { workHours } = projectLog;
    totalWorkHours += Number(workHours);
  }
  setTotalWorkHours(totalWorkHours);
};

export const executiveAssistantMappings: ExecutiveAssistantMapping[] = [
  {
    executiveAssistantEmail: "savanna.worthington@teachinglab.org",
    executiveName: "HaMy Vu",
    executiveEmail: "hamy.vu@teachinglab.org",
  },
  {
    executiveAssistantEmail: "alli.franken@teachinglab.org",
    executiveName: "Sarah Johnson",
    executiveEmail: "sarah.johnson@teachinglab.org",
  },
];

export const getClosestMonday = (date: Date, onChange: boolean): Date => {
  const currentMonday = new Date(date);
  const dayOfWeek = currentMonday.getDay();
  // Adjust to closest Monday
  currentMonday.setDate(
    currentMonday.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
  );
  // Calculate the last week's Monday
  const lastMonday = new Date(currentMonday);
  lastMonday.setDate(currentMonday.getDate() - 7);

  // If today is between Thursday and Sunday, return current Monday
  if (dayOfWeek >= 4 || dayOfWeek === 0 || (dayOfWeek === 1 && onChange)) {
    //ensure a Monday is returned
    if (currentMonday.getDay() === 1) {
      return currentMonday;
    }
    currentMonday.setDate(
      currentMonday.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
    );
    return currentMonday;
  }
  //if today is between Monday and Wednesday, return last Monday
  //ensure a Monday is returned
  if (lastMonday.getDay() === 1) {
    return lastMonday;
  }
  lastMonday.setDate(
    lastMonday.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
  );
  return lastMonday;
};

export const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Enter") {
    e.preventDefault();
  }
};
