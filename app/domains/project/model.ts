export type ProjectMember = {
  name: string;
  role: string;
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
