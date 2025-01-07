import { Errorable } from "../../utils/errorable";
import { fetchMondayData } from "../utils";
import {
  ProgramProject,
  ProgramProjectWithHours,
  ProjectMember,
} from "./model";
import { GoogleAuth } from "google-auth-library";

import { google } from "googleapis";

export interface ProjectRepository {
  fetchProgramProjects(): Promise<Errorable<ProgramProject[]>>;
  fetchProgramProjectWithHours(): Promise<Errorable<String[][]>>;
}
export function projectRepository(): ProjectRepository {
  return {
    fetchProgramProjects: async () => {
      try {
        // Define the query to fetch staffing data from Monday
        const firstQuery = `{
                     boards(ids: 6902955796) {
                      items_page(limit: 500) {
                        cursor 
                        items {
                          name 
                          group {
                            id
                          } 
                          column_values(ids: ["project_log_name8__1", "project_lead2", "project_sponsor", "cpm23", "multiple_person", "sme_knowledge53", "people8", "multiple_person3", "people9"]) {
                            column {
                              title
                            } 
                            text
                          }
                        }
                      }
                    }
                  }`;

        let rawStaffingList = await fetchMondayData(firstQuery);

        let cursor: string | null =
          rawStaffingList.data.boards[0].items_page.cursor;

        while (cursor) {
          const cursorQuery = `{
                      next_items_page(limit: 500, cursor: "${cursor}") {
                        cursor 
                        items {
                          name 
                          group {
                            id
                          } 
                          column_values(ids: ["dropdown7", "project_lead2"]) {
                            column {
                              title
                            } 
                            text
                          }
                        }
                      }
                    }`;

          const rawAdditionalStaffingList = await fetchMondayData(cursorQuery);
          // Add the additional Monday data in the list
          rawStaffingList.data.boards[0].items_page.items =
            rawStaffingList.data.boards[0].items_page.items.concat(
              rawAdditionalStaffingList.data.next_items_page.items
            );

          cursor = rawAdditionalStaffingList.data.next_items_page.cursor;
        }

        // Only keep the active projects (items in group FY25 Active Program Project Teams)
        rawStaffingList.data.boards[0].items_page.items =
          rawStaffingList.data.boards[0].items_page.items.filter(
            (i: { group: { id: string } }) =>
              i.group.id === "1661883063_fy23_programs_team_"
          );
        const staffingList = rawStaffingList.data.boards[0].items_page.items;
        let programProjectsList: ProgramProject[] = [];
        for (const staffedProject of staffingList) {
          let programProject: ProgramProject = {
            projectName: "",
            projectMembers: [],
          };
          programProject.projectName = staffedProject.name;
          let projectMembers: ProjectMember[] = [];
          for (const projectMember of staffedProject["column_values"]) {
            //the names are Monday profile names
            if (projectMember.text) {
              const members = projectMember.text
                .split(",")
                .map((member: string) => {
                  return {
                    name: member.trim(),
                    role: projectMember.column.title,
                  };
                });
              projectMembers.push(...members);
            }
          }
          programProject.projectMembers = projectMembers;
          programProjectsList.push(programProject);
        }

        return { data: programProjectsList, error: null };
      } catch (e) {
        console.error(e);
        return {
          data: null,
          error: new Error("fetchProgramProjects went wrong"),
        };
      }
    },
    fetchProgramProjectWithHours: async () => {
      try {
        ///why JWT gives issue i thought remix is SSR
        // const keysEnvVar = import.meta.env.VITE_GOOGLE_SERVICE_CREDENTIALS;
        // if (!keysEnvVar) {
        //   throw new Error("The $CREDS environment variable was not found!");
        // }
        // const keys = JSON.parse(keysEnvVar);
        // const SCOPES = [
        //   "https://www.googleapis.com/auth/spreadsheets.readonly",
        // ];
        // const auth = new GoogleAuth({
        //   credentials: {
        //     client_email: keys.client_email,
        //     private_key: keys.private_key,
        //   },
        //   scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        // });
        // const authClient = await auth.getClient();
        // const googleSheets = google.sheets({
        //   version: "v4",
        //   auth: authClient as any,
        // });
        // const data = await googleSheets.spreadsheets.values.get({
        //   spreadsheetId: "1XQ5X2ZFiorz2mgYX_Td3tpvkOoEUACeZZFdXVpwhf5c",
        //   range: "Estimated Hours",
        //   majorDimension: "ROWS",
        // });
        // const rows = data.data.values as string[][];
        // let budgetedHours;
        // console.log(rows[1]);
        // if (rows && rows.length > 2) {
        //   const projectRoleIndex = rows[1]?.findIndex(
        //     (rowItem) => rowItem === projectRole
        //   );
        //   const project = rows.filter((r) => r[0] === projecName);
        //   if (projectRoleIndex && project && project[0]) {
        //     budgetedHours = project[0][projectRoleIndex];
        //   }
        // }
        // console.log(budgetedHours);
        const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY; // You'll need this instead of service account
        if (!API_KEY) {
          throw new Error("Google API key not found in environment variables!");
        }

        const SPREADSHEET_ID = "1XQ5X2ZFiorz2mgYX_Td3tpvkOoEUACeZZFdXVpwhf5c";
        const RANGE = "Estimated Hours";

        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const rows = data.values as string[][];
        console.log(rows);
        return { data: rows, error: null };
      } catch (e) {
        console.error(e);
        return {
          data: null,
          error: new Error("fetchProgramProjectWithHours went wrong"),
        };
      }
    },
  };
}
