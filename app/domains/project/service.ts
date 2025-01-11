import { ProjectMember } from "./model";
import { ProjectRepository } from "./repository";

export function projectService(projectRepository: ProjectRepository) {
  return {
    fetchAllProjects: projectRepository.fetchAllProjects,
    fetchProgramProjectsStaffing: projectRepository.fetchProgramProjects,
    fetchProgramProjectsWithHours:
      projectRepository.fetchProgramProjectWithHours,
  };
}
