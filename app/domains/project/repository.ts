import { Errorable } from "../../utils/errorable";
import { fetchMondayData } from "../utils";
import {
  ProgramProject,
  ProgramProjectWithHours,
  ProjectMember,
} from "./model";

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
        const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_SERVICE_CLIENTEMAIL;
        const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_SERVICE_PRIVATEKEY;
        const client = new google.auth.JWT({
          email: GOOGLE_CLIENT_EMAIL,
          key: GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          scopes: [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive",
          ],
        });

        const sheets = google.sheets({ version: "v4", auth: client });
        const data = await sheets.spreadsheets.values.get({
          spreadsheetId: "1XQ5X2ZFiorz2mgYX_Td3tpvkOoEUACeZZFdXVpwhf5c",
          range: "Estimated Hours",
          majorDimension: "ROWS",
        });
        const rows = data.data.values as string[][];
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
