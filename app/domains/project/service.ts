import { ProjectMember } from "./model";
import { ProjectRepository } from "./repository";

export function projectService(projectRepository: ProjectRepository) {
  return {
    fetchProgramProjectsStaffing: projectRepository.fetchProgramProjects,
    fetchProgramProjectsWithHours:
      projectRepository.fetchProgramProjectWithHours,
  };
}
