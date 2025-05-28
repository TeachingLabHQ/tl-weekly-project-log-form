import { Errorable } from "../../utils/errorable";
import { fetchMondayData } from "../utils";
import {
  ProgramProject,
  ProjectMember,
  projectsByTypes
} from "./model";


export interface ProjectRepository {
  fetchAllProjects(): Promise<Errorable<projectsByTypes[]>>;
  fetchProgramProjects(): Promise<Errorable<ProgramProject[]>>;
  fetchBudgetedHours(
    employeeEmail: string,
    projectName: string,
    projectRole: string
  ): Promise<Errorable<number>>;
  fetchAllBudgetedHours(): Promise<Errorable<any>>;
}

export function projectRepository(): ProjectRepository {
  return {
    fetchAllProjects: async () => {
      try {
        const query =
          "{boards(ids: 4271509592) { items_page (limit:500) { items { name group{title} }}}}";
        const rawMondayData = await fetchMondayData(query);
        const rawItemData = rawMondayData.data.boards[0].items_page.items;
        const internalProjectsList = rawItemData.filter((i: any) => {
          return i.group.title == "Internal Project";
        });
        const programProjectsList = rawItemData.filter((i: any) => {
          return i.group.title == "Program Project";
        });

        const allProjectsList = [
          {
            projectType: "Program-related Project",
            projects: programProjectsList.map((p: any) => p.name),
          },
          {
            projectType: "Internal Project",
            projects: internalProjectsList.map((p: any) => p.name),
          },
        ];
        return { data: allProjectsList, error: null };
      } catch (e) {
        return {
          data: null,
          error: new Error("fetchAllProjects() went wrong"),
        };
      }
    },

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

        // keep the active projects in group FY25 Active Program Project Teams and FY25 Active Content Project Teams
        rawStaffingList.data.boards[0].items_page.items =
          rawStaffingList.data.boards[0].items_page.items.filter(
            (i: { group: { id: string } }) =>
              i.group.id === "1661883063_fy23_programs_team_" || i.group.id === "new_group97925"
          );
        const staffingList = rawStaffingList.data.boards[0].items_page.items;
        let programProjectsList: ProgramProject[] = [];
        for (const staffedProject of staffingList) {
          let programProject: ProgramProject = {
            projectName: "",
            projectMembers: [],
          };
          //use the projecet name from the Project Log Name column
          programProject.projectName = staffedProject["column_values"].find(
            (c: { column: { title: string }; title: string }) =>
              c.column.title === "Project Log Name"
          ).text;
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
                    projectName: programProject.projectName,
                    budgetedHours: undefined,
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
          error: new Error("fetchProgramProjects() went wrong"),
        };
      }
    },
    fetchBudgetedHours: async (
      employeeEmail: string,
      projectName: string,
      projectRole: string
    ) => {
      try {
        const query = `{
          boards(ids: 8577820151) {
            items_page(limit: 500) {
              items {
                column_values(ids: ["email_mknhbhe0", "dropdown_mknk8zwg", "color_mknhq0s3", "numeric_mknhqm6d"]) {
                  column {
                    title
                  }
                  text
                  value
                }
              }
            }
          }
        }`;

        const rawMondayData = await fetchMondayData(query);
        const items = rawMondayData.data.boards[0].items_page.items;

        // Find the matching item
        const matchingItem = items.find((item: any) => {
          const emailValue = item.column_values.find(
            (col: any) => col.column.title === "Email"
          )?.text;
          const projectValue = item.column_values.find(
            (col: any) => col.column.title === "Project Name"
          )?.text;
          const roleValue = item.column_values.find(
            (col: any) => col.column.title === "Project Role"
          )?.text;

          return (
            emailValue === employeeEmail &&
            projectValue === projectName &&
            roleValue === projectRole
          );
        });

        if (!matchingItem) {
          return {
            data: null,
            error: new Error("No matching budgeted hours found"),
          };
        }

        // Get the budgeted hours value
        const budgetedHoursValue = matchingItem.column_values.find(
          (col: any) => col.column.title === "Budgeted Hours/Week"
        )?.value;

        if (!budgetedHoursValue) {
          return {
            data: null,
            error: new Error("Budgeted hours value not found"),
          };
        }

        // Parse the value to a number
        const budgetedHours = parseFloat(budgetedHoursValue);
        if (isNaN(budgetedHours)) {
          return {
            data: null,
            error: new Error("Invalid budgeted hours value"),
          };
        }

        return { data: budgetedHours, error: null };
      } catch (e) {
        console.error(e);
        return {
          data: null,
          error: new Error("fetchBudgetedHours() went wrong"),
        };
      }
    },
    fetchAllBudgetedHours: async (): Promise<Errorable<number>> => {
      try {
        const query = `{
          boards(ids: 8577820151) {
            items_page(limit: 500) {
              items {
                id
                name
                column_values(ids: [
                  "email_mknhbhe0", 
                  "numeric_mknhqm6d", 
                  "dropdown_mknk8zwg", 
                  "color_mknhq0s3"
                ]) {
                  id
                  text
                  ... on StatusValue {
                    label
                  }
                  column {
                    title
                  }
                }
              }
            }
          }
        }`;

        const rawMondayData = await fetchMondayData(query);
        const items = rawMondayData.data.boards[0].items_page.items;
        

        return { data: items, error: null };
      } catch (e) {
        console.error(e);
        return {
          data: null,
          error: new Error("fetchAllBudgetedHours() went wrong"),
        };
      }
    }
  };
}
