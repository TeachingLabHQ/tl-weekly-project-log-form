import { CoachFacilitatorRepository } from "./repository";

export function coachFacilitatorService(
  coachFacilitatorRepository: CoachFacilitatorRepository
) {
  return {
    fetchCoachFacilitatorDetails:
      coachFacilitatorRepository.fetchCoachFacilitatorDetails,
  };
}
