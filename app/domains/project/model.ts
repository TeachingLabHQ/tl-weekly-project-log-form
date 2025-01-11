export type ProjectMember = {
  name: string;
  role: string;
  budgetedHour: string | undefined;
  projectName: string | undefined;
};
export type ProgramProject = {
  projectName: string;
  projectMembers: ProjectMember[];
};

export type ProgramProjectWithHours = {
  projectName: string;
  projectRole: string;
  budgetedHours: string;
};
