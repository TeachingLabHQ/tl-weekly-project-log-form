import { ProjectLogRows, ProjectMember } from "~/domains/project/model";

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
  console.log(
    "programProjectsWithBudgetedHours",
    programProjectsWithBudgetedHours
  );
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
