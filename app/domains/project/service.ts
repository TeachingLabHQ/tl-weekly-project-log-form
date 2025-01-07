import { ProjectRepository } from "./repository";

export function projectService(projectRepository: ProjectRepository) {
  return {
    fetchProgramProjects: projectRepository.fetchProgramProjects,
    fetchProgramProjectWithHours:
      projectRepository.fetchProgramProjectWithHours,
  };
}
