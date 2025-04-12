import { ProjectMember } from "./model";
import { ProjectRepository } from "./repository";

export function projectService(projectRepository: ProjectRepository) {
  return {
    fetchAllProjects: async () => {
      const { data: allProjects } = await projectRepository.fetchAllProjects();
      allProjects
        ?.find((project) => project.projectType === "Program-related Project")
        ?.projects.sort((a, b) => a.localeCompare(b));
      allProjects
        ?.find((project) => project.projectType === "Internal Project")
        ?.projects.sort((a, b) => a.localeCompare(b));
      return { data: allProjects };
    },
    fetchProgramProjectsStaffing: projectRepository.fetchProgramProjects,
    fetchProgramProjectsWithHours:
      projectRepository.fetchProgramProjectWithHours,
    fetchAllBudgetedHours: projectRepository.fetchAllBudgetedHours,
  };
}
