import { Errorable } from "../../utils/errorable";
import { fetchMondayData } from "../utils";
import { EmployeeProfile } from "./model";

export interface EmployeeRepository {
  fetchEmployee(email: string): Promise<Errorable<EmployeeProfile>>;
}

export function employeeRepository(): EmployeeRepository {
  return {
    fetchEmployee: async (email: string) => {
      try {
        let queryEmployee = `{boards(ids:2227132353) {items_page (limit: 1, query_params: {rules: [{column_id: "text25", compare_value: ["${email}"]}], operator: and}) { items { name column_values(ids:"dropdown7"){text}}}}}`;
        const result = await fetchMondayData(queryEmployee);
        const isEmployeePresent =
          result.data.boards[0].items_page.items.length === 0 ? false : true;

        if (!isEmployeePresent)
          return {
            data: null,
            error: new Error("Employee does not exist on Monday"),
          };
        const businessFunction: string =
          result.data.boards[0].items_page.items[0]["column_values"][0]["text"];
        const name: string = result.data.boards[0].items_page.items[0]["name"];
        const employeeInfo = { name, email, businessFunction };
        return { data: employeeInfo, error: null };
      } catch (error) {
        console.error("Error fetching data:", error);
        return {
          data: null,
          error: new Error("fetchEmployee() went wrong"),
        };
      }
    },
  };
}
