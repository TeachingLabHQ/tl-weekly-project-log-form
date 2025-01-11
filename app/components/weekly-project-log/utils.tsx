import { ProjectMember } from "~/domains/project/model";

export const getPreAssignedProgramProjects = (
  programProjectsStaffing: any,
  programProjectsWithBudgetedHours: any,
  userName: string
) => {
  let projectMembers: ProjectMember[] = [];
  if (programProjectsStaffing) {
    for (const project of programProjectsStaffing) {
      const { projectName, projectMembers } = project;
      const member = projectMembers.find(
        (member: any) => member.name === userName
      );
      if (member) {
        projectMembers.push({
          name: member.name,
          role: member.role,
          projectName: projectName,
          budgetedHour: undefined,
        });
      }
    }
  }
  //get budgeted hours
  for (const memeber of projectMembers) {
    const projectRoleIdx = programProjectsWithBudgetedHours[0].findIndex(
      (v: string) => v === memeber.name
    );
  }
};
