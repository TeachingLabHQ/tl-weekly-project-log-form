import { Errorable } from "../../utils/errorable";
import { fetchMondayData } from "../utils";

export interface CoachFacilitatorDetails {
  email: string;
  name: string;
  tier: string;
}

export interface CoachFacilitatorRepository {
  fetchCoachFacilitatorDetails(
    email: string
  ): Promise<Errorable<CoachFacilitatorDetails | null>>;
}

export function coachFacilitatorRepository(): CoachFacilitatorRepository {
  return {
    fetchCoachFacilitatorDetails: async (email: string) => {
      try {
        // Query to fetch coach/facilitator details from Monday board
        const query = `{
          boards(ids: 2208860812) {
            items_page(limit: 500) {
              items {
                name
                column_values(ids: ["text60", "color__1"]) {
                  column {
                    title
                  }
                  text
                }
              }
            }
          }
        }`;

        const result = await fetchMondayData(query);
        const items = result.data.boards[0].items_page.items;

        // Find the matching item by email
        const matchingItem = items.find((item: any) => {
          const emailValue = item.column_values.find(
            (col: any) => col.column.title === "Email"
          )?.text;
          return emailValue === email;
        });

        if (!matchingItem) {
          return { data: null, error: null };
        }

        // Extract the required information
        const name = matchingItem.name;
        const tier =
          matchingItem.column_values.find(
            (col: any) => col.column.title === "Tier"
          )?.text || "";

        const coachFacilitatorInfo: CoachFacilitatorDetails = {
          email,
          name,
          tier,
        };

        return { data: coachFacilitatorInfo, error: null };
      } catch (error) {
        console.error("Error fetching coach/facilitator data:", error);
        return {
          data: null,
          error: new Error("fetchCoachFacilitatorDetails() went wrong"),
        };
      }
    },
  };
}
